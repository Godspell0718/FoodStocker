import InsumosProveedorModel from "../models/insumosProveedorModel.js";

class InsumosProveedorService {
  async getAll() {
    return await InsumosProveedorModel.findAll();
  }

  async getById(id) {
    const InsumosProveedor = await InsumosProveedorModel.findByPk(id);
    if (!InsumosProveedor) throw new Error("InsumosProveedor no encontrada");
    return InsumosProveedor;
  }

  async create(data) {
    return await InsumosProveedorModel.create(data);
  }

  async update(id, data) {
    const [updated] = await InsumosProveedorModel.update(data, { where: { Id_InsumosProveedor: id } });
    if (updated === 0) throw new Error("InsumosProveedor no encontrada o sin cambios");
    return true;
  }

  async delete(id) {
    const deleted = await InsumosProveedorModel.destroy({ where: { Id_InsumosProveedor: id } });
    if (!deleted) throw new Error("InsumosProveedor no encontrada");
    return true;
  }
}

export default new InsumosProveedorService();