import loteModel from "../models/loteModel.js";

class loteService {
    async getAll() {
        return await loteModel.findAll();
    }

    async getById(id) {

        const lote = await loteModel.findByPk(id)
        if (!lote) throw new Error("lote no encontrado");
        return lote
    }

    async create(data) {
        return await loteModel.create(data)
    }

    async update(id, data) {
        const result = await loteModel.update(data, { where: { Id_Lote:id } })
        const updated = result[0]

        if (updated === 0) throw new Error("lote no encontrado o sin cambios");

        return true
        
    }

    async delete(id) {
        const deleted = await loteModel.destroy({ where: {Id_Lote: id}})

        if (!deleted) throw new Error("Lote no encontrado")
            return true
    }
}

export default new loteService()