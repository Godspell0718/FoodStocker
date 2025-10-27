import Insumo from "../models/mod_insumos.js"; 
class ServInsumos {
    async getAll() {
        return await Insumo.findAll(); 
    }

    async getById(id) {
        const insumo = await Insumo.findByPk(id); 
        if (!insumo) { 
            throw new Error('Insumo no encontrado');
        }
        return insumo;
    }

    async create(data) {
        const newInsumo = await Insumo.create(data); 
        return newInsumo;
    }

    async update(id, data) {
        const result = await Insumo.update(data, { 
            where: { Id_Insumos: id } 
        });
        const updatedRows = result[0];
        if (updatedRows === 0) {
            throw new Error('Insumo no encontrado o sin cambios');
        }
        return await this.getById(id);
    }

    async delete(id) {
        const deleted = await Insumo.destroy({ 
            where: { Id_Insumos: id } 
        });
        if (deleted === 0) {
            throw new Error('Insumo no encontrado');
        }
        return true;
    }
}

export default new ServInsumos(); 