// routes/solicitudInsumosRoutes.js
import express from 'express';
import { Op } from 'sequelize';
import db from '../database/db.js';
import insumoModel from '../models/insumosModel.js';
import entradasModel from '../models/entradasModel.js';
import InsumosSolicitudModel from '../models/insumosSolicitudModel.js';
import SolicitudModel from '../models/SolicitudModel.js';
import { ajustarSalidaLote, parsearCantidadEntera, loteEstaVencido } from '../services/stockHelpers.js';
import { obtenerEstadoActual } from '../services/SolicitudServiceNuevo.js';

const router = express.Router();

// GET /api/solicitud-insumos/disponibles
router.get('/disponibles', async (req, res) => {
  try {
    const { filtro } = req.query;

    const whereCondition = filtro
      ? { Nom_Insumo: { [Op.like]: `%${filtro}%` }, Estado: 'ACTIVO' }
      : { Estado: 'ACTIVO' };

    const insumos = await insumoModel.findAll({
      where: whereCondition,
      include: [{
        model: entradasModel,
        as: 'entradas',
        where: {
          Can_Inicial: { [Op.gt]: 0 },
          Estado: 'STOCK'
        },
        required: false,
        order: [['Fec_Ven_Entrada', 'ASC']]
      }],
      limit: 50
    });

    const insumosFormateados = insumos.map(insumo => ({
      Id_Insumos: insumo.Id_Insumos,
      Nom_Insumo: insumo.Nom_Insumo,
      Uni_medida: insumo.Uni_medida,
      lotes: insumo.entradas
        ?.filter(entrada => !loteEstaVencido(entrada))
        .map(entrada => ({
          Id_Entradas: entrada.Id_Entradas,
          Lote: entrada.Lote,
          cantidadDisponible: Math.max(Number(entrada.Can_Inicial) - Number(entrada.Can_Salida), 0),
          Fec_Ven_Entrada: entrada.Fec_Ven_Entrada,
          Uni_medida: entrada.Uni_medida,
          seleccionado: false
        })) || []
    }));

    res.json(insumosFormateados);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error al cargar insumos' });
  }
});

// POST /api/solicitud-insumos/guardar-seleccion
router.post('/guardar-seleccion', async (req, res) => {
  const { idSolicitud, insumosSeleccionados } = req.body;

  if (!idSolicitud || !Array.isArray(insumosSeleccionados) || insumosSeleccionados.length === 0) {
    return res.status(400).json({ message: 'Solicitud o insumos seleccionados no válidos' });
  }

  const t = await db.transaction();

  try {
    const solicitud = await SolicitudModel.findByPk(idSolicitud, {
      transaction: t,
      lock: t.LOCK.UPDATE
    });
    if (!solicitud) {
      await t.rollback();
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    const estadoActual = await obtenerEstadoActual(idSolicitud, t);
    if (estadoActual === 'despachado' || estadoActual === 'cancelado') {
      await t.rollback();
      return res.status(400).json({ message: `No se pueden asignar insumos a una solicitud ${estadoActual}` });
    }

    const resultados = [];
    // Ordenar por ID de lote para evitar deadlocks
    const ordenados = [...insumosSeleccionados].sort((a, b) => Number(a.idLote) - Number(b.idLote));

    for (const item of ordenados) {
      const cantidad = parsearCantidadEntera(item.cantidad, 'cantidad solicitada');
      const idLote = Number(item.idLote);
      const idInsumo = Number(item.idInsumo);

      // Bloquea el lote, valida disponibilidad y recalcula estado
      await ajustarSalidaLote(idLote, cantidad, t);

      // Crear registro en insumos_solicitud
      const nuevoRegistro = await InsumosSolicitudModel.create({
        Id_solicitud: idSolicitud,
        Id_insumos: idInsumo,
        Id_Entradas: idLote,
        cantidad_solicitada: cantidad
      }, { transaction: t });

      resultados.push(nuevoRegistro);
    }

    await t.commit();

    res.json({
      message: 'Insumos asignados correctamente',
      total: resultados.length
    });
  } catch (error) {
    await t.rollback();
    console.error('Error al guardar selección:', error);
    res.status(400).json({ message: error.message || 'Error al guardar los insumos' });
  }
});

export default router;