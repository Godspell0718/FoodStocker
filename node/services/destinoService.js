import DestinoModel from "../models/destinoModel.js";
import SolicitudModel from "../models/SolicitudModel.js";

class DestinoService {
    async getAll() {
        return await DestinoModel.findAll({
            order: [['Id_Destino', 'DESC']]
        });
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
        // 🚫 No permitir edición de destinos inactivos
        const destino = await DestinoModel.findByPk(id);
        if (!destino) throw new Error("Destino no encontrado");
        if (destino.Estado === 'INACTIVO') {
            throw new Error("No se puede editar un destino INACTIVO. Actívelo primero.");
        }

        const result = await DestinoModel.update(data, { where: { Id_Destino: id } })
        const updated = result[0]

        if (updated === 0) throw new Error("Destino no encontrado o sin cambios");

        return true

    }

    async delete(id) {
        const destino = await DestinoModel.findByPk(id);
        if (!destino) throw new Error("Destino no encontrado");

        // Siempre hacer toggle de estado (ACTIVO ↔ INACTIVO)
        const nuevoEstado = destino.Estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        await destino.update({ Estado: nuevoEstado });
        return { inactived: nuevoEstado === 'INACTIVO', nuevoEstado };
    }
}

export default new DestinoService()