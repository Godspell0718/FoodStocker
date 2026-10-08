import entradasModel from "../models/entradasModel.js";
import entradasService from "./entradasService.js";

/**
 * Helpers compartidos para modificar el stock de un lote (entrada) de forma segura.
 *
 * Reglas:
 * - El lote se lee con bloqueo de fila (SELECT ... FOR UPDATE) dentro de la transacción
 *   recibida, para que dos operaciones simultáneas no se pisen.
 * - El estado del lote SIEMPRE se recalcula con `calcularEstado` (VENCIDO > AGOTADO > STOCK),
 *   de modo que devolver stock nunca reactiva un lote vencido.
 */

export const calcularEstadoLote = (lote, canSalida = lote.Can_Salida) =>
    entradasService.calcularEstado({
        Fec_Ven_Entrada: lote.Fec_Ven_Entrada,
        Can_Inicial: lote.Can_Inicial,
        Can_Salida: canSalida
    });

export const loteEstaVencido = (lote) => calcularEstadoLote(lote, 0) === 'VENCIDO';

export const obtenerLoteBloqueado = async (Id_Entradas, t) => {
    if (!t) throw new Error("obtenerLoteBloqueado requiere una transacción");
    return entradasModel.findOne({
        where: { Id_Entradas },
        transaction: t,
        lock: t.LOCK.UPDATE
    });
};

/**
 * Ajusta Can_Salida de un lote en `delta` unidades.
 *  - delta > 0 → sale stock (valida que haya disponible).
 *  - delta < 0 → vuelve stock al lote (nunca deja Can_Salida por debajo de 0).
 * Devuelve el lote bloqueado y actualizado, o null si el lote no existe.
 */
export const ajustarSalidaLote = async (Id_Entradas, delta, t, { requerido = true } = {}) => {
    const lote = await obtenerLoteBloqueado(Id_Entradas, t);
    if (!lote) {
        if (requerido) throw new Error(`Lote #${Id_Entradas} no encontrado`);
        return null;
    }

    const cambio = Number(delta);
    if (!Number.isFinite(cambio)) throw new Error("Cantidad inválida para ajustar el lote");
    if (cambio === 0) return lote;

    const salidaActual = Number(lote.Can_Salida) || 0;
    const inicial = Number(lote.Can_Inicial) || 0;
    const nuevaSalida = Math.max(salidaActual + cambio, 0);

    if (cambio > 0 && nuevaSalida > inicial) {
        throw new Error(`Stock insuficiente en el lote ${lote.Lote} (Disponible: ${inicial - salidaActual}, Requerido: ${cambio})`);
    }

    const nuevoEstado = calcularEstadoLote(lote, nuevaSalida);
    await lote.update({ Can_Salida: nuevaSalida, Estado: nuevoEstado }, { transaction: t });
    return lote;
};

export const parsearCantidadEntera = (valor, nombreCampo = "cantidad", { permitirCero = false } = {}) => {
    const n = Number(valor);
    if (!Number.isInteger(n) || n < 0 || (!permitirCero && n === 0)) {
        throw new Error(`La ${nombreCampo} debe ser un número entero ${permitirCero ? 'mayor o igual a 0' : 'mayor a 0'}`);
    }
    return n;
};
