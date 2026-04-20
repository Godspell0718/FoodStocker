import { useState, useEffect } from "react";
import apiAxios from "../api/axiosConfig.js";
import Swal from "sweetalert2";

const SolicitudPendientes = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarSolicitudes();
    }, []);

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
            confirmButtonColor: Id_estado === 4 ? "#dc3545" : "#212529"
        });

        if (!confirm.isConfirmed) return;

        try {
            await apiAxios.post("/api/solicitudes/cambiar-estado", {
                Id_solicitud,
                Id_estado
            });
            Swal.fire({
                icon: "success",
                title: "Estado actualizado",
                timer: 1200,
                showConfirmButton: false
            });
            cargarSolicitudes();
        } catch (error) {
            Swal.fire("Error", error.response?.data?.message || "No se pudo cambiar el estado", "error");
        }
    };

    const getBadge = (estado) => {
        const badges = {
            "solicitado": "bg-warning text-dark",
            "proceso": "bg-primary",
            "despachado": "bg-success",
            "cancelado": "bg-danger"
        };
        return badges[estado?.toLowerCase()] || "bg-secondary";
    };

    return (
        <div className="container mt-4">
            <h4 className="fw-bold mb-4">
                <i className="fa-solid fa-clipboard-list me-2"></i>
                Solicitudes Pendientes
            </h4>

            {loading ? (
                <div className="text-center mt-5">
                    <div className="spinner-border" role="status"></div>
                </div>
            ) : solicitudes.length === 0 ? (
                <div className="alert alert-info">No hay solicitudes pendientes.</div>
            ) : (
                solicitudes.map(sol => (
                    <div key={sol.Id_solicitud} className="card shadow-sm mb-4">
                        <div className="card-header d-flex justify-content-between align-items-center bg-dark text-white">
                            <span>
                                <strong>Solicitud #{sol.Id_solicitud}</strong> —{" "}
                                {sol.responsable?.Nom_Responsable ?? "Sin responsable"}
                            </span>
                            <span className={`badge ${getBadge(sol.ultimoEstado)}`}>
                                {sol.ultimoEstado ?? "Sin estado"}
                            </span>
                        </div>

                        <div className="card-body">
                            <div className="row mb-3">
                                <div className="col-md-3">
                                    <small className="text-muted">Motivo</small>
                                    <p className="fw-semibold mb-0">{sol.motivo}</p>
                                </div>

                                {/* ✅ NUEVO: DESCRIPCIÓN */}
                                <div className="col-md-3">
                                    <small className="text-muted">Descripción</small>
                                    <p className="fw-semibold mb-0">
                                        {sol.Descripcion || "Sin descripción"}
                                    </p>
                                </div>

                                {/* ✅ NUEVO: FICHA */}
                                <div className="col-md-2">
                                    <small className="text-muted">Ficha</small>
                                    <p className="fw-semibold mb-0">
                                        {sol.Ficha || "N/A"}
                                    </p>
                                </div>

                                <div className="col-md-2">
                                    <small className="text-muted">Fecha de entrega</small>
                                    <p className="fw-semibold mb-0">{sol.Fec_entrega}</p>
                                </div>

                                <div className="col-md-2">
                                    <small className="text-muted">Fecha de solicitud</small>
                                    <p className="fw-semibold mb-0">{sol.createdat?.slice(0, 10)}</p>
                                </div>
                            </div>

                            <h6 className="fw-bold mb-2">Insumos solicitados:</h6>
                            <table className="table table-sm table-bordered mb-3">
                                <thead className="table-dark">
                                    <tr>
                                        <th>Insumo</th>
                                        <th>Cantidad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(sol.insumos || []).length === 0 ? (
                                        <tr>
                                            <td colSpan={2} className="text-muted text-center">
                                                Sin insumos
                                            </td>
                                        </tr>
                                    ) : (
                                        (sol.insumos || []).map(item => (
                                            <tr key={item.id_insumo_solicitud}>
                                                <td>{item.insumo?.Nom_Insumo ?? `Insumo #${item.Id_insumos}`}</td>
                                                <td>{item.cantidad_solicitada}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>

                            <div className="d-flex gap-2 flex-wrap">

                                {sol.ultimoEstado?.toLowerCase() === "solicitado" && (
                                    <>
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => cambiarEstado(sol.Id_solicitud, 2, "proceso")}
                                        >
                                            <i className="fa-solid fa-check me-1"></i> Aceptar
                                        </button>

                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => cambiarEstado(sol.Id_solicitud, 4, "cancelado")}
                                        >
                                            <i className="fa-solid fa-ban me-1"></i> Cancelar
                                        </button>
                                    </>
                                )}

                                {sol.ultimoEstado?.toLowerCase() === "proceso" && (
                                    <>
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => cambiarEstado(sol.Id_solicitud, 3, "despachado")}
                                        >
                                            <i className="fa-solid fa-truck me-1"></i> Despachar
                                        </button>

                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => cambiarEstado(sol.Id_solicitud, 4, "cancelado")}
                                        >
                                            <i className="fa-solid fa-ban me-1"></i> Cancelar
                                        </button>
                                    </>
                                )}

                                {sol.ultimoEstado?.toLowerCase() === "despachado" && (
                                    <button className="btn btn-success btn-sm" disabled>
                                        <i className="fa-solid fa-check me-1"></i> Despachado
                                    </button>
                                )}

                                {sol.ultimoEstado?.toLowerCase() === "cancelado" && (
                                    <button className="btn btn-danger btn-sm" disabled>
                                        <i className="fa-solid fa-ban me-1"></i> Cancelado
                                    </button>
                                )}

                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default SolicitudPendientes;