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
    // 🚫 No permitir edición de proveedores inactivos
    const proveedor = await ProveedorModel.findByPk(numId);
    if (!proveedor) throw new Error("Proveedor no encontrado");
    if (proveedor.Estado === 'INACTIVO') {
      throw new Error("No se puede editar un proveedor INACTIVO. Actívelo primero.");
    }

    const [updated] = await ProveedorModel.update(data, { where: { Id_Proveedor: numId } });
    if (updated === 0) throw new Error("Proveedor no encontrado o sin cambios");
    return true;
  }

  async delete(id) {
    const numId = Number(id);
    const proveedor = await ProveedorModel.findByPk(numId);
    if (!proveedor) throw new Error("Proveedor no encontrado");

    // Siempre hacer toggle de estado (ACTIVO ↔ INACTIVO)
    const nuevoEstado = proveedor.Estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    await proveedor.update({ Estado: nuevoEstado });
    return { inactived: nuevoEstado === 'INACTIVO', nuevoEstado };
  }
}

export default new ProveedorService();
