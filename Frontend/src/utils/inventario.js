// Utilidades compartidas: unidades, presentaciones, fechas de vencimiento y dinero.

export const UNIDADES_MEDIDA = [
    { value: "kg", label: "Kilogramos (kg)" },
    { value: "gr", label: "Gramos (gr)" },
    { value: "ml", label: "Mililitros (ml)" },
    { value: "l", label: "Litros (l)" },
    { value: "lbs", label: "Libras (lbs)" },
    { value: "und", label: "Unidades (und)" },
];

// value = singular (se guarda en BD), plural = para textos tipo "2 bultos"
export const PRESENTACIONES = [
    { value: "bulto", plural: "bultos", label: "Bulto / Saco" },
    { value: "cubeta", plural: "cubetas", label: "Cubeta / Panal" },
    { value: "caja", plural: "cajas", label: "Caja" },
    { value: "bolsa", plural: "bolsas", label: "Bolsa" },
    { value: "paquete", plural: "paquetes", label: "Paquete" },
    { value: "lata", plural: "latas", label: "Lata / Frasco" },
    { value: "botella", plural: "botellas", label: "Botella / Garrafa" },
];

/** Unidad siempre en minúsculas. */
export const fmtUnidad = (u) => (u ? String(u).toLowerCase() : "");

/** Referencia siempre en mayúsculas. */
export const fmtReferencia = (r) => (r ? String(r).toUpperCase() : "");

/** "bulto" → "bultos" según la cantidad. */
export const nombrePresentacion = (tipo, cantidad = 1) => {
    if (!tipo) return "";
    const p = PRESENTACIONES.find(x => x.value === String(tipo).toLowerCase());
    if (Number(cantidad) === 1) return p?.value ?? tipo;
    return p?.plural ?? `${tipo}s`;
};

/** El insumo tiene presentación configurada (tipo + contenido > 0). */
export const tienePresentacion = (insumo) =>
    !!(insumo?.Tip_Presentacion && Number(insumo?.Can_Presentacion) > 0);

/** "Bulto de 50000 gr" */
export const describirPresentacion = (insumo) =>
    tienePresentacion(insumo)
        ? `${nombrePresentacion(insumo.Tip_Presentacion)} de ${Number(insumo.Can_Presentacion).toLocaleString("es-CO")} ${fmtUnidad(insumo.Uni_medida)}`
        : "";

/**
 * Expresa una cantidad base en presentaciones si es múltiplo exacto: "2 bultos (100000 gr)".
 * Si no es múltiplo (o no hay presentación) devuelve "350 gr".
 */
export const fmtCantidadConPresentacion = (cantidad, insumo) => {
    const base = `${Number(cantidad).toLocaleString("es-CO")} ${fmtUnidad(insumo?.Uni_medida)}`.trim();
    if (!tienePresentacion(insumo)) return base;
    const contenido = Number(insumo.Can_Presentacion);
    if (Number(cantidad) % contenido !== 0) return base;
    const n = Number(cantidad) / contenido;
    return `${n} ${nombrePresentacion(insumo.Tip_Presentacion, n)} (${base})`;
};

/** Fecha 'YYYY-MM-DD' → 'DD/MM/YYYY'; sin fecha → 'N/A'. */
export const fmtFechaVencimiento = (fecha) => {
    if (!fecha) return "N/A";
    const [y, m, d] = String(fecha).slice(0, 10).split("-");
    return y && m && d ? `${d}/${m}/${y}` : "N/A";
};

/**
 * Un lote sin fecha de vencimiento (NULL) NUNCA vence.
 * Se compara en hora local para evitar el corrimiento de un día por UTC.
 */
export const loteVigente = (fecha) => {
    if (!fecha) return true;
    const [y, m, d] = String(fecha).slice(0, 10).split("-").map(Number);
    const venc = new Date(y, m - 1, d);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return venc > hoy;
};

/** Orden FEFO: primero el que vence antes; los lotes sin fecha (N/A) al final. */
export const compararPorVencimiento = (a, b) => {
    const fa = a.Fec_Ven_Entrada, fb = b.Fec_Ven_Entrada;
    if (!fa && !fb) return 0;
    if (!fa) return 1;
    if (!fb) return -1;
    return String(fa).localeCompare(String(fb));
};

/** Pesos colombianos; null → '—'. Hasta 2 decimales (útil para costo por gr). */
export const fmtDinero = (valor) => {
    if (valor === null || valor === undefined || valor === "" || isNaN(Number(valor))) return "—";
    return `$ ${Number(valor).toLocaleString("es-CO", { maximumFractionDigits: 2 })}`;
};
