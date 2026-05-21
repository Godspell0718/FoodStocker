import PerdidasService from '../services/perdidasService.js';

export const getAllPerdidas = async (req, res) => {
    try {
        const perdidas = await PerdidasService.getAll();
        res.json(perdidas);
    } catch (error) {
        res.status(500).json({ 
            mensaje: 'Error al obtener los reportes de pérdida',
            error: error.message 
        });
    }
};

export const getPerdida = async (req, res) => {
    try {
        const perdida = await PerdidasService.getById(req.params.id);
        res.json(perdida);
    } catch (error) {
        res.status(404).json({ mensaje: error.message });
    }
};

export const createPerdida = async (req, res) => {
    try {
        const nuevaPerdida = await PerdidasService.create(req.body);
        res.status(201).json({
            mensaje: 'Reporte de pérdida creado exitosamente',
            data: nuevaPerdida
        });
    } catch (error) {
        res.status(400).json({ 
            mensaje: 'Error al crear el reporte de pérdida',
            error: error.message 
        });
    }
};

export const updatePerdida = async (req, res) => {
    try {
        const perdidaActualizada = await PerdidasService.update(req.params.id, req.body);
        res.json({
            mensaje: 'Reporte de pérdida actualizado exitosamente',
            data: perdidaActualizada
        });
    } catch (error) {
        res.status(400).json({ 
            mensaje: 'Error al actualizar el reporte',
            error: error.message 
        });
    }
};

export const deletePerdida = async (req, res) => {
    try {
        await PerdidasService.delete(req.params.id);
        res.json({ mensaje: 'Reporte eliminado exitosamente' });
    } catch (error) {
        res.status(404).json({ mensaje: error.message });
    }
};
