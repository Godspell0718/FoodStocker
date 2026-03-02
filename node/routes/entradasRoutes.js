import express from 'express';
import authMiddleware from '../middleware/usersmiddleware.js';
import { 
  getAllEntradas, 
  getEntradas, 
  createEntradas, 
  updateEntradas, 
  deleteEntradas,
  getEntradasByLote,
  getEntradasByEstado,
  getEntradasByInsumo,
  registrarSalidaEntrada,
  getEntradasProximasAVencer,
  getStockDisponible,
  actualizarEstados
} from '../controllers/entradasController.js';

const router = express.Router();

//proteccion de rutas en el backend
router.get('/', authMiddleware,getAllEntradas)
router.get('/:id', authMiddleware, getEntradas)
router.post('/', authMiddleware, createEntradas)
router.put('/:id',authMiddleware, updateEntradas)
router.delete('/:id', authMiddleware, deleteEntradas)

// Rutas de consulta por filtros
router.get('/lote/:lote', getEntradasByLote);
router.get('/estado/:estado', getEntradasByEstado);
router.get('/insumo/:idInsumo', getEntradasByInsumo);

// Rutas de operaciones especiales
router.post('/:id/salida', registrarSalidaEntrada);
router.get('/alertas/proximas-vencer', getEntradasProximasAVencer);
router.get('/stock/insumo/:idInsumo', getStockDisponible);

// Ruta administrativa
router.post('/admin/actualizar-estados', actualizarEstados);


export default router;