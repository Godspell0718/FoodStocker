import express from 'express';
import { getAll, getById, createEstado_solicitud, updateEstado_solicitud, deleteEstado_solicitud} from '../controllers/Estado_solicitudController.js'; 

const router = express.Router()

router.get('/', getAll);
router.get('/:Id_estado_solicitud', getById);
router.post('/', createEstado_solicitud);
router.put('/:Id_estado_solicitud', updateEstado_solicitud);
router.delete('/:Id_estado_solicitud', deleteEstado_solicitud);

export default router;