import express from 'express';
import { getAll, getById, createEstado, updateEstado, deleteEstado } from '../controllers/EstadosController.js';

const router = express.Router()

router.get('/', getAll)
router.get('/:Id_estado', getById)
router.post('/', createEstado)
router.put('/:Id_estado', updateEstado)
router.delete('/:Id_estado', deleteEstado)

export default router;