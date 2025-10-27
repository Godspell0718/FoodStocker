import entradasService from "../services/entradasService.js";

export const getAllEntradas = async (req, res) => {
  try {
    const entradas = await entradasService.getAll();
    res.status(200).json(entradas);

  } catch (error) {
    res.status(500).json({ message: error.message });

  }
};

export const getEntradas = async (req, res) => {
  try {
    const entradas = await entradasService.getById(req.params.id);
    res.status(200).json(entradas);

  } catch (error) {
    res.status(404).json({ message: error.message });

  }
};

export const createEntradas = async (req, res) => {
  try {
    const entradas = await entradasService.create(req.body);
    res.status(201).json({ message: "Entrada creada", entradas });

  } catch (error) {
    res.status(400).json({ message: error.message });

  }
};

export const updateEntradas = async (req, res) => {
  try {
    await entradasService.update(req.params.id, req.body);
    res.status(200).json({ message: "Entrada actualizada correctamente" });

  } catch (error) {
    res.status(400).json({ message: error.message });

  }
};

export const deleteEntradas = async (req, res) => {
  try {
    await entradasService.delete(req.params.id);
    res.status(204).send();

  } catch (error) {
    res.status(400).json({ message: error.message });
    
  }
};
