import PasanteService from "../services/responsbaleservice.js";

export const getAllresponsables = async (_req, res) => {
  try {
    const pasantes = await PasanteService.getAll();
    res.status(200).json(pasantes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getResponsables = async (req, res) => {
  try {
    const pasante = await PasanteService.getById(req.params.id);
    res.status(200).json(pasante);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createResponsable = async (req, res) => {
  try {
    const pasante = await PasanteService.create(req.body);
    res.status(201).json({ message: "Responsable creado", pasante });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateResponsable = async (req, res) => {
  try {
    await PasanteService.update(req.params.id, req.body);
    res.status(200).json({ message: "Responsable actualizado correctamente" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const deleteResponsable = async (req, res) => {
  try {
    await PasanteService.delete(req.params.id);
    res.status(200).json({ message: "Resposable eliminado correctamente" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

