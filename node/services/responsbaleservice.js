import responsableModel from "../models/responsableModel.js";

class responsableServide {
  async getAll() {
    return await responsableModel.findAll();
  }

  async getById(id) {
    const numId = Number(id);
    const responsable = await responsableModel.findByPk(numId); // findByPk usa la primaryKey automáticamente
    if (!responsable) throw new Error("Responsable no encontrado");
    return responsable;
  }

  async create(data) {
    return await responsableModel.create(data);
  }

  async update(id, data) {
    const numId = Number(id);
    const [updated] = await responsableModel.update(data, { where: { Id_Responsable: numId } });

    if (updated === 0) throw new Error("Responsable no encontrado o sin cambios");
    return true;
  }

  async delete(id) {
    const numId = Number(id);
    const deleted = await responsableModel.destroy({ where: { Id_Responsable: numId } });

    if (!deleted) throw new Error("Responsable no encontrado");
    return true;
  }
}

export default new responsableServide();
