import ServAlmacen from "../services/serv_almacen.js";

export const getAllAlmacen = async (req, res) => {
    try {
        const almacenes = await ServAlmacen.getAll();
        res.status(200).json(almacenes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const getAlmacen = async (req, res) => {
    try {
        const almacen = await ServAlmacen.getById(req.params.id);
        res.status(200).json(almacen);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export const createAlmacen = async (req, res) => {
    try {
        const newAlmacen = await ServAlmacen.create(req.body);
        res.status(201).json({ 
            Message: 'Almacén creado correctamente', 
            newAlmacen 
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export const updateAlmacen = async (req, res) => {
    try {
        const updatedAlmacen = await ServAlmacen.update(req.params.id, req.body);
        res.status(200).json({ 
            Message: 'Almacén actualizado correctamente', 
            updatedAlmacen 
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export const deleteAlmacen = async (req, res) => { 
    try {
        await ServAlmacen.delete(req.params.id);
        res.status(200).json({ 
            Message: 'Almacén eliminado correctamente'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}