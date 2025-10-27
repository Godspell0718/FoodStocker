import ProveedorService from "../services/proveedoresService.js";

export const getAllProveedores = async (_req, res) => {
  try {
    const proveedores = await ProveedorService.getAll();
    res.status(200).json(proveedores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProveedor = async (req, res) => {
  try {
    const proveedor = await ProveedorService.getById(req.params.id);
    res.status(200).json(proveedor);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createProveedor = async (req, res) => {
  try {
    const proveedor = await ProveedorService.create(req.body);
    res.status(201).json({ message: "Proveedor creado", proveedor });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProveedor = async (req, res) => {
  try {
    await ProveedorService.update(req.params.id, req.body);
    res.status(200).json({ message: "Proveedor actualizado correctamente" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const deleteProveedor = async (req, res) => {
  try {
    await ProveedorService.delete(req.params.id);
    res.status(200).json({ message: "Proveedor eliminado correctamente" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
