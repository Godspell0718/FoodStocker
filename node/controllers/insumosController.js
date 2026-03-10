import ServInsumos from "../services/insumosServices.js";
import entradasModel from "../models/entradasModel.js";
import Insumo from "../models/insumosModel.js";

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

export const deletedInsumo = async (req, res) => {
    try {
        await ServInsumos.delete(req.params.id);
        res.status(200).json({ Message: 'Insumo eliminado correctamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export const getInsumosConStock = async (req, res) => {
    try {
        const insumos = await Insumo.findAll({
            order: [['Id_Insumos', 'DESC']],
            include: [{
                model: entradasModel,
                as: 'entradas',
                attributes: ['Can_Inicial', 'Can_Salida', 'Estado'],
                where: { Estado: 'STOCK' },
                required: false
            }]
        });

        const result = insumos.map(ins => {
            const stock = (ins.entradas || []).reduce((acc, e) => {
                return acc + (e.Can_Inicial - e.Can_Salida);
            }, 0);
            return { ...ins.toJSON(), stockReal: stock };
        });

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const getInsumosConLotes = async (req, res) => {
    try {
        const insumos = await Insumo.findAll({
            include: [{
                model: entradasModel,
                as: 'entradas',
                attributes: ['Id_Entradas', 'Lote', 'Fec_Ven_Entrada', 'Can_Inicial', 'Can_Salida', 'Estado'],
                where: { Estado: 'STOCK' },
                required: false,
                order: [['Fec_Ven_Entrada', 'ASC']]
            }],
            order: [['Nom_Insumo', 'ASC']]
        });
        res.status(200).json(insumos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
