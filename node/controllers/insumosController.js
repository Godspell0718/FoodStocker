import ServInsumos from "../services/serv_insumos.js";

export const getAllInsumos = async (req, res) => {
    try {
        const insumos = await ServInsumos.getAll();
        res.status(200).json(insumos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const getInsumo = async (req, res) => {
    try {
        const insumo = await ServInsumos.getById(req.params.id);
        res.status(200).json(insumo);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
}

export const createInsumo = async (req, res) => {
    try {
        const newInsumo = await ServInsumos.create(req.body);
        res.status(201).json({ 
            Message: 'Insumo creado correctamente', 
            newInsumo 
        });
    } catch (error) {
        res.status(400).json({ error: error.message });  
    }
}

export const updateInsumo = async (req, res) => {
    try {
        const updatedInsumo = await ServInsumos.update(req.params.id, req.body);
        res.status(200).json({ 
            Message: 'Insumo actualizado correctamente', 
            updatedInsumo 
        });
    } catch (error) {
        res.status(400).json({ error: error.message }); 
    }
}

export const deletedInsumo = async (req, res) => {
    try {
        await ServInsumos.delete(req.params.id);
        res.status(200).json({ 
            Message: 'Insumo eliminado correctamente'
        });
    } catch (error) {
        res.status(400).json({ error: error.message }); 
    }
}