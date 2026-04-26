import { useState, useEffect } from "react";
import apiAxios from "../api/axiosConfig.js";
import Swal from "sweetalert2";
import { ClipboardList, CheckCircle, XCircle, Truck, Loader2, Package, Calendar, User, FileText, Hash, RefreshCw } from "lucide-react";

const ESTADO_CONFIG = {
    solicitado: { label: "Solicitado", bg: "tw-bg-secundario-100 tw-text-secundario-800", dot: "tw-bg-secundario-400" },
    proceso:    { label: "En Proceso", bg: "tw-bg-blue-100 tw-text-blue-800",   dot: "tw-bg-blue-500" },
    despachado: { label: "Despachado", bg: "tw-bg-green-100 tw-text-green-800", dot: "tw-bg-green-500" },
    cancelado:  { label: "Cancelado",  bg: "tw-bg-red-100 tw-text-red-700",     dot: "tw-bg-red-500" },
};

const EstadoBadge = ({ estado }) => {
    const key = estado?.toLowerCase();
    const config = ESTADO_CONFIG[key] || { label: estado ?? "Sin estado", bg: "tw-bg-gray-100 tw-text-gray-600", dot: "tw-bg-gray-400" };
    return (
        <span className={`tw-inline-flex tw-items-center tw-gap-1.5 tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-semibold ${config.bg}`}>
            <span className={`tw-w-1.5 tw-h-1.5 tw-rounded-full ${config.dot}`} />
            {config.label}
        </span>
    );
};

const SolicitudPendientes = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { cargarSolicitudes(); }, []);

    const cargarSolicitudes = async () => {
        try {
            setLoading(true);
            const res = await apiAxios.get("/api/solicitudes/pendientes");
            setSolicitudes(res.data);
        } catch (error) {
            console.error("Error cargando solicitudes:", error);
        } finally {
            setLoading(false);
        }
    };

    const cambiarEstado = async (Id_solicitud, Id_estado, nombreEstado) => {
        const confirm = await Swal.fire({
            title: `¿Cambiar a "${nombreEstado}"?`,
            text: "Esta acción quedará registrada",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, confirmar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: Id_estado === 4 ? "#ef4444" : "#153753",
            cancelButtonColor: "#6b7280",
        });
        if (!confirm.isConfirmed) return;
        try {
            await apiAxios.post("/api/solicitudes/cambiar-estado", { Id_solicitud, Id_estado });
            Swal.fire({ icon: "success", title: "Estado actualizado", timer: 1200, showConfirmButton: false });
            cargarSolicitudes();
        } catch (error) {
            Swal.fire("Error", error.response?.data?.message || "No se pudo cambiar el estado", "error");
        }
    };

    return (
        <div className="tw-p-2">

            {/* Header */}
            <div className="tw-flex tw-items-center tw-justify-between tw-mb-6">
                <div className="tw-flex tw-items-center tw-gap-3">
                    <div className="tw-w-10 tw-h-10 tw-rounded-xl tw-bg-primario-900 tw-flex tw-items-center tw-justify-center tw-shadow-md">
                        <ClipboardList className="tw-w-5 tw-h-5 tw-text-secundario-400" />
                    </div>
                    <div>
                        <h1 className="tw-text-xl tw-font-bold tw-text-gray-800 tw-m-0">Solicitudes Pendientes</h1>
                        <p className="tw-text-sm tw-text-gray-500 tw-m-0">Gestiona y cambia el estado de cada solicitud</p>
                    </div>
                </div>
                <button
                    onClick={cargarSolicitudes}
                    className="tw-flex tw-items-center tw-gap-2 tw-px-3 tw-py-2 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-white tw-text-sm tw-text-gray-600 hover:tw-bg-gray-50 tw-transition-all tw-shadow-sm"
                >
                    <RefreshCw className="tw-w-4 tw-h-4" />
                    Actualizar
                </button>
            </div>

            {/* Loading */}
            {loading ? (
                <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-20 tw-gap-3">
                    <Loader2 className="tw-w-8 tw-h-8 tw-text-primario-500 tw-animate-spin" />
                    <p className="tw-text-gray-500 tw-text-sm">Cargando solicitudes...</p>
                </div>
            ) : solicitudes.length === 0 ? (
                <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-20 tw-gap-3">
                    <div className="tw-w-16 tw-h-16 tw-rounded-2xl tw-bg-gray-100 tw-flex tw-items-center tw-justify-center">
                        <ClipboardList className="tw-w-8 tw-h-8 tw-text-gray-400" />
                    </div>
                    <p className="tw-text-gray-500 tw-font-medium">No hay solicitudes pendientes</p>
                    <p className="tw-text-gray-400 tw-text-sm">Todas las solicitudes están al día</p>
                </div>
            ) : (
                <div className="tw-flex tw-flex-col tw-gap-4">
                    {solicitudes.map(sol => (
                        <div
                            key={sol.Id_solicitud}
                            className="tw-bg-white tw-rounded-2xl tw-shadow-sm tw-border tw-border-gray-100 tw-overflow-hidden hover:tw-shadow-md tw-transition-shadow tw-duration-200"
                        >
                            {/* Card header */}
                            <div className="tw-flex tw-items-center tw-justify-between tw-px-5 tw-py-3.5 tw-bg-primario-900">
                                <div className="tw-flex tw-items-center tw-gap-2">
                                    <span className="tw-text-secundario-400 tw-font-bold tw-text-sm">#{sol.Id_solicitud}</span>
                                    <span className="tw-text-primario-200 tw-text-sm tw-font-medium">
                                        — {sol.responsable?.Nom_Responsable ?? "Sin responsable"}
                                    </span>
                                </div>
                                <EstadoBadge estado={sol.ultimoEstado} />
                            </div>

                            {/* Card body */}
                            <div className="tw-px-5 tw-py-4">

                                {/* Info grid */}
                                <div className="tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-4 tw-mb-4">
                                    <div>
                                        <div className="tw-flex tw-items-center tw-gap-1.5 tw-mb-0.5">
                                            <FileText className="tw-w-3.5 tw-h-3.5 tw-text-gray-400" />
                                            <span className="tw-text-xs tw-text-gray-500 tw-font-medium">Motivo</span>
                                        </div>
                                        <p className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-m-0">{sol.motivo}</p>
                                    </div>
                                    <div>
                                        <div className="tw-flex tw-items-center tw-gap-1.5 tw-mb-0.5">
                                            <FileText className="tw-w-3.5 tw-h-3.5 tw-text-gray-400" />
                                            <span className="tw-text-xs tw-text-gray-500 tw-font-medium">Descripción</span>
                                        </div>
                                        <p className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-m-0">{sol.Descripcion || "Sin descripción"}</p>
                                    </div>
                                    <div>
                                        <div className="tw-flex tw-items-center tw-gap-1.5 tw-mb-0.5">
                                            <Hash className="tw-w-3.5 tw-h-3.5 tw-text-gray-400" />
                                            <span className="tw-text-xs tw-text-gray-500 tw-font-medium">Ficha</span>
                                        </div>
                                        <p className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-m-0">{sol.Ficha || "N/A"}</p>
                                    </div>
                                    <div>
                                        <div className="tw-flex tw-items-center tw-gap-1.5 tw-mb-0.5">
                                            <Calendar className="tw-w-3.5 tw-h-3.5 tw-text-gray-400" />
                                            <span className="tw-text-xs tw-text-gray-500 tw-font-medium">Fecha entrega</span>
                                        </div>
                                        <p className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-m-0">{sol.Fec_entrega}</p>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="tw-border-t tw-border-gray-100 tw-mb-4" />

                                {/* Tabla insumos */}
                                <p className="tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wider tw-mb-2 tw-flex tw-items-center tw-gap-1.5">
                                    <Package className="tw-w-3.5 tw-h-3.5" />
                                    Insumos solicitados
                                </p>

                                {(sol.insumos || []).length === 0 ? (
                                    <p className="tw-text-sm tw-text-gray-400 tw-italic tw-mb-4">Sin insumos registrados</p>
                                ) : (
                                    <div className="tw-rounded-xl tw-border tw-border-gray-100 tw-overflow-hidden tw-mb-4">
                                        <table className="tw-w-full tw-text-sm">
                                            <thead>
                                                <tr className="tw-bg-gray-50">
                                                    <th className="tw-text-left tw-px-4 tw-py-2.5 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wide">Insumo</th>
                                                    <th className="tw-text-left tw-px-4 tw-py-2.5 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wide">Cantidad</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(sol.insumos || []).map((item, index) => (
                                                    <tr key={item.Id_insumo_solicitud || index} className="tw-border-t tw-border-gray-100 hover:tw-bg-gray-50 tw-transition-colors">
                                                        <td className="tw-px-4 tw-py-2.5 tw-text-gray-700">
                                                            {item.insumo?.Nom_Insumo ?? `Insumo #${item.Id_insumos}`}
                                                        </td>
                                                        <td className="tw-px-4 tw-py-2.5">
                                                            <span className="tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-md tw-bg-primario-50 tw-text-primario-800 tw-font-bold tw-text-xs">
                                                                {item.cantidad_solicitada}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Botones de acción */}
                                <div className="tw-flex tw-flex-wrap tw-gap-2">
                                    {sol.ultimoEstado?.toLowerCase() === "solicitado" && (
                                        <>
                                            <button
                                                onClick={() => cambiarEstado(sol.Id_solicitud, 2, "proceso")}
                                                className="tw-flex tw-items-center tw-gap-1.5 tw-px-4 tw-py-2 tw-rounded-lg tw-bg-primario-900 tw-text-white tw-text-sm tw-font-medium hover:tw-bg-primario-700 tw-transition-all tw-shadow-sm"
                                            >
                                                <CheckCircle className="tw-w-4 tw-h-4" /> Aceptar
                                            </button>
                                            <button
                                                onClick={() => cambiarEstado(sol.Id_solicitud, 4, "cancelado")}
                                                className="tw-flex tw-items-center tw-gap-1.5 tw-px-4 tw-py-2 tw-rounded-lg tw-bg-red-500 tw-text-white tw-text-sm tw-font-medium hover:tw-bg-red-600 tw-transition-all tw-shadow-sm"
                                            >
                                                <XCircle className="tw-w-4 tw-h-4" /> Cancelar
                                            </button>
                                        </>
                                    )}
                                    {sol.ultimoEstado?.toLowerCase() === "proceso" && (
                                        <>
                                            <button
                                                onClick={() => cambiarEstado(sol.Id_solicitud, 3, "despachado")}
                                                className="tw-flex tw-items-center tw-gap-1.5 tw-px-4 tw-py-2 tw-rounded-lg tw-bg-green-600 tw-text-white tw-text-sm tw-font-medium hover:tw-bg-green-700 tw-transition-all tw-shadow-sm"
                                            >
                                                <Truck className="tw-w-4 tw-h-4" /> Despachar
                                            </button>
                                            <button
                                                onClick={() => cambiarEstado(sol.Id_solicitud, 4, "cancelado")}
                                                className="tw-flex tw-items-center tw-gap-1.5 tw-px-4 tw-py-2 tw-rounded-lg tw-bg-red-500 tw-text-white tw-text-sm tw-font-medium hover:tw-bg-red-600 tw-transition-all tw-shadow-sm"
                                            >
                                                <XCircle className="tw-w-4 tw-h-4" /> Cancelar
                                            </button>
                                        </>
                                    )}
                                    {sol.ultimoEstado?.toLowerCase() === "despachado" && (
                                        <span className="tw-flex tw-items-center tw-gap-1.5 tw-px-4 tw-py-2 tw-rounded-lg tw-bg-green-50 tw-text-green-700 tw-text-sm tw-font-medium tw-border tw-border-green-200">
                                            <CheckCircle className="tw-w-4 tw-h-4" /> Despachado
                                        </span>
                                    )}
                                    {sol.ultimoEstado?.toLowerCase() === "cancelado" && (
                                        <span className="tw-flex tw-items-center tw-gap-1.5 tw-px-4 tw-py-2 tw-rounded-lg tw-bg-red-50 tw-text-red-600 tw-text-sm tw-font-medium tw-border tw-border-red-200">
                                            <XCircle className="tw-w-4 tw-h-4" /> Cancelado
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SolicitudPendientes;