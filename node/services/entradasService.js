import entradasModel from "../models/entradasModel.js";

class EntradasService {
  async getAll() {
    return await entradasModel.findAll();
  }

  async getById(id) {
    const entrada = await entradasModel.findByPk(id);
    if (!entrada) throw new Error("Entrada no encontrada");
    return entrada;
  }

  async create(data) {
    return await entradasModel.create(data);
  }

  async update(id, data) {
    const [updated] = await entradasModel.update(data, { where: { Id_Entradas: id } });
    if (updated === 0) throw new Error("Entrada no encontrada o sin cambios");
    return true;
  }

  async delete(id) {
    const deleted = await entradasModel.destroy({ where: { Id_Entradas: id } });
    if (!deleted) throw new Error("Entrada no encontrada");
    return true;
  }
}

export default new EntradasService();
