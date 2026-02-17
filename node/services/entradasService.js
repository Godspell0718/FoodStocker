import entradasModel from "../models/entradasModel.js";
import responsablesModel from "../models/responsablesModel.js";
import ProveedorModel from "../models/proveedoresModel.js";
import insumoModel from "../models/insumosModel.js";
import { Op } from 'sequelize';

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
      const fechaVencimiento = new Date(entrada.Fec_Ven_Entrada);
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
    // Eliminar Vlr_Total y Estado si vienen en los datos
    const { Vlr_Total, Estado, ...dataToCreate } = data;
    
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
    // Eliminar Vlr_Total y Estado si vienen en los datos
    const { Vlr_Total, Estado, ...dataToUpdate } = data;

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
    const deleted = await entradasModel.destroy({ 
      where: { Id_Entradas: id } 
    });
    if (!deleted) throw new Error("Entrada no encontrada");
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