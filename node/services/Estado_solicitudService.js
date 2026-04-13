import Estado_solicitudModel from '../models/Estado_solicitudModel.js';

class Estado_solicitudService {
  async getAll() {
    return await Estado_solicitudModel.findAll();
  }


  async getById(Id_estado_solicitud) {
    
    const estado_solicitud = await Estado_solicitudModel.findByPk(Id_estado_solicitud); // findByPk usa la primaryKey automáticamente
    if (!estado_solicitud) throw new Error("Estado solicitud no encontrado");
    return estado_solicitud
  }

  async createEstado_solicitud(data) {
    return await Estado_solicitudModel.create(data)
  }

  async updateEstado_solicitud(Id_estado_solicitud, data) {
    
    const [updated] = await Estado_solicitudModel.update(data, { where: {  Id_estado_solicitud } })

    if (updated === 0) throw new Error("Estado solicitud no encontrado o sin cambios")
    return true
  }

  async deleteEstado_solicitud(Id_estado_solicitud) {
    
    const deleted = await Estado_solicitudModel.destroy({ where: {  Id_estado_solicitud } })

    if (!deleted) throw new Error("Estado solicitud no encontrada")
    return true
  }
}

export default new Estado_solicitudService();