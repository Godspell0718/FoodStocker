// Centralización de roles y permisos de FoodStocker

export const ROLES = {
    ADMIN: "ADMIN",
    GESTOR: "GA",                    // Gestor de almacen (antes: Pasante de agroindustria)
    INSTRUCTOR: "IEU",               // Instructor encargado de unidad (antes: Instructor de agroindustria)
    SOLICITANTE: "SOL",              // Solicitante (antes: Pasante solicitante)
};

export const ROLES_CONFIG = {
    ADMIN: {
        code: "ADMIN",
        label: "Administrador",
        color: "tw-bg-blue-100 tw-text-blue-700 tw-border-blue-200",
    },
    GA: {
        code: "GA",
        label: "Gestor de almacen",
        color: "tw-bg-emerald-100 tw-text-emerald-700 tw-border-emerald-200",
    },
    IEU: {
        code: "IEU",
        label: "Instructor encargado de unidad",
        color: "tw-bg-purple-100 tw-text-purple-700 tw-border-purple-200",
    },
    SOL: {
        code: "SOL",
        label: "Solicitante",
        color: "tw-bg-amber-100 tw-text-amber-700 tw-border-amber-200",
    },
};

/**
 * Normaliza cualquier variante de rol (código de BD o nombre legible anterior) a su código oficial.
 */
export const normalizarRol = (rol) => {
    if (!rol) return "";
    const r = String(rol).trim();
    if (r === "ADMIN" || r === "Administrador") return "ADMIN";
    if (r === "GA" || r === "Pasante de agroindustria" || r === "PDU" || r === "Gestor de almacen" || r === "Gestor de almacén") {
        return "GA";
    }
    if (r === "IEU" || r === "Instructor de agroindustria" || r === "IA" || r === "Instructor encargado de unidad") {
        return "IEU";
    }
    if (r === "SOL" || r === "Pasante solicitante" || r === "Solicitante") {
        return "SOL";
    }
    return r;
};

/**
 * Devuelve el nombre oficial y legible del rol para mostrar en la interfaz.
 */
export const obtenerNombreRol = (rol) => {
    const code = normalizarRol(rol);
    return ROLES_CONFIG[code]?.label || rol || "Sin rol";
};

/**
 * Devuelve las clases de color de badge para el rol.
 */
export const obtenerColorRol = (rol) => {
    const code = normalizarRol(rol);
    return ROLES_CONFIG[code]?.color || "tw-bg-gray-100 tw-text-gray-700";
};

/**
 * Valida si un rol de usuario tiene acceso dado un conjunto de roles permitidos.
 * Administrador ('ADMIN') tiene acceso total por defecto.
 */
export const tieneRol = (userRol, rolesPermitidos = []) => {
    const code = normalizarRol(userRol);
    if (!code) return false;
    if (code === "ADMIN") return true;
    const permitidosNormalizados = rolesPermitidos.map(normalizarRol);
    return permitidosNormalizados.includes(code);
};
