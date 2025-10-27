import express from 'express'
import { getAllEntradas, getEntradas, createEntradas, updateEntradas, deleteEntradas } from '../controllers/data/entradasController.js'


const router = express.Router()

router.get('/', getAllEntradas);
router.get('/:id', getEntradas);
router.post('/', createEntradas);
router.put('/:id', updateEntradas);
router.delete('/:id', deleteEntradas);

export default router;