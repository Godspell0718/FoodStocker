import express from 'express';
import { getSalida, createSalida, updateSalida, deleteSalida, getAllSalidas } from '../Controllers/salidasController.js';   

const router = express.Router()

router.get('/', getAllSalidas);
router.get('/:Id_Salida', getSalida);
router.post('/', createSalida);
router.put('/:Id_Salida', updateSalida);
router.delete('/:Id_Salida', deleteSalida);

export default router;