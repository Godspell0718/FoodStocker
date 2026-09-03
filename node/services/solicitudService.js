import SolicitudModel from "../models/SolicitudModel.js";
import responsablesModel from "../models/responsableModel.js";
import insumosSolicitudModel from "../models/insumosSolicitudModel.js";
import DestinoModel from "../models/destinoModel.js";
import Estado_solicitudModel from "../models/Estado_solicitudModel.js";
import EstadosModel from "../models/EstadosModel.js";

class SolicitudService {

  async getAll() {
    const solicitudes = await SolicitudModel.findAll({
      include: [
        {
          model: responsablesModel,
          as: 'responsable',
          attributes: ['Nom_Responsable']
        },
        {
          model: DestinoModel,
          as: 'destino',
          attributes: ['Nom_Destino', 'Tip_Destino']
        }
      ],
      order: [['Id_solicitud', 'DESC']]
    });

    // Agregar el último estado a cada solicitud
    const result = await Promise.all(solicitudes.map(async (sol) => {
      const ultimoEstadoReg = await Estado_solicitudModel.findOne({
        where: { Id_solicitud: sol.Id_solicitud },
        include: [{ model: EstadosModel, as: 'estado', attributes: ['nom_estado'] }],
        order: [['createdat', 'DESC']]
      });

      return {
        ...sol.toJSON(),
        ultimoEstado: ultimoEstadoReg?.estado?.nom_estado ?? "solicitado"
      };
    }));

    return result;
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
    await insumosSolicitudModel.destroy({
      where: { Id_solicitud }
    });
    const deleted = await SolicitudModel.destroy({
      where: { Id_solicitud }
    });
    if (!deleted) throw new Error("Solicitud no encontrada");
    return true;
  }
}

export default new SolicitudService();