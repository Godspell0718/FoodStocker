import Insumo from "../models/insumosModel.js"; 

/**
 * Normaliza la presentación del insumo (ej. "bulto" de 50000 gr).
 * Es opcional, pero si se envía debe venir completa: tipo + contenido entero > 0.
 */
const normalizarPresentacion = (dataOriginal) => {
    const data = { ...dataOriginal };
    // Unidad siempre en minúsculas y referencia siempre en mayúsculas
    if (data.Uni_medida) data.Uni_medida = String(data.Uni_medida).trim().toLowerCase();
    if (data.Ref_Insumo) data.Ref_Insumo = String(data.Ref_Insumo).trim().toUpperCase();

    const tieneTipo = 'Tip_Presentacion' in data;
    const tieneCant = 'Can_Presentacion' in data;
    if (!tieneTipo && !tieneCant) return data;

    const tipo = data.Tip_Presentacion ? String(data.Tip_Presentacion).trim().toLowerCase() : null;
    const cantRaw = data.Can_Presentacion;
    const cant = (cantRaw === '' || cantRaw === null || cantRaw === undefined) ? null : Number(cantRaw);

    if (!tipo && cant === null) {
        return { ...data, Tip_Presentacion: null, Can_Presentacion: null };
    }
    if (!tipo || cant === null) {
        throw new Error("La presentación debe tener tipo y contenido (o dejar ambos vacíos)");
    }
    if (!Number.isInteger(cant) || cant <= 0) {
        throw new Error("El contenido de la presentación debe ser un número entero mayor a 0");
    }
    return { ...data, Tip_Presentacion: tipo, Can_Presentacion: cant };
};

class ServInsumos {
    async getAll() {
        return await Insumo.findAll({
            order:[['Id_Insumos', 'DESC']]
        });
    }

    async getById(id) {
        const insumo = await Insumo.findByPk(id); 
        if (!insumo) { 
            throw new Error('Insumo no encontrado');
        }
        return insumo;
    }

    async create(data) {
        return await Insumo.create(normalizarPresentacion(data)); 
    }

    async update(id, data) {
        // 🚫 No permitir edición de insumos inactivos
        const insumo = await Insumo.findByPk(id);
        if (!insumo) throw new Error("Insumo no encontrado");
        if (insumo.Estado === 'INACTIVO') {
            throw new Error("No se puede editar un insumo INACTIVO. Actívelo primero.");
        }

        const result = await Insumo.update(normalizarPresentacion(data), { 
            where: { Id_Insumos: id } 
        });
        const updatedRows = result[0];
        if (updatedRows === 0) {
            throw new Error('Insumo no encontrado o sin cambios');
        }
        return true;
    }

    async delete(id) {
        const deleted = await Insumo.destroy({ 
            where: { Id_Insumos: id } 
        });
        if (!deleted) 
            throw new Error('Insumo no encontrado');
        return true;
    }
}

export default new ServInsumos(); 