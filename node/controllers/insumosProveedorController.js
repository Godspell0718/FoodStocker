import InsumosProveedorService from "../services/insumosProveedorService.js";

export const getAllInsumosProveedor = async (req, res) => {
  try {
    const InsumosProveedor = await InsumosProveedorService.getAll();
    res.status(200).json(InsumosProveedor);

  } catch (error) {
    res.status(500).json({ message: error.message });

  }
};

export const getInsumosProveedor = async (req, res) => {
  try {
    const InsumosProveedor = await InsumosProveedorService.getById(req.params.id);
    res.status(200).json(InsumosProveedor);

  } catch (error) {
    res.status(404).json({ message: error.message });

  }
};

export const createInsumosProveedor = async (req, res) => {
  try {
    const InsumosProveedor = await InsumosProveedorService.create(req.body);
    res.status(201).json({ message: "InsumosProveedor creado", InsumosProveedor });

  } catch (error) {
    res.status(400).json({ message: error.message });

  }
};

export const updateInsumosProveedor = async (req, res) => {
  try {
    await InsumosProveedorService.update(req.params.id, req.body);
    res.status(200).json({ message: "InsumosProveedor actualizada correctamente" });

  } catch (error) {
    res.status(400).json({ message: error.message });

  }
};

export const deleteInsumosProveedor = async (req, res) => {
  try {
    await InsumosProveedorService.delete(req.params.id);
    res.status(204).send();

  } catch (error) {
    res.status(400).json({ message: error.message });
    
  }
};
