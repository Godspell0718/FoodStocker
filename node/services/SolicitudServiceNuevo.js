import { Op } from "sequelize";
import db from "../database/db.js";
import SolicitudModel from "../models/SolicitudModel.js";
import insumosSolicitudModel from "../models/insumosSolicitudModel.js";
import entradasModel from "../models/entradasModel.js";
import Estado_solicitudModel from "../models/Estado_solicitudModel.js";
import EstadosModel from "../models/EstadosModel.js";

class SolicitudServiceNuevo {

    async crearCompleta({ Id_Responsable, Fec_entrega, motivo, Descripcion, Ficha, Id_Destino, insumos }) {

        const t = await db.transaction();

        try {
            const nuevaSolicitud = await SolicitudModel.create(
                {
                    Id_Responsable,
                    Fec_entrega,
                    motivo,
                    Descripcion,
                    Ficha,
                    Id_Destino
                },
                { transaction: t }
            );

            const Id_solicitud = nuevaSolicitud.Id_solicitud;

            // Registrar estado inicial (1 = solicitado)
            await Estado_solicitudModel.create(
                {
                    Id_solicitud,
                    Id_estado: 1,
                    fecha: new Date()
                },
                { transaction: t }
            );

            for (const item of insumos) {

                const { Id_insumos, cantidad_solicitada, Id_Entradas } = item;

                const lote = await entradasModel.findOne({
                    where: {
                        Id_Entradas: Id_Entradas
                    },
                    transaction: t
                });

                if (!lote) {
                    throw new Error(`Lote #${Id_Entradas} no encontrado`);
                }

                const disponible = lote.Can_Inicial - lote.Can_Salida;

                if (disponible < cantidad_solicitada) {
                    throw new Error(`Stock insuficiente en el lote ${lote.Lote} (Disponible: ${disponible}, Solicitado: ${cantidad_solicitada})`);
                }

                const nuevaSalida = lote.Can_Salida + cantidad_solicitada;
                const nuevoStock = lote.Can_Inicial - nuevaSalida;

                await entradasModel.update(
                    {
                        Can_Salida: nuevaSalida,
                        Estado: nuevoStock <= 0 ? 'AGOTADO' : 'STOCK'
                    },
                    {
                        where: { Id_Entradas: lote.Id_Entradas },
                        transaction: t
                    }
                );

                // 🔥 GUARDAR EL LOTE
                await insumosSolicitudModel.create(
                    {
                        Id_solicitud,
                        Id_insumos,
                        Id_Entradas,
                        cantidad_solicitada
                    },
                    { transaction: t }
                );
            }

            await t.commit();
            return nuevaSolicitud;

        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    async cambiarEstado({ Id_solicitud, Id_estado, motivo_cancelacion }) {

        const t = await db.transaction();

        try {

            // 🔴 SI CANCELA → DEVOLVER STOCK Y GUARDAR MOTIVO
            if (Id_estado === 4) {

                // Guardar motivo de cancelación en la solicitud
                await SolicitudModel.update(
                    { motivo_cancelacion: motivo_cancelacion },
                    { where: { Id_solicitud }, transaction: t }
                );

                const insumos = await insumosSolicitudModel.findAll({
                    where: { Id_solicitud },
                    transaction: t
                });

                for (const item of insumos) {

                    const lote = await entradasModel.findOne({
                        where: { Id_Entradas: item.Id_Entradas },
                        transaction: t
                    });

                    if (!lote) continue;

                    // 🎯 Si la solicitud ya tenía novedad registrada (entrega parcial),
                    // en Can_Salida sólo quedaba retendida la 'cantidad_entregada'.
                    // Si no tenía novedad, quedaba retenida la 'cantidad_solicitada' completa.
                    const cantidadRetenida = (item.cantidad_entregada !== null && item.cantidad_entregada !== undefined)
                        ? item.cantidad_entregada
                        : item.cantidad_solicitada;

                    const nuevaSalida = Math.max(lote.Can_Salida - cantidadRetenida, 0);
                    const stockReal = lote.Can_Inicial - nuevaSalida;

                    await entradasModel.update(
                        {
                            Can_Salida: nuevaSalida,
                            Estado: stockReal > 0 ? 'STOCK' : 'AGOTADO'
                        },
                        {
                            where: { Id_Entradas: lote.Id_Entradas },
                            transaction: t
                        }
                    );
                }
            }

            // Guardar estado
            const estado = await Estado_solicitudModel.create({
                Id_solicitud,
                Id_estado,
                fecha: new Date()
            }, { transaction: t });

            await t.commit();
            return estado;

        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    /**
     * Registra una novedad de entrega: ajusta las cantidades entregadas
     * y devuelve la diferencia al stock del lote correspondiente.
     * Soporta re-edición: si ya existía una novedad previa, primero revierte
     * el ajuste anterior y luego aplica el nuevo.
     */
    async registrarNovedad({ Id_solicitud, observacion, items }) {

        const t = await db.transaction();

        try {
            // Validar que la solicitud no esté despachada ni cancelada
            const ultimoEstadoReg = await Estado_solicitudModel.findOne({
                where: { Id_solicitud },
                include: [{ model: EstadosModel, as: 'estado', attributes: ['nom_estado'] }],
                order: [['createdat', 'DESC']],
                transaction: t
            });
            const estadoActual = ultimoEstadoReg?.estado?.nom_estado?.toLowerCase();
            if (estadoActual === 'despachado' || estadoActual === 'cancelado') {
                throw new Error(`No se pueden registrar ni modificar novedades en una solicitud ${estadoActual}`);
            }

            for (const item of items) {
                const { Id_insumo_solicitud, cantidad_solicitada, cantidad_entregada } = item;

                // Validaciones básicas
                if (cantidad_entregada < 0) throw new Error("La cantidad entregada no puede ser negativa");
                if (cantidad_entregada > cantidad_solicitada) throw new Error("La cantidad entregada no puede ser mayor a la solicitada");

                // Buscar el registro de insumo_solicitud
                const insumoSol = await insumosSolicitudModel.findOne({
                    where: { Id_insumo_solicitud },
                    transaction: t
                });
                if (!insumoSol) throw new Error(`Registro insumo_solicitud #${Id_insumo_solicitud} no encontrado`);

                const lote = await entradasModel.findOne({
                    where: { Id_Entradas: insumoSol.Id_Entradas },
                    transaction: t
                });
                if (!lote) continue;

                // Si ya existía una novedad previa, revertir el ajuste anterior
                if (insumoSol.cantidad_entregada !== null && insumoSol.cantidad_entregada !== undefined) {
                    const diferenciaAnterior = insumoSol.cantidad_solicitada - insumoSol.cantidad_entregada;
                    if (diferenciaAnterior > 0) {
                        // Re-sumar lo que habíamos restado antes
                        await entradasModel.update(
                            {
                                Can_Salida: lote.Can_Salida + diferenciaAnterior,
                                Estado: (lote.Can_Inicial - (lote.Can_Salida + diferenciaAnterior)) <= 0 ? 'AGOTADO' : 'STOCK'
                            },
                            { where: { Id_Entradas: lote.Id_Entradas }, transaction: t }
                        );
                        // Recargar el lote para tener valores actualizados
                        await lote.reload({ transaction: t });
                    }
                }

                // Calcular nueva diferencia y devolver al stock
                const diferenciaNueva = cantidad_solicitada - cantidad_entregada;
                if (diferenciaNueva > 0) {
                    const nuevaSalida = Math.max(lote.Can_Salida - diferenciaNueva, 0);
                    const stockReal = lote.Can_Inicial - nuevaSalida;

                    await entradasModel.update(
                        {
                            Can_Salida: nuevaSalida,
                            Estado: stockReal > 0 ? 'STOCK' : 'AGOTADO'
                        },
                        { where: { Id_Entradas: lote.Id_Entradas }, transaction: t }
                    );
                }

                // Actualizar cantidad_entregada en insumos_solicitud
                await insumosSolicitudModel.update(
                    { cantidad_entregada },
                    { where: { Id_insumo_solicitud }, transaction: t }
                );
            }

            // Guardar observación en la solicitud
            await SolicitudModel.update(
                { novedad: observacion || null },
                { where: { Id_solicitud }, transaction: t }
            );

            await t.commit();
            return { message: "Novedad registrada correctamente" };

        } catch (error) {
            await t.rollback();
            throw error;
        }
    }
}

export default new SolicitudServiceNuevo();