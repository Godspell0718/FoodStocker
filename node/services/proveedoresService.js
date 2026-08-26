import ProveedorModel from "../models/proveedoresModel.js";
import entradasModel from "../models/entradasModel.js";

class ProveedorService {
  async getAll() {
    return await ProveedorModel.findAll({
      order:[['Id_Proveedor', 'DESC']]
    });
  }

  async getById(id) {
    const numId = Number(id);
    const proveedor = await ProveedorModel.findByPk(numId);
    if (!proveedor) throw new Error("Proveedor no encontrado");
    return proveedor;
  }

  async create(data) {
    return await ProveedorModel.create(data);
  }

  async update(id, data) {
    const numId = Number(id);
    const [updated] = await ProveedorModel.update(data, { where: { Id_Proveedor: numId } });
    if (updated === 0) throw new Error("Proveedor no encontrado o sin cambios");
    return true;
  }

  async delete(id) {
    const numId = Number(id);
    const proveedor = await ProveedorModel.findByPk(numId);
    if (!proveedor) throw new Error("Proveedor no encontrado");

    // Verificar si tiene entradas asociadas
    const entriesCount = await entradasModel.count({ where: { Id_Proveedor: numId } });

    if (entriesCount > 0 || proveedor.Estado === 'ACTIVO') {
      const nuevoEstado = proveedor.Estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
      await proveedor.update({ Estado: nuevoEstado });
      return { inactived: true, nuevoEstado };
    } else {
      await proveedor.destroy();
      return { deleted: true };
    }
  }
}

export default new ProveedorService();
