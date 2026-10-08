// controllers/insumosController.js
import ServInsumos from "../services/insumosServices.js";
import entradasModel from "../models/entradasModel.js";
import Insumo from "../models/insumosModel.js";
import ProveedorModel from "../models/proveedoresModel.js";

/**
 * Valoriza un insumo a partir de sus entradas:
 *  - Vlr_Unitario: toma directamente el valor unitario registrado en la entrada más reciente.
 *  - Vlr_Total:    mantiene el valor total acumulado de las entradas activas, sin descontarse por salidas de stock.
 */
const valorizarInsumo = (entradas = []) => {
    let stock = 0;
    let totalAcumulado = 0;
    let tieneTotal = false;

    // Ordenar de más reciente a más antigua según Id_Entradas
    const sorted = [...entradas].sort((a, b) => (Number(b.Id_Entradas) || 0) - (Number(a.Id_Entradas) || 0));

    // Vlr_Unitario: toma el valor unitario registrado de la entrada más reciente con precio
    const loteConUnitario = sorted.find(l => l.Vlr_Unitario != null && Number(l.Vlr_Unitario) > 0);
    const Vlr_Unitario = loteConUnitario ? Number(loteConUnitario.Vlr_Unitario) : null;

    for (const lote of entradas) {
        if (lote.Estado !== 'STOCK') continue;
        const disponible = Math.max(Number(lote.Can_Inicial) - Number(lote.Can_Salida), 0);
        stock += disponible;

        const tot = (lote.Vlr_Total != null && lote.Vlr_Total !== '') ? Number(lote.Vlr_Total) : null;
        if (tot != null && Number.isFinite(tot) && tot > 0) {
            totalAcumulado += tot;
            tieneTotal = true;
        } else if (lote.Vlr_Unitario != null && Number(lote.Vlr_Unitario) > 0) {
            totalAcumulado += Number(lote.Vlr_Unitario);
            tieneTotal = true;
        }
    }

    // Si no hay lotes en STOCK pero hay entradas registradas con precio, mantener el último valor total registrado
    if (!tieneTotal && sorted.length > 0) {
        const ultimoConTotal = sorted.find(l => l.Vlr_Total != null && Number(l.Vlr_Total) > 0);
        if (ultimoConTotal) {
            totalAcumulado = Number(ultimoConTotal.Vlr_Total);
            tieneTotal = true;
        }
    }

    return {
        stockReal: stock,
        Vlr_Unitario,
        Vlr_Total: tieneTotal ? Math.round(totalAcumulado) : null
    };
};

export const getAllInsumos = async (req, res) => {
    try {
        const insumos = await ServInsumos.getAll();
        res.status(200).json(insumos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const getInsumo = async (req, res) => {
    try {
        const insumo = await ServInsumos.getById(req.params.id);
        res.status(200).json(insumo);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
}

export const createInsumo = async (req, res) => {
    try {
        const newInsumo = await ServInsumos.create(req.body);
        res.status(201).json({ Message: 'Insumo creado correctamente', newInsumo });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export const updateInsumo = async (req, res) => {
    try {
        const updatedInsumo = await ServInsumos.update(req.params.id, req.body);
        res.status(200).json({ Message: 'Insumo actualizado correctamente', updatedInsumo });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// 🆕 FUNCIÓN TOGGLE ESTADO (INACTIVAR / ACTIVAR)
export const deletedInsumo = async (req, res) => {
    try {
        const insumo = await Insumo.findByPk(req.params.id);
        if (!insumo) {
            return res.status(404).json({ error: 'Insumo no encontrado' });
        }

        const nuevoEstado = insumo.Estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        await insumo.update({ Estado: nuevoEstado });
        return res.status(200).json({ 
            Message: `Insumo ${nuevoEstado === 'ACTIVO' ? 'activado' : 'inactivado'} correctamente`,
            inactived: nuevoEstado === 'INACTIVO',
            nuevoEstado
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// 🆕 FUNCIÓN CON LOTES Y PROVEEDORES (NUEVA)
export const getInsumosConLotes = async (req, res) => {
    try {
        const insumos = await Insumo.findAll({
            include: [{
                model: entradasModel,
                as: 'entradas',
                attributes: ['Id_Entradas', 'Lote', 'Fec_Ven_Entrada', 'Can_Inicial', 'Can_Salida', 'Estado', 'Uni_medida', 'Vlr_Unitario', 'Vlr_Total'],
                // 👇 ELIMINAMOS el where: { Estado: 'STOCK' } para traer TODOS los lotes
                required: false,
                include: [{
                    model: ProveedorModel,
                    as: 'proveedor',
                    attributes: ['Nom_Proveedor']
                }]
            }],
            order: [['Nom_Insumo', 'ASC']]
        });
        const result = insumos.map(ins => {
            const json = ins.toJSON();
            return { ...json, ...valorizarInsumo(json.entradas) };
        });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// 🆕 FUNCIÓN CON STOCK (YA EXISTE PERO LA DEJAMOS)
export const getInsumosConStock = async (req, res) => {
    try {
        const insumos = await Insumo.findAll({
            where: { Estado: 'ACTIVO' },
            order: [['Id_Insumos', 'DESC']],
            include: [{
                model: entradasModel,
                as: 'entradas',
                attributes: ['Id_Entradas', 'Can_Inicial', 'Can_Salida', 'Estado', 'Uni_medida', 'Vlr_Unitario', 'Vlr_Total'],
                where: { Estado: 'STOCK' },
                required: false
            }]
        });

        const result = insumos.map(ins => {
            const json = ins.toJSON();
            return { ...json, ...valorizarInsumo(json.entradas) };
        });

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}