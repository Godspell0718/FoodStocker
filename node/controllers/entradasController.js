import EntradasService from '../services/entradasService.js';

// ============================================
// CRUD BÁSICO
// ============================================

export const getAllEntradas = async (req, res) => {
  try {
    const entradas = await EntradasService.getAll();
    res.json(entradas);
  } catch (error) {
    res.status(500).json({ 
      mensaje: 'Error al obtener las entradas',
      error: error.message 
    });
  }
};

export const getEntradas = async (req, res) => {
  try {
    const entrada = await EntradasService.getById(req.params.id);
    res.json(entrada);
  } catch (error) {
    res.status(404).json({ 
      mensaje: error.message 
    });
  }
};

export const createEntradas = async (req, res) => {
  try {
    const nuevaEntrada = await EntradasService.create(req.body);
    res.status(201).json({
      mensaje: 'Entrada creada exitosamente',
      data: nuevaEntrada
    });
  } catch (error) {
    res.status(400).json({ 
      mensaje: 'Error al crear la entrada',
      error: error.message 
    });
  }
};

export const updateEntradas = async (req, res) => {
  try {
    const entradaActualizada = await EntradasService.update(req.params.id, req.body);
    res.json({
      mensaje: 'Entrada actualizada exitosamente',
      data: entradaActualizada
    });
  } catch (error) {
    res.status(400).json({ 
      mensaje: 'Error al actualizar la entrada',
      error: error.message 
    });
  }
};

export const deleteEntradas = async (req, res) => {
  try {
    await EntradasService.delete(req.params.id);
    res.json({ 
      mensaje: 'Entrada eliminada exitosamente' 
    });
  } catch (error) {
    res.status(404).json({ 
      mensaje: error.message 
    });
  }
};

// ============================================
// CONSULTAS POR FILTROS
// ============================================

export const getEntradasByLote = async (req, res) => {
  try {
    const entradas = await EntradasService.getByLote(req.params.lote);
    res.json(entradas);
  } catch (error) {
    res.status(500).json({ 
      mensaje: 'Error al buscar entradas por lote',
      error: error.message 
    });
  }
};

export const getEntradasByEstado = async (req, res) => {
  try {
    const entradas = await EntradasService.getByEstado(req.params.estado.toUpperCase());
    res.json(entradas);
  } catch (error) {
    res.status(400).json({ 
      mensaje: error.message 
    });
  }
};

export const getEntradasByInsumo = async (req, res) => {
  try {
    const entradas = await EntradasService.getByInsumo(req.params.idInsumo);
    res.json(entradas);
  } catch (error) {
    res.status(500).json({ 
      mensaje: 'Error al buscar entradas por insumo',
      error: error.message 
    });
  }
};

// ============================================
// OPERACIONES ESPECIALES
// ============================================

export const registrarSalidaEntrada = async (req, res) => {
  try {
    const { cantidadSalida } = req.body;
    
    if (!cantidadSalida || cantidadSalida <= 0) {
      return res.status(400).json({ 
        mensaje: 'Debe proporcionar una cantidad de salida válida' 
      });
    }

    const entradaActualizada = await EntradasService.registrarSalida(
      req.params.id, 
      parseInt(cantidadSalida)
    );
    
    res.json({
      mensaje: 'Salida registrada exitosamente',
      data: entradaActualizada
    });
  } catch (error) {
    res.status(400).json({ 
      mensaje: error.message 
    });
  }
};

export const getEntradasProximasAVencer = async (req, res) => {
  try {
    // Obtener días desde query params, por defecto 7
    const dias = parseInt(req.query.dias) || 7;
    
    const entradas = await EntradasService.getProximasAVencer(dias);
    
    res.json({
      mensaje: `Entradas que vencen en los próximos ${dias} días`,
      total: entradas.length,
      data: entradas
    });
  } catch (error) {
    res.status(500).json({ 
      mensaje: 'Error al obtener entradas próximas a vencer',
      error: error.message 
    });
  }
};

export const getStockDisponible = async (req, res) => {
  try {
    const stock = await EntradasService.getStockDisponiblePorInsumo(req.params.idInsumo);
    res.json(stock);
  } catch (error) {
    res.status(500).json({ 
      mensaje: 'Error al obtener stock disponible',
      error: error.message 
    });
  }
};

// ============================================
// ADMINISTRACIÓN
// ============================================

export const actualizarEstados = async (req, res) => {
  try {
    const actualizaciones = await EntradasService.actualizarTodosLosEstados();
    
    res.json({
      mensaje: 'Estados actualizados exitosamente',
      totalActualizados: actualizaciones.length,
      cambios: actualizaciones
    });
  } catch (error) {
    res.status(500).json({ 
      mensaje: 'Error al actualizar estados',
      error: error.message 
    });
  }
};