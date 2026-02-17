import express from 'express';
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

// Rutas básicas CRUD
router.get('/', getAllEntradas);
router.get('/:id', getEntradas);
router.post('/', createEntradas);
router.put('/:id', updateEntradas);
router.delete('/:id', deleteEntradas);

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