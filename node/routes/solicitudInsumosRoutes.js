// routes/solicitudInsumosRoutes.js
import express from 'express';
import { Op } from 'sequelize';
import insumoModel from '../models/insumosModel.js';
import entradasModel from '../models/entradasModel.js';
import InsumosSolicitudModel from '../models/insumosSolicitudModel.js';
import SolicitudModel from '../models/SolicitudModel.js';

const router = express.Router();

// GET /api/solicitud-insumos/disponibles
router.get('/disponibles', async (req, res) => {
  try {
    const { filtro } = req.query;
    
    const whereCondition = filtro 
      ? { Nom_Insumo: { [Op.like]: `%${filtro}%` } }
      : {};

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
      lotes: insumo.entradas?.map(entrada => ({
        Id_Entradas: entrada.Id_Entradas,
        Lote: entrada.Lote,
        cantidadDisponible: entrada.Can_Inicial - entrada.Can_Salida,
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
  try {
    const { idSolicitud, insumosSeleccionados } = req.body;
    
    const solicitud = await SolicitudModel.findByPk(idSolicitud);
    if (!solicitud) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    const resultados = [];

    for (const item of insumosSeleccionados) {
      // Actualizar entrada (lote)
      const entrada = await entradasModel.findByPk(item.idLote);
      if (entrada) {
        const nuevaSalida = entrada.Can_Salida + item.cantidad;
        await entrada.update({ 
          Can_Salida: nuevaSalida,
          Estado: (entrada.Can_Inicial - nuevaSalida) <= 0 ? 'AGOTADO' : 'STOCK'
        });
      }

      // Crear registro en insumos_solicitud
      const nuevoRegistro = await InsumosSolicitudModel.create({
        Id_solicitud: idSolicitud,
        Id_insumos: item.idInsumo,
        cantidad_solicitada: item.cantidad
      });
      
      resultados.push(nuevoRegistro);
    }
    
    res.json({ 
      message: 'Insumos asignados correctamente',
      total: resultados.length
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error al guardar los insumos' });
  }
});

export default router;