import SolicitudModel from "../models/SolicitudModel.js";

class SolicitudService {

  async getAll() {
    return await SolicitudModel.findAll();
  }

  async getById(Id_solicitud) {
    const solicitud = await SolicitudModel.findByPk(Id_solicitud);
    if (!solicitud) throw new Error("Solicitud no encontrada");
    return solicitud;
  }

  async create(data) {
    return await SolicitudModel.create(data);
  }

  async update(Id_solicitud, data) {
    const result = await SolicitudModel.update(data, {
      where: { Id_solicitud }
    });

    if (result[0] === 0)
      throw new Error("Solicitud no encontrada o sin cambios");

    return true;
  }

  async delete(Id_solicitud) {
    const deleted = await SolicitudModel.destroy({
      where: { Id_solicitud }
    });

    if (!deleted) throw new Error("Solicitud no encontrada");
    return true;
  }
}

export default new SolicitudService();
