import Insumo from "../models/insumosModel.js"; 
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
        return await Insumo.create(data); 
    }

    async update(id, data) {
        const result = await Insumo.update(data, { 
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