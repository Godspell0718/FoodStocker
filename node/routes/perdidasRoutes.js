import express from 'express';
import { 
    getAllPerdidas, 
    getPerdida, 
    createPerdida, 
    updatePerdida, 
    deletePerdida 
} from '../controllers/perdidasController.js';

const router = express.Router();

router.get('/', getAllPerdidas);
router.get('/:id', getPerdida);
router.post('/', createPerdida);
router.put('/:id', updatePerdida);
router.delete('/:id', deletePerdida);

export default router;
