import express from 'express';
import { getAll, getById, createSolicitud, updatesolicitud, deletesolicitud} from '../controllers/SolicitudController.js';
const router = express.Router()

router.get('/', getAll);
router.get('/:Id_solicitud', getById);
router.post('/', createSolicitud);
router.put('/:Id_solicitud', updatesolicitud);
router.delete('/:Id_solicitud', deletesolicitud );

export default router;
