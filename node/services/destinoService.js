import DestinoModel from "../models/destinoModel.js";

class DestinoService {
    async getAll() {
        return await DestinoModel.findAll();
    }

    async getById(id) {

        const Destino = await DestinoModel.findByPk(id)
        if (!Destino) throw new Error("Destino no encontrado");
        return Destino
    }

    async create(data) {
        return await DestinoModel.create(data)
    }

    async update(id, data) {
        const result = await DestinoModel.update(data, { where: { Id_Destino:id } })
        const updated = result[0]

        if (updated === 0) throw new Error("Destino no encontrado o sin cambios");

        return true
        
    }

    async delete(id) {
        const deleted = await DestinoModel.destroy({ where: {Id_Destino: id}})

        if (!deleted) throw new Error("Destino no encontrado")
            return true
    }
}

export default new DestinoService()