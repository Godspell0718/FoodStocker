import { useState, useEffect } from "react";
import apiAxios from "../api/axiosConfig.js";
import Swal from "sweetalert2";

const SolicitudFormNuevo = ({ hideModal }) => {
    const [paso, setPaso] = useState(1);

    // Datos del paso 1
    const [formData, setFormData] = useState({
        motivo: "",
        Fec_entrega: ""
    });

    // Insumos disponibles y búsqueda
    const [insumos, setInsumos] = useState([]);
    const [filtro, setFiltro] = useState("");
    const [cantidades, setCantidades] = useState({});

    // Carrito de insumos seleccionados
    const [carrito, setCarrito] = useState([]);

    // Usuario logueado
    const usuario = JSON.parse(localStorage.getItem("userFoodStocker") || "{}");

    useEffect(() => {
        if (paso === 2) cargarInsumos();
    }, [paso]);

    const cargarInsumos = async () => {
        try {
            const res = await apiAxios.get("/api/insumos/con-stock");
            setInsumos(res.data);
        } catch (error) {
            console.error("Error al cargar insumos:", error);
        }
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const siguientePaso = () => {
        if (!formData.motivo || !formData.Fec_entrega) {
            Swal.fire("Campos requeridos", "Por favor completa el motivo y la fecha de entrega", "warning");
            return;
        }
        setPaso(2);
    };

    const insumosFiltrados = insumos.filter(ins =>
        ins.Nom_Insumo.toLowerCase().includes(filtro.toLowerCase())
    );

    const agregarAlCarrito = (insumo) => {
        const cantidad = parseInt(cantidades[insumo.Id_Insumos] || 0);
        if (!cantidad || cantidad <= 0) {
            Swal.fire("Cantidad inválida", "Ingresa una cantidad mayor a 0", "warning");
            return;
        }

        const stockDisponible = insumo.stockReal ?? 0;
        if (cantidad > stockDisponible) {
            Swal.fire("Sin stock suficiente", `Solo hay ${stockDisponible} unidades disponibles`, "warning");
            return;
        }

        const yaExiste = carrito.find(item => item.Id_Insumos === insumo.Id_Insumos);
        if (yaExiste) {
            setCarrito(carrito.map(item =>
                item.Id_Insumos === insumo.Id_Insumos ? { ...item, cantidad } : item
            ));
        } else {
            setCarrito([...carrito, {
                Id_Insumos: insumo.Id_Insumos,
                Nom_Insumo: insumo.Nom_Insumo,
                Uni_Med_Insumo: insumo.Uni_Med_Insumo,
                cantidad
            }]);
        }

        setCantidades({ ...cantidades, [insumo.Id_Insumos]: "" });
        Swal.fire({ icon: "success", title: "Agregado", text: `${insumo.Nom_Insumo} agregado`, timer: 900, showConfirmButton: false });
    };

    const quitarDelCarrito = (Id_Insumos) => {
        setCarrito(carrito.filter(item => item.Id_Insumos !== Id_Insumos));
    };

    const enviarSolicitud = async () => {
        if (carrito.length === 0) {
            Swal.fire("Carrito vacío", "Agrega al menos un insumo", "warning");
            return;
        }

        try {
            await apiAxios.post("/api/solicitudes/completa", {
                Id_Responsable: usuario.id,
                Fec_entrega: formData.Fec_entrega,
                motivo: formData.motivo,
                insumos: carrito.map(item => ({
                    Id_insumos: item.Id_Insumos,
                    cantidad_solicitada: item.cantidad
                }))
            });

            Swal.fire("¡Solicitud creada!", "Tu solicitud fue registrada correctamente", "success");
            hideModal();
        } catch (error) {
            console.error("Error al crear solicitud:", error);
            Swal.fire("Error", error.response?.data?.message || "Error al crear la solicitud", "error");
        }
    };

    return (
        <div className="col-12">
            {/* Indicador de pasos */}
            <div className="d-flex align-items-center mb-4">
                <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold me-2"
                    style={{ width: 32, height: 32, background: paso >= 1 ? "#212529" : "#ccc", color: "white", fontSize: 14 }}>
                    1
                </div>
                <div style={{ flex: 1, height: 3, background: paso >= 2 ? "#212529" : "#ccc" }}></div>
                <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold ms-2"
                    style={{ width: 32, height: 32, background: paso >= 2 ? "#212529" : "#ccc", color: "white", fontSize: 14 }}>
                    2
                </div>
            </div>

            {/* ======================== PASO 1 ======================== */}
            {paso === 1 && (
                <div>
                    <h6 className="fw-bold mb-3">Información de la solicitud</h6>

                    <div className="mb-3">
                        <label className="form-label">Motivo</label>
                        <input
                            type="text"
                            id="motivo"
                            className="form-control"
                            placeholder="Ej: Práctica de panadería"
                            value={formData.motivo}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Fecha de entrega</label>
                        <input
                            type="date"
                            id="Fec_entrega"
                            className="form-control"
                            value={formData.Fec_entrega}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="mb-2 text-muted small">
                        <i className="fa-solid fa-user me-1"></i>
                        Solicitante: <strong>{usuario.nombre || "No identificado"}</strong>
                    </div>

                    <div className="d-flex gap-2 mt-4">
                        <button className="btn btn-dark flex-fill" onClick={siguientePaso}>
                            Siguiente <i className="fa-solid fa-arrow-right ms-1"></i>
                        </button>
                        <button className="btn btn-outline-dark" onClick={hideModal}>Cancelar</button>
                    </div>
                </div>
            )}

            {/* ======================== PASO 2 ======================== */}
            {paso === 2 && (
                <div>
                    <h6 className="fw-bold mb-3">Seleccionar insumos</h6>

                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Filtrar por nombre del insumo..."
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        />
                    </div>

                    {/* Tabla de insumos */}
                    <div style={{ maxHeight: 240, overflowY: "auto" }} className="mb-3">
                        <table className="table table-sm table-bordered table-hover mb-0">
                            <thead className="table-dark sticky-top">
                                <tr>
                                    <th>Insumo</th>
                                    <th>Stock disponible</th>
                                    <th>Cantidad</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {insumosFiltrados.length === 0 ? (
                                    <tr><td colSpan={4} className="text-center text-muted">No se encontraron insumos</td></tr>
                                ) : (
                                    insumosFiltrados.map(ins => (
                                        <tr key={ins.Id_Insumos}>
                                            <td>{ins.Nom_Insumo}</td>
                                            <td>{ins.stockReal ?? 0} {ins.Uni_Med_Insumo}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    min={1}
                                                    max={ins.stockReal ?? 0}
                                                    style={{ width: 75 }}
                                                    value={cantidades[ins.Id_Insumos] || ""}
                                                    onChange={(e) => setCantidades({ ...cantidades, [ins.Id_Insumos]: e.target.value })}
                                                />
                                            </td>
                                            <td>
                                                <button className="btn btn-dark btn-sm" onClick={() => agregarAlCarrito(ins)}>
                                                    Agregar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Carrito */}
                    {carrito.length > 0 && (
                        <div className="mb-3 border rounded p-2">
                            <h6 className="fw-bold mb-2"><i className="fa-solid fa-cart-shopping me-1"></i> Insumos seleccionados</h6>
                            <ul className="list-group list-group-flush">
                                {carrito.map(item => (
                                    <li key={item.Id_Insumos} className="list-group-item d-flex justify-content-between align-items-center px-0 py-1">
                                        <span>{item.Nom_Insumo} — <strong>{item.cantidad} {item.Uni_Med_Insumo}</strong></span>
                                        <button className="btn btn-outline-danger btn-sm" onClick={() => quitarDelCarrito(item.Id_Insumos)}>
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="d-flex gap-2 mt-3">
                        <button className="btn btn-outline-dark" onClick={() => setPaso(1)}>
                            <i className="fa-solid fa-arrow-left me-1"></i> Atrás
                        </button>
                        <button className="btn btn-dark flex-fill" onClick={enviarSolicitud}>
                            <i className="fa-solid fa-paper-plane me-1"></i> Crear Solicitud
                        </button>
                        <button className="btn btn-outline-dark" onClick={hideModal}>Cancelar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SolicitudFormNuevo;