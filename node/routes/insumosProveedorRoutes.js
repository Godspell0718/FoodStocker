import express from 'express'
import { getAllInsumosProveedor, getInsumosProveedor, createInsumosProveedor, updateInsumosProveedor, deleteInsumosProveedor } from '../controllers/data/InsumosProveedorController.js'


const router = express.Router()

router.get('/', getAllInsumosProveedor);
router.get('/:id', getInsumosProveedor);
router.post('/', createInsumosProveedor);
router.put('/:id', updateInsumosProveedor);
router.delete('/:id', deleteInsumosProveedor);

export default router;