import PasanteService from "../services/pasanteservice.js";

export const getAllPasantes = async (_req, res) => {
  try {
    const pasantes = await PasanteService.getAll();
    res.status(200).json(pasantes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPasante = async (req, res) => {
  try {
    const pasante = await PasanteService.getById(req.params.id);
    res.status(200).json(pasante);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createPasante = async (req, res) => {
  try {
    const pasante = await PasanteService.create(req.body);
    res.status(201).json({ message: "Pasante creado", pasante });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePasante = async (req, res) => {
  try {
    await PasanteService.update(req.params.id, req.body);
    res.status(200).json({ message: "Pasante actualizado correctamente" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const deletePasante = async (req, res) => {
  try {
    await PasanteService.delete(req.params.id);
    res.status(200).json({ message: "Pasante eliminado correctamente" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

