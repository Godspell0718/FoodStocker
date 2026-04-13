import express from 'express';
import { getInsumosBySolicitud } from '../controllers/SolicitudController.js';
import { crearSolicitudCompleta} from '../controllers/SolicitudControllerNuevo.js'
import { getAll, getById, createSolicitud, updatesolicitud, deletesolicitud, getSolicitudesPendientes, cambiarEstadoSolicitud} from '../controllers/SolicitudController.js';
const router = express.Router()

router.get('/', getAll);
router.post('/', createSolicitud);
router.get('/pendientes', getSolicitudesPendientes);
router.post('/cambiar-estado', cambiarEstadoSolicitud);
router.post('/completa', crearSolicitudCompleta)
router.get('/:Id_solicitud/insumos', getInsumosBySolicitud);
router.get('/:Id_solicitud', getById);
router.put('/:Id_solicitud', updatesolicitud);
router.delete('/:Id_solicitud', deletesolicitud );

export default router;