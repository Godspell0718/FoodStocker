import entradasModel from "../models/entradasModel.js";
import responsablesModel from "../models/responsableModel.js";
import ProveedorModel from "../models/proveedoresModel.js";
import insumoModel from "../models/insumosModel.js";
import insumosSolicitudModel from "../models/insumosSolicitudModel.js";
import perdidaModel from "../models/perdidasModel.js";
import { Op } from 'sequelize';

/** Fecha de vencimiento opcional: vacía o "N/A" se guarda como NULL. */
const normalizarFechaVencimiento = (valor) => {
  if (valor === undefined) return undefined;
  if (valor === null) return null;
  const texto = String(valor).trim();
  if (!texto || texto.toUpperCase() === 'N/A') return null;
  return texto;
};

class EntradasService {
  /**
   * Calcula el estado automáticamente según:
   * 1. Si está vencido (fecha de vencimiento <= hoy) → VENCIDO
   * 2. Si stock restante = 0 → AGOTADO
   * 3. De lo contrario → STOCK
   */
  calcularEstado(entrada) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Ignorar hora, solo fecha

    // Verificar si está vencido
    if (entrada.Fec_Ven_Entrada) {
      // Fec_Ven_Entrada es DATEONLY ('YYYY-MM-DD'). `new Date('YYYY-MM-DD')` lo interpreta
      // como medianoche UTC, lo que en Colombia (UTC-5) lo corre un día atrás.
      // Por eso se construye la fecha en hora local.
      const raw = entrada.Fec_Ven_Entrada;
      const match = typeof raw === 'string' ? raw.match(/^(\d{4})-(\d{2})-(\d{2})/) : null;
      const fechaVencimiento = match
        ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
        : new Date(raw);
      fechaVencimiento.setHours(0, 0, 0, 0);

      if (fechaVencimiento <= hoy) {
        return 'VENCIDO';
      }
    }

    // Verificar si está agotado
    const stockRestante = entrada.Can_Inicial - entrada.Can_Salida;
    if (stockRestante <= 0) {
      return 'AGOTADO';
    }

    // Por defecto está en stock
    return 'STOCK';
  }

  /**
   * Actualiza el estado de una entrada basándose en su información actual
   */
  async actualizarEstadoAutomatico(id) {
    const entrada = await entradasModel.findByPk(id);
    if (!entrada) throw new Error("Entrada no encontrada");

    const nuevoEstado = this.calcularEstado({
      Fec_Ven_Entrada: entrada.Fec_Ven_Entrada,
      Can_Inicial: entrada.Can_Inicial,
      Can_Salida: entrada.Can_Salida
    });

    if (entrada.Estado !== nuevoEstado) {
      await entradasModel.update(
        { Estado: nuevoEstado },
        { where: { Id_Entradas: id } }
      );
    }

    return nuevoEstado;
  }

  /**
   * Actualiza los estados de todas las entradas
   * Útil para ejecutar en un cron job diario
   */
  async actualizarTodosLosEstados() {
    const entradas = await entradasModel.findAll();
    const actualizaciones = [];

    for (const entrada of entradas) {
      const nuevoEstado = this.calcularEstado({
        Fec_Ven_Entrada: entrada.Fec_Ven_Entrada,
        Can_Inicial: entrada.Can_Inicial,
        Can_Salida: entrada.Can_Salida
      });

      if (entrada.Estado !== nuevoEstado) {
        actualizaciones.push({
          id: entrada.Id_Entradas,
          estadoAnterior: entrada.Estado,
          estadoNuevo: nuevoEstado
        });

        await entradasModel.update(
          { Estado: nuevoEstado },
          { where: { Id_Entradas: entrada.Id_Entradas } }
        );
      }
    }

    return actualizaciones;
  }

  async getAll() {
    const entradas = await entradasModel.findAll({
      order: [['Id_Entradas', 'DESC']], // 🔥 agregado
      include: [
        {
          model: ProveedorModel,
          as: 'proveedor'
        },
        {
          model: responsablesModel,
          as: 'pasante'
        },
        {
          model: responsablesModel,
          as: 'instructor'
        },
        {
          model: insumoModel,
          as: 'insumo'
        }
      ]
    });

    // Actualizar estados antes de retornar
    for (const entrada of entradas) {
      await this.actualizarEstadoAutomatico(entrada.Id_Entradas);
    }

    // Volver a consultar para obtener los estados actualizados
    return await entradasModel.findAll({
      order: [['Id_Entradas', 'DESC']], // 🔥 agregado
      include: [
        {
          model: ProveedorModel,
          as: 'proveedor'
        },
        {
          model: responsablesModel,
          as: 'pasante'
        },
        {
          model: responsablesModel,
          as: 'instructor'
        },
        {
          model: insumoModel,
          as: 'insumo'
        }
      ]
    });
  }
  async getById(id) {
    // Actualizar estado antes de consultar
    await this.actualizarEstadoAutomatico(id);

    const entrada = await entradasModel.findByPk(id, {
      include: [
        {
          model: ProveedorModel,
          as: 'proveedor'
        },
        {
          model: responsablesModel,
          as: 'pasante'
        },
        {
          model: responsablesModel,
          as: 'instructor'
        },
        {
          model: insumoModel,
          as: 'insumo'
        }
      ]
    });

    if (!entrada) throw new Error("Entrada no encontrada");
    return entrada;
  }

  async create(data) {
    const { Estado, ...dataToCreate } = data;
    dataToCreate.Fec_Ven_Entrada = normalizarFechaVencimiento(dataToCreate.Fec_Ven_Entrada) ?? null;

    // Validar campos requeridos
    const camposRequeridos = [
      'Lote',
      'Can_Inicial',
      'Id_Proveedor',
      'Id_Pasante',
      'Id_Instructor',
      'Id_Insumos'
    ];

    for (const campo of camposRequeridos) {
      if (dataToCreate[campo] === undefined || dataToCreate[campo] === null) {
        throw new Error(`El campo ${campo} es requerido`);
      }
    }

    // Si no viene Can_Salida, iniciarlo en 0
    if (dataToCreate.Can_Salida === undefined || dataToCreate.Can_Salida === null) {
      dataToCreate.Can_Salida = 0;
    }

    // Calcular Vlr_Total automáticamente si viene Vlr_Unitario y Can_Inicial y no fue provisto explícitamente
    if (dataToCreate.Vlr_Total !== undefined && dataToCreate.Vlr_Total !== null && dataToCreate.Vlr_Total !== '') {
      dataToCreate.Vlr_Total = Number(dataToCreate.Vlr_Total);
    } else if (dataToCreate.Vlr_Unitario !== undefined && dataToCreate.Vlr_Unitario !== null && dataToCreate.Vlr_Unitario !== '') {
      const vUnit = Number(dataToCreate.Vlr_Unitario);
      const cInit = Number(dataToCreate.Can_Inicial);
      dataToCreate.Vlr_Total = (!isNaN(vUnit) && !isNaN(cInit)) ? Math.round(vUnit * cInit) : null;
    } else {
      dataToCreate.Vlr_Total = null;
    }

    // Asegurar que la unidad de medida provenga del insumo seleccionado
    if (dataToCreate.Id_Insumos) {
      const insumo = await insumoModel.findByPk(dataToCreate.Id_Insumos);
      if (insumo && insumo.Uni_medida) {
        dataToCreate.Uni_medida = insumo.Uni_medida;
      }
    }

    // Calcular el estado inicial automáticamente
    const estadoInicial = this.calcularEstado({
      Fec_Ven_Entrada: dataToCreate.Fec_Ven_Entrada,
      Can_Inicial: dataToCreate.Can_Inicial,
      Can_Salida: dataToCreate.Can_Salida
    });

    dataToCreate.Estado = estadoInicial;

    const nuevaEntrada = await entradasModel.create(dataToCreate);
    return await this.getById(nuevaEntrada.Id_Entradas);
  }

  async update(id, data) {
    const entradaExistente = await entradasModel.findByPk(id);
    if (!entradaExistente) throw new Error("Entrada no encontrada");

    // 🚫 Requerimiento 8: Bloquear edición si ya fue utilizada
    if (entradaExistente.Can_Salida > 0) {
      throw new Error("No es posible editar esta entrada porque ya presenta consumos o salidas registradas.");
    }

    const { Estado, ...dataToUpdate } = data;
    if ('Fec_Ven_Entrada' in dataToUpdate) {
      dataToUpdate.Fec_Ven_Entrada = normalizarFechaVencimiento(dataToUpdate.Fec_Ven_Entrada);
    }

    // Recalcular Vlr_Total si se actualiza Vlr_Unitario o Can_Inicial
    const vUnitRaw = dataToUpdate.Vlr_Unitario !== undefined ? dataToUpdate.Vlr_Unitario : entradaExistente.Vlr_Unitario;
    const cInitRaw = dataToUpdate.Can_Inicial !== undefined ? dataToUpdate.Can_Inicial : entradaExistente.Can_Inicial;

    if (dataToUpdate.Vlr_Total !== undefined && dataToUpdate.Vlr_Total !== null && dataToUpdate.Vlr_Total !== '') {
      dataToUpdate.Vlr_Total = Number(dataToUpdate.Vlr_Total);
    } else if (vUnitRaw !== undefined && vUnitRaw !== null && vUnitRaw !== '') {
      const vUnit = Number(vUnitRaw);
      const cInit = Number(cInitRaw);
      dataToUpdate.Vlr_Total = (!isNaN(vUnit) && !isNaN(cInit)) ? Math.round(vUnit * cInit) : null;
    } else {
      dataToUpdate.Vlr_Total = null;
    }

    // Asegurar que la unidad de medida se mantenga alineada con el insumo
    if (dataToUpdate.Id_Insumos) {
      const insumo = await insumoModel.findByPk(dataToUpdate.Id_Insumos);
      if (insumo && insumo.Uni_medida) {
        dataToUpdate.Uni_medida = insumo.Uni_medida;
      }
    }

    const [updated] = await entradasModel.update(dataToUpdate, {
      where: { Id_Entradas: id }
    });

    if (updated === 0) throw new Error("Entrada no encontrada o sin cambios");

    // Recalcular y actualizar el estado automáticamente
    await this.actualizarEstadoAutomatico(id);

    // Retornar el registro actualizado
    return await this.getById(id);
  }

  async delete(id) {
    const entrada = await entradasModel.findByPk(id);
    if (!entrada) throw new Error("Entrada no encontrada");

    if (Number(entrada.Can_Salida) > 0) {
      throw new Error("No es posible eliminar esta entrada porque ya presenta consumos o salidas registradas.");
    }

    const tieneSolicitudes = await insumosSolicitudModel.count({ where: { Id_Entradas: id } });
    if (tieneSolicitudes > 0) {
      throw new Error("No es posible eliminar esta entrada porque está vinculada a solicitudes registradas.");
    }

    const tienePerdidas = await perdidaModel.count({ where: { Id_Entrada: id } });
    if (tienePerdidas > 0) {
      throw new Error("No es posible eliminar esta entrada porque está vinculada a reportes de pérdida.");
    }

    await entrada.destroy();
    return true;
  }

  // Métodos adicionales útiles

  async getByLote(lote) {
    const entradas = await entradasModel.findAll({
      where: { Lote: lote },
      include: [
        {
          model: ProveedorModel,
          as: 'proveedor'
        },
        {
          model: insumoModel,
          as: 'insumo'
        }
      ]
    });

    // Actualizar estados
    for (const entrada of entradas) {
      await this.actualizarEstadoAutomatico(entrada.Id_Entradas);
    }

    return await entradasModel.findAll({
      where: { Lote: lote },
      include: [
        {
          model: ProveedorModel,
          as: 'proveedor'
        },
        {
          model: insumoModel,
          as: 'insumo'
        }
      ]
    });
  }

  async getByEstado(estado) {
    if (!['STOCK', 'AGOTADO', 'VENCIDO'].includes(estado)) {
      throw new Error("Estado inválido");
    }

    // Actualizar todos los estados primero
    await this.actualizarTodosLosEstados();

    return await entradasModel.findAll({
      where: { Estado: estado },
      include: [
        {
          model: insumoModel,
          as: 'insumo'
        },
        {
          model: ProveedorModel,
          as: 'proveedor'
        }
      ]
    });
  }

  async getByInsumo(idInsumo) {
    const entradas = await entradasModel.findAll({
      where: { Id_Insumos: idInsumo },
      include: [
        {
          model: insumoModel,
          as: 'insumo'
        },
        {
          model: ProveedorModel,
          as: 'proveedor'
        }
      ]
    });

    // Actualizar estados
    for (const entrada of entradas) {
      await this.actualizarEstadoAutomatico(entrada.Id_Entradas);
    }

    return await entradasModel.findAll({
      where: { Id_Insumos: idInsumo },
      include: [
        {
          model: insumoModel,
          as: 'insumo'
        },
        {
          model: ProveedorModel,
          as: 'proveedor'
        }
      ]
    });
  }

  async registrarSalida(id, cantidadSalida) {
    const entrada = await entradasModel.findByPk(id);
    if (!entrada) throw new Error("Entrada no encontrada");

    const stockRestante = entrada.Can_Inicial - entrada.Can_Salida;

    if (cantidadSalida > stockRestante) {
      throw new Error(`Solo quedan ${stockRestante} unidades disponibles`);
    }

    const nuevaCantidadSalida = entrada.Can_Salida + cantidadSalida;

    // Actualizar cantidad de salida
    await entradasModel.update(
      { Can_Salida: nuevaCantidadSalida },
      { where: { Id_Entradas: id } }
    );

    // El estado se actualizará automáticamente en getById
    return await this.getById(id);
  }

  /**
   * Obtiene entradas próximas a vencer (dentro de X días)
   */
  async getProximasAVencer(dias = 7) {
    const hoy = new Date();
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);

    // Actualizar todos los estados primero
    await this.actualizarTodosLosEstados();

    return await entradasModel.findAll({
      where: {
        Fec_Ven_Entrada: {
          [Op.between]: [hoy, fechaLimite]
        },
        Estado: {
          [Op.ne]: 'VENCIDO' // No incluir los ya vencidos
        }
      },
      include: [
        {
          model: insumoModel,
          as: 'insumo'
        },
        {
          model: ProveedorModel,
          as: 'proveedor'
        }
      ],
      order: [['Fec_Ven_Entrada', 'ASC']]
    });
  }

  /**
   * Obtiene el stock disponible de un insumo
   */
  async getStockDisponiblePorInsumo(idInsumo) {
    const entradas = await entradasModel.findAll({
      where: {
        Id_Insumos: idInsumo,
        Estado: 'STOCK' // Solo contar entradas disponibles
      }
    });

    let stockTotal = 0;
    for (const entrada of entradas) {
      stockTotal += (entrada.Can_Inicial - entrada.Can_Salida);
    }

    return {
      Id_Insumos: idInsumo,
      stockDisponible: stockTotal,
      entradasActivas: entradas.length
    };
  }
}

export default new EntradasService();