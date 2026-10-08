import db from "../database/db.js";
import SolicitudModel from "../models/SolicitudModel.js";
import insumosSolicitudModel from "../models/insumosSolicitudModel.js";
import insumoModel from "../models/insumosModel.js";
import Estado_solicitudModel from "../models/Estado_solicitudModel.js";
import EstadosModel from "../models/EstadosModel.js";
import {
    ajustarSalidaLote,
    obtenerLoteBloqueado,
    loteEstaVencido,
    parsearCantidadEntera
} from "./stockHelpers.js";

// IDs de la tabla `estados`
export const ESTADOS = { 1: 'solicitado', 2: 'proceso', 3: 'despachado', 4: 'cancelado' };

// Máquina de estados: transiciones permitidas desde cada estado
export const TRANSICIONES = {
    solicitado: ['proceso', 'cancelado'],
    proceso: ['despachado', 'cancelado'],
    despachado: [],
    cancelado: []
};

/**
 * Devuelve el nombre del último estado de una solicitud.
 * Se ordena por la PK autoincremental (más fiable que `createdat`, que tiene resolución de segundos).
 */
export const obtenerEstadoActual = async (Id_solicitud, t) => {
    const ultimo = await Estado_solicitudModel.findOne({
        where: { Id_solicitud },
        include: [{ model: EstadosModel, as: 'estado', attributes: ['nom_estado'] }],
        order: [['Id_estado_solicitud', 'DESC']],
        transaction: t
    });
    return ultimo?.estado?.nom_estado?.toLowerCase() ?? 'solicitado';
};

/** Cantidad que actualmente está descontada (retenida) en el lote por un ítem de solicitud. */
export const cantidadRetenida = (item) =>
    (item.cantidad_entregada !== null && item.cantidad_entregada !== undefined)
        ? Number(item.cantidad_entregada)
        : Number(item.cantidad_solicitada);

/** Bloquea la fila de la solicitud para serializar operaciones concurrentes sobre ella. */
const bloquearSolicitud = async (Id_solicitud, t) => {
    const solicitud = await SolicitudModel.findByPk(Id_solicitud, { transaction: t, lock: t.LOCK.UPDATE });
    if (!solicitud) throw new Error(`Solicitud #${Id_solicitud} no encontrada`);
    return solicitud;
};

class SolicitudServiceNuevo {

    async crearCompleta({ Id_Responsable, Fec_entrega, motivo, Descripcion, Ficha, Id_Destino, Observaciones, Tip_solicitud, insumos }) {

        if (!Array.isArray(insumos) || insumos.length === 0) {
            throw new Error("La solicitud debe incluir al menos un insumo");
        }

        const tipo = String(Tip_solicitud || 'CANTIDAD').toUpperCase();
        if (!['PRESENTACION', 'CANTIDAD'].includes(tipo)) {
            throw new Error("Tipo de solicitud no válido (PRESENTACION o CANTIDAD)");
        }

        // Normalizar y validar ítems antes de abrir la transacción
        const items = insumos.map((item, idx) => {
            const Id_insumos = Number(item.Id_insumos);
            const Id_Entradas = Number(item.Id_Entradas);
            if (!Id_insumos || !Id_Entradas) {
                throw new Error(`El ítem #${idx + 1} debe indicar insumo y lote`);
            }
            return {
                Id_insumos,
                Id_Entradas,
                cantidad_solicitada: parsearCantidadEntera(item.cantidad_solicitada, `cantidad solicitada del ítem #${idx + 1}`)
            };
        });

        const t = await db.transaction();

        try {
            // Solicitud por presentación completa: el total pedido de cada insumo
            // (sumando todos sus lotes) debe ser un número exacto de empaques.
            if (tipo === 'PRESENTACION') {
                const totalesPorInsumo = items.reduce((acc, it) => {
                    acc[it.Id_insumos] = (acc[it.Id_insumos] || 0) + it.cantidad_solicitada;
                    return acc;
                }, {});
                for (const [idInsumo, total] of Object.entries(totalesPorInsumo)) {
                    const insumo = await insumoModel.findByPk(idInsumo, { transaction: t });
                    if (!insumo) throw new Error(`Insumo #${idInsumo} no encontrado`);
                    const contenido = Number(insumo.Can_Presentacion);
                    if (!insumo.Tip_Presentacion || !contenido) {
                        throw new Error(`"${insumo.Nom_Insumo}" no tiene presentación configurada; pídelo por cantidad exacta`);
                    }
                    if (total % contenido !== 0) {
                        throw new Error(`"${insumo.Nom_Insumo}" debe pedirse en ${insumo.Tip_Presentacion}s completos de ${contenido} ${insumo.Uni_medida}`);
                    }
                }
            }

            const nuevaSolicitud = await SolicitudModel.create(
                { Id_Responsable, Fec_entrega, motivo, Descripcion, Ficha, Id_Destino, Observaciones, Tip_solicitud: tipo },
                { transaction: t }
            );

            const Id_solicitud = nuevaSolicitud.Id_solicitud;

            // Registrar estado inicial (1 = solicitado)
            await Estado_solicitudModel.create(
                { Id_solicitud, Id_estado: 1, fecha: new Date() },
                { transaction: t }
            );

            // Se bloquean los lotes en orden de ID para evitar deadlocks entre solicitudes simultáneas
            const ordenados = [...items].sort((a, b) => a.Id_Entradas - b.Id_Entradas);

            for (const { Id_insumos, Id_Entradas, cantidad_solicitada } of ordenados) {

                const lote = await obtenerLoteBloqueado(Id_Entradas, t);
                if (!lote) throw new Error(`Lote #${Id_Entradas} no encontrado`);

                if (Number(lote.Id_Insumos) !== Id_insumos) {
                    throw new Error(`El lote ${lote.Lote} no pertenece al insumo seleccionado`);
                }

                const insumo = await insumoModel.findByPk(Id_insumos, { transaction: t });
                if (!insumo) throw new Error(`Insumo #${Id_insumos} no encontrado`);
                if (insumo.Estado === 'INACTIVO') {
                    throw new Error(`El insumo "${insumo.Nom_Insumo}" está INACTIVO y no puede solicitarse`);
                }

                if (loteEstaVencido(lote)) {
                    throw new Error(`El lote ${lote.Lote} de "${insumo.Nom_Insumo}" está vencido y no puede despacharse`);
                }

                // Valida disponibilidad con el lote bloqueado y recalcula su estado
                await ajustarSalidaLote(Id_Entradas, cantidad_solicitada, t);

                await insumosSolicitudModel.create(
                    { Id_solicitud, Id_insumos, Id_Entradas, cantidad_solicitada },
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

        const idEstadoNuevo = Number(Id_estado);
        const estadoNuevo = ESTADOS[idEstadoNuevo];
        if (!estadoNuevo) throw new Error(`Estado #${Id_estado} no válido`);

        const t = await db.transaction();

        try {
            // Bloquear la solicitud: dos cambios simultáneos se ejecutan uno detrás de otro
            await bloquearSolicitud(Id_solicitud, t);

            const estadoActual = await obtenerEstadoActual(Id_solicitud, t);
            const permitidos = TRANSICIONES[estadoActual] ?? [];
            if (!permitidos.includes(estadoNuevo)) {
                throw new Error(`No se puede pasar una solicitud de "${estadoActual}" a "${estadoNuevo}"`);
            }

            // 🔴 SI CANCELA → DEVOLVER STOCK Y GUARDAR MOTIVO
            if (estadoNuevo === 'cancelado') {

                if (!motivo_cancelacion || !String(motivo_cancelacion).trim()) {
                    throw new Error("El motivo de cancelación es obligatorio");
                }

                await SolicitudModel.update(
                    { motivo_cancelacion: String(motivo_cancelacion).trim() },
                    { where: { Id_solicitud }, transaction: t }
                );

                const items = await insumosSolicitudModel.findAll({
                    where: { Id_solicitud },
                    order: [['Id_Entradas', 'ASC']],
                    transaction: t
                });

                for (const item of items) {
                    // Si hubo novedad (entrega parcial) sólo está retenida la cantidad_entregada;
                    // si no, la cantidad_solicitada completa.
                    await ajustarSalidaLote(item.Id_Entradas, -cantidadRetenida(item), t, { requerido: false });
                }
            }

            const estado = await Estado_solicitudModel.create({
                Id_solicitud,
                Id_estado: idEstadoNuevo,
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
     * Cambia el lote asignado a un ítem de solicitud.
     * Permitido únicamente en solicitudes con Tip_solicitud === 'CANTIDAD' y en estados no finalizados.
     */
    async cambiarLoteItem({ Id_insumo_solicitud, Id_Entradas_nuevo }) {
        const t = await db.transaction();
        try {
            const idInsumoSol = Number(Id_insumo_solicitud);
            const idEntradaNueva = Number(Id_Entradas_nuevo);

            if (!idInsumoSol || !idEntradaNueva) {
                throw new Error("Parámetros inválidos para cambiar de lote");
            }

            const insumoSol = await insumosSolicitudModel.findByPk(idInsumoSol, { transaction: t });
            if (!insumoSol) throw new Error("Ítem de solicitud no encontrado");

            // Si es el mismo lote, no requiere cambios
            if (Number(insumoSol.Id_Entradas) === idEntradaNueva) {
                await t.commit();
                return insumoSol;
            }

            const solicitud = await SolicitudModel.findByPk(insumoSol.Id_solicitud, { transaction: t, lock: t.LOCK.UPDATE });
            if (!solicitud) throw new Error("Solicitud no encontrada");

            if (String(solicitud.Tip_solicitud).toUpperCase() !== 'CANTIDAD') {
                throw new Error("Solo se puede cambiar el lote en solicitudes por cantidad exacta");
            }

            const estadoActual = await obtenerEstadoActual(solicitud.Id_solicitud, t);
            if (estadoActual === 'despachado' || estadoActual === 'cancelado') {
                throw new Error(`No se puede cambiar el lote de una solicitud en estado ${estadoActual}`);
            }

            const loteNuevo = await obtenerLoteBloqueado(idEntradaNueva, t);
            if (!loteNuevo) throw new Error("El nuevo lote seleccionado no existe");

            if (Number(loteNuevo.Id_Insumos) !== Number(insumoSol.Id_insumos)) {
                throw new Error("El nuevo lote no pertenece al insumo solicitado");
            }

            if (loteEstaVencido(loteNuevo)) {
                throw new Error(`El lote ${loteNuevo.Lote} está vencido y no se puede seleccionar`);
            }

            const cantARetener = cantidadRetenida(insumoSol);

            // 1. Devolver la cantidad al lote anterior
            await ajustarSalidaLote(insumoSol.Id_Entradas, -cantARetener, t, { requerido: false });

            // 2. Descontar la cantidad del nuevo lote (valida disponibilidad automáticamente)
            await ajustarSalidaLote(idEntradaNueva, cantARetener, t);

            // 3. Actualizar la referencia en insumos_solicitud
            await insumoSol.update({ Id_Entradas: idEntradaNueva }, { transaction: t });

            await t.commit();
            return insumoSol;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    /**
     * Registra una novedad de entrega: fija la cantidad entregada de cada ítem
     * y ajusta el lote por la diferencia respecto a lo que estaba retenido.
     * Soporta re-edición (si ya había novedad, el ajuste parte de la cantidad entregada previa).
     */
    async registrarNovedad({ Id_solicitud, observacion, items }) {

        const t = await db.transaction();

        try {
            await bloquearSolicitud(Id_solicitud, t);

            const estadoActual = await obtenerEstadoActual(Id_solicitud, t);
            if (estadoActual === 'despachado' || estadoActual === 'cancelado') {
                throw new Error(`No se pueden registrar ni modificar novedades en una solicitud ${estadoActual}`);
            }

            for (const item of items) {
                const insumoSol = await insumosSolicitudModel.findOne({
                    where: { Id_insumo_solicitud: item.Id_insumo_solicitud, Id_solicitud },
                    transaction: t
                });
                if (!insumoSol) {
                    throw new Error(`El ítem #${item.Id_insumo_solicitud} no pertenece a la solicitud #${Id_solicitud}`);
                }

                // Siempre se usa la cantidad solicitada guardada, no la que envía el cliente
                const solicitada = Number(insumoSol.cantidad_solicitada);
                const entregada = parsearCantidadEntera(item.cantidad_entregada, "cantidad entregada", { permitirCero: true });
                if (entregada > solicitada) {
                    throw new Error("La cantidad entregada no puede ser mayor a la solicitada");
                }

                // delta < 0 → vuelve stock al lote; delta > 0 → se vuelve a retener (re-edición)
                const delta = entregada - cantidadRetenida(insumoSol);
                await ajustarSalidaLote(insumoSol.Id_Entradas, delta, t, { requerido: false });

                await insumoSol.update({ cantidad_entregada: entregada }, { transaction: t });
            }

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

    /**
     * Elimina una solicitud de forma segura:
     * - despachada → no se permite (el producto ya salió de bodega).
     * - cancelada → el stock ya fue devuelto al cancelar, sólo se borran los registros.
     * - solicitada / en proceso → se devuelve al lote lo que estaba retenido.
     */
    async eliminar(Id_solicitud) {

        const t = await db.transaction();

        try {
            await bloquearSolicitud(Id_solicitud, t);

            const estadoActual = await obtenerEstadoActual(Id_solicitud, t);
            if (estadoActual === 'despachado') {
                throw new Error("No se puede eliminar una solicitud despachada: el producto ya salió de bodega");
            }

            const items = await insumosSolicitudModel.findAll({
                where: { Id_solicitud },
                order: [['Id_Entradas', 'ASC']],
                transaction: t
            });

            if (estadoActual !== 'cancelado') {
                for (const item of items) {
                    await ajustarSalidaLote(item.Id_Entradas, -cantidadRetenida(item), t, { requerido: false });
                }
            }

            await insumosSolicitudModel.destroy({ where: { Id_solicitud }, transaction: t });
            await Estado_solicitudModel.destroy({ where: { Id_solicitud }, transaction: t });
            await SolicitudModel.destroy({ where: { Id_solicitud }, transaction: t });

            await t.commit();
            return true;

        } catch (error) {
            await t.rollback();
            throw error;
        }
    }
}

export default new SolicitudServiceNuevo();