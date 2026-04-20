import { Op } from "sequelize";
import db from "../database/db.js";
import SolicitudModel from "../models/SolicitudModel.js";
import insumosSolicitudModel from "../models/insumosSolicitudModel.js";
import entradasModel from "../models/entradasModel.js";
import Estado_solicitudModel from "../models/Estado_solicitudModel.js";

class SolicitudServiceNuevo {

    async crearCompleta({ Id_Responsable, Fec_entrega, motivo, Descripcion, Ficha, insumos }) {

        const t = await db.transaction();

        try {
            const nuevaSolicitud = await SolicitudModel.create(
                { 
                    Id_Responsable, 
                    Fec_entrega, 
                    motivo,
                    Descripcion, // ✅ nuevo
                    Ficha        // ✅ nuevo
                },
                { transaction: t }
            );

            const Id_solicitud = nuevaSolicitud.Id_solicitud;

            for (const item of insumos) {

                const { Id_insumos, cantidad_solicitada, Id_Entradas } = item;

                // 🔥 USAR EL LOTE SELECCIONADO (NO FEFO AUTOMÁTICO)
                const lote = await entradasModel.findOne({
                    where: {
                        Id_Entradas: Id_Entradas,
                        Estado: 'STOCK'
                    },
                    transaction: t
                });

                if (!lote) {
                    throw new Error(`Lote no encontrado`);
                }

                const disponible = lote.Can_Inicial - lote.Can_Salida;

                if (disponible < cantidad_solicitada) {
                    throw new Error(`Stock insuficiente en el lote`);
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

    async cambiarEstado({ Id_solicitud, Id_estado }) {

        const t = await db.transaction();

        try {

            // 🔴 SI CANCELA → DEVOLVER STOCK
            if (Id_estado === 4) {

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

                    const nuevaSalida = lote.Can_Salida - item.cantidad_solicitada;
                    const stockReal = lote.Can_Inicial - nuevaSalida;

                    await entradasModel.update(
                        {
                            Can_Salida: Math.max(nuevaSalida, 0),
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
}

export default new SolicitudServiceNuevo();