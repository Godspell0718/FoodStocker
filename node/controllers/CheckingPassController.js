import express from 'express';

import {
  crearEntrada,
  verEntradas,
  crearSolicitud,
  verSolicitudes,
  cambiarEstadoSolicitud,
  crearInsumo,
  verInsumos,
  crearProveedor,
  asignarProveedor
} from '../controllers/CheckingPassController.js';

import authMiddleware from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleOtherMiddleware.js';

const router = express.Router();


router.post('/entradas/crear', authMiddleware, authorizeRoles('PA', 'IA'), crearEntrada);
router.get('/entradas/ver', authMiddleware, authorizeRoles('PA', 'IA', 'PDU'), verEntradas);

router.post('/solicitudes/crear', authMiddleware, authorizeRoles('PDU', 'IDU'), crearSolicitud);
router.get('/solicitudes/ver', authMiddleware, authorizeRoles('PA', 'IA', 'PDU'), verSolicitudes);
router.put('/solicitudes/estado', authMiddleware, authorizeRoles('PA', 'IA'), cambiarEstadoSolicitud);

router.post('/insumos/crear', authMiddleware, authorizeRoles('PA', 'IA'), crearInsumo);
router.get('/insumos/ver', authMiddleware, authorizeRoles('PA', 'IA', 'PDU', 'IDU'), verInsumos);

router.post('/proveedores/crear', authMiddleware, authorizeRoles('IA'), crearProveedor);
router.post('/proveedores/asignar', authMiddleware, authorizeRoles('IA'), asignarProveedor);


export default router;