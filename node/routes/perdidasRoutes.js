import express from 'express';
import { 
    getAllPerdidas, 
    getPerdida, 
    createPerdida, 
    updatePerdida, 
    deletePerdida,
    cargarVencidos 
} from '../controllers/perdidasController.js';

const router = express.Router();

router.get('/', getAllPerdidas);
router.post('/cargar-vencidos', cargarVencidos);
router.get('/:id', getPerdida);
router.post('/', createPerdida);
router.put('/:id', updatePerdida);
router.delete('/:id', deletePerdida);

export default router;
