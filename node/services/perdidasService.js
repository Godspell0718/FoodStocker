import db from '../database/db.js';
import perdidaModel from '../models/perdidasModel.js';
import insumoModel from '../models/insumosModel.js';
import responsableModel from '../models/responsableModel.js';
import entradaModel from '../models/entradasModel.js';
import {
    ajustarSalidaLote,
    obtenerLoteBloqueado,
    parsearCantidadEntera
} from './stockHelpers.js';

import { Op } from 'sequelize';

class PerdidasService {
    static async getAll() {
        return await perdidaModel.findAll({
            include: [
                { model: insumoModel, attributes: ['Nom_Insumo', 'Uni_medida'] },
                { model: responsableModel, attributes: ['Nom_Responsable'] },
                { model: entradaModel, attributes: ['Lote', 'Uni_medida'] }
            ],
            order: [['createdAt', 'DESC']]
        });
    }

    static async getById(id, { transaction } = {}) {
        const perdida = await perdidaModel.findByPk(id, {
            include: [
                { model: insumoModel, attributes: ['Nom_Insumo', 'Uni_medida'] },
                { model: responsableModel, attributes: ['Nom_Responsable'] },
                { model: entradaModel, attributes: ['Lote', 'Uni_medida'] }
            ],
            transaction
        });
        if (!perdida) {
            throw new Error('Reporte de pérdida no encontrado');
        }
        return perdida;
    }

    static async create(data) {
        const cantidad = parsearCantidadEntera(data.Cantidad, 'cantidad de pérdida');
        const t = await db.transaction();

        try {
            if (data.Id_Entrada) {
                // Bloquea el lote, valida disponibilidad y recalcula su estado (sin reactivar vencidos)
                await ajustarSalidaLote(data.Id_Entrada, cantidad, t);
            }

            const nuevaPerdida = await perdidaModel.create(
                { ...data, Cantidad: cantidad },
                { transaction: t }
            );

            await t.commit();
            return nuevaPerdida;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    static async update(id, data) {
        const t = await db.transaction();

        try {
            const perdida = await perdidaModel.findByPk(id, {
                transaction: t,
                lock: t.LOCK.UPDATE
            });
            if (!perdida) throw new Error('Reporte de pérdida no encontrado');

            const nuevaCantidad = data.Cantidad !== undefined
                ? parsearCantidadEntera(data.Cantidad, 'cantidad de pérdida')
                : Number(perdida.Cantidad);

            const entradaViejaId = perdida.Id_Entrada ? Number(perdida.Id_Entrada) : null;
            const entradaNuevaId = data.Id_Entrada !== undefined
                ? (data.Id_Entrada ? Number(data.Id_Entrada) : null)
                : entradaViejaId;

            if (entradaViejaId === entradaNuevaId) {
                // Mismo lote: ajustar solo la diferencia
                if (entradaViejaId) {
                    const delta = nuevaCantidad - Number(perdida.Cantidad);
                    await ajustarSalidaLote(entradaViejaId, delta, t);
                }
            } else {
                // Cambió de lote: devolver al lote viejo y descontar del nuevo
                if (entradaViejaId) {
                    await ajustarSalidaLote(entradaViejaId, -Number(perdida.Cantidad), t, { requerido: false });
                }
                if (entradaNuevaId) {
                    await ajustarSalidaLote(entradaNuevaId, nuevaCantidad, t);
                }
            }

            const updateData = { ...data };
            if (data.Cantidad !== undefined) updateData.Cantidad = nuevaCantidad;

            await perdida.update(updateData, { transaction: t });

            await t.commit();
            return await this.getById(id);
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    static async delete(id) {
        const t = await db.transaction();

        try {
            const perdida = await perdidaModel.findByPk(id, {
                transaction: t,
                lock: t.LOCK.UPDATE
            });
            if (!perdida) throw new Error('Reporte de pérdida no encontrado');

            // Restituir stock al lote usando el helper seguro (no reactiva vencidos)
            if (perdida.Id_Entrada) {
                await ajustarSalidaLote(perdida.Id_Entrada, -Number(perdida.Cantidad), t, { requerido: false });
            }

            await perdida.destroy({ transaction: t });

            await t.commit();
            return true;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    // 🔄 Requerimiento 9: Agregar automáticamente insumos vencidos
    static async cargarVencidosAutomaticos(idResponsable) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const t = await db.transaction();

        try {
            const entradasVencidas = await entradaModel.findAll({
                where: {
                    Fec_Ven_Entrada: { [Op.lte]: hoy }
                },
                order: [['Id_Entradas', 'ASC']],
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            const perdidasCreadas = [];

            for (const entrada of entradasVencidas) {
                const stockDisponible = Number(entrada.Can_Inicial) - Number(entrada.Can_Salida);
                if (stockDisponible > 0) {
                    const perdida = await perdidaModel.create({
                        Id_Insumo: entrada.Id_Insumos,
                        Id_Entrada: entrada.Id_Entradas,
                        Cantidad: stockDisponible,
                        Motivo: 'VENCIMIENTO',
                        Observaciones: `Cargado automáticamente por fecha de vencimiento expirada (Lote ${entrada.Lote}, Venció: ${entrada.Fec_Ven_Entrada})`,
                        Id_Responsable: idResponsable || entrada.Id_Instructor || entrada.Id_Pasante || 1
                    }, { transaction: t });

                    // Agotar completamente el lote vencido
                    entrada.Can_Salida = entrada.Can_Inicial;
                    entrada.Estado = 'VENCIDO';
                    await entrada.save({ transaction: t });

                    perdidasCreadas.push(perdida);
                }
            }

            await t.commit();
            return perdidasCreadas;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }
}

export default PerdidasService;
