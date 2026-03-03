import { Op } from "sequelize";
import db from "../database/db.js";
import SolicitudModel from "../models/SolicitudModel.js";
import insumosSolicitudModel from "../models/insumosSolicitudModel.js"; // crea este modelo si no existe
import entradasModel from "../models/entradasModel.js";

class SolicitudServiceNuevo {

    async crearCompleta({ Id_Responsable, Fec_entrega, motivo, insumos }) {

        // Iniciamos transacción para que todo quede bien o nada
        const t = await db.transaction();

        try {
            // 1. Crear la solicitud
            const nuevaSolicitud = await SolicitudModel.create(
                { Id_Responsable, Fec_entrega, motivo },
                { transaction: t }
            );

            const Id_solicitud = nuevaSolicitud.Id_solicitud;

            // 2. Por cada insumo pedido
            for (const item of insumos) {
                const { Id_insumos, cantidad_solicitada } = item;

                // Buscar lotes disponibles ordenados por fecha de vencimiento (FEFO)
                const lotes = await entradasModel.findAll({
                    where: {
                        Id_Insumos: Id_insumos,
                        Estado: 'STOCK'
                    },
                    order: [['Fec_Ven_Entrada', 'ASC']],
                    transaction: t
                });

                // Calcular stock total disponible
                const stockTotal = lotes.reduce((acc, lote) => {
                    return acc + (lote.Can_Inicial - lote.Can_Salida);
                }, 0);

                if (stockTotal < cantidad_solicitada) {
                    throw new Error(`Stock insuficiente para el insumo ID ${Id_insumos}. Disponible: ${stockTotal}`);
                }

                // Descontar de los lotes (FEFO - primero el que vence antes)
                let pendiente = cantidad_solicitada;
                for (const lote of lotes) {
                    if (pendiente <= 0) break;

                    const disponibleEnLote = lote.Can_Inicial - lote.Can_Salida;
                    if (disponibleEnLote <= 0) continue;

                    const aDescontar = Math.min(pendiente, disponibleEnLote);
                    const nuevaSalida = lote.Can_Salida + aDescontar;
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

                    pendiente -= aDescontar;
                }

                // 3. Insertar en insumos_solicitud
                await insumosSolicitudModel.create(
                    {
                        Id_solicitud,
                        Id_insumos,
                        cantidad_solicitada
                    },
                    { transaction: t }
                );
            }

            // Todo bien, confirmar transacción
            await t.commit();
            return nuevaSolicitud;

        } catch (error) {
            await t.rollback();
            throw error;
        }
    }
}

export default new SolicitudServiceNuevo();