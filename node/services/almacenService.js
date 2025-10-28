import Almacen from "../models/almacenModel.js";

class almacenService {
    async getAll() {
        return await Almacen.findAll();
    }

    async getById(id) {
        const almacen = await Almacen.findByPk(id);
        if (!almacen) { 
            throw new Error('Almacen no encontrado');
        }
        return almacen;
    }

    async create(data) {
        const newAlmacen = await Almacen.create(data);
        return newAlmacen;
    }

    async update(id, data) {
        const result = await Almacen.update(data, { 
            where: { Id_Almacen: id } 
        });
        const updatedRows = result[0];
        if (updatedRows === 0) {
            throw new Error('Almacen no encontrado o sin cambios');
        }
        return await this.getById(id);
    }

    async delete(id) {
        const deleted = await Almacen.destroy({ 
            where: { Id_Almacen: id } 
        });
        if (deleted === 0) {
            throw new Error('Almacen no encontrado');
        }
        return true;
    }
}

export default new almacenService();