import PasanteModel from "../models/responsablesModel.js";

class PasanteService {
  async getAll() {
    return await PasanteModel.findAll();
  }

  async getById(id) {
    const numId = Number(id);
    const pasante = await PasanteModel.findByPk(numId); // findByPk usa la primaryKey automáticamente
    if (!pasante) throw new Error("Pasante no encontrado");
    return pasante;
  }

  async create(data) {
    return await PasanteModel.create(data);
  }

  async update(id, data) {
    const numId = Number(id);
    const [updated] = await PasanteModel.update(data, { where: { Id_Pasante: numId } });

    if (updated === 0) throw new Error("Pasante no encontrado o sin cambios");
    return true;
  }

  async delete(id) {
    const numId = Number(id);
    const deleted = await PasanteModel.destroy({ where: { Id_Pasante: numId } });

    if (!deleted) throw new Error("Pasante no encontrado");
    return true;
  }
}

export default new PasanteService();
