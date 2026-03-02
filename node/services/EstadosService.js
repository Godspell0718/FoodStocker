import EstadosModel from '../models/EstadosModel.js';

class EstadosService {
  async getAll() {
    return await EstadosModel.findAll();
  }

  async getById(Id_estado) {
    
    const estado = await EstadosModel.findByPk(Id_estado); // findByPk usa la primaryKey automáticamente
    if (!estado) throw new Error("Estado no encontrado");
    return estado                                                                   
  }

  async create(data) {
    return await EstadosModel.create(data);
  }

  async update (Id_estado, data) {
    
    const [updated] = await EstadosModel.update(data, { where: { Id_estado } });

    if (updated === 0) throw new Error("Estado no encontrado o sin cambios");
    return true
  }

  async delete(Id_estado) {
    
    const deleted = await EstadosModel.destroy({ where: {  Id_estado } });

    if (!deleted) throw new Error("Estado no encontrado");
    return true
  }
}

export default new EstadosService();