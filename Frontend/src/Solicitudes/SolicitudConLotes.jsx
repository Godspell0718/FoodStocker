import { useState, useEffect } from "react";
import apiAxios from "../api/axiosConfig.js";
import Swal from "sweetalert2";

const SolicitudConLotes = () => {
    const [paso, setPaso] = useState(1);

    const [motivo] = useState("Practica de formacion");
    const [descripcion, setDescripcion] = useState("");
    const [ficha, setFicha] = useState("");
    const [fichaConfirm, setFichaConfirm] = useState("");

    const [fechaEntrega, setFechaEntrega] = useState("");

    const [insumos, setInsumos] = useState([]);
    const [filtro, setFiltro] = useState("");

    const [loteSeleccionado, setLoteSeleccionado] = useState({});
    const [cantidades, setCantidades] = useState({});
    const [carrito, setCarrito] = useState([]);

    const usuario = JSON.parse(localStorage.getItem("userFoodStocker") || "{}");

    useEffect(() => {
        if (paso === 2) cargarInsumosConLotes();
    }, [paso]);

    const cargarInsumosConLotes = async () => {
        try {
            const res = await apiAxios.get("/api/insumos/con-lotes");
            setInsumos(res.data);
        } catch (error) {
            console.error("Error cargando insumos:", error);
        }
    };

    const handleSiguiente = () => {
        if (!fechaEntrega || !descripcion.trim() || !ficha || !fichaConfirm) {
            Swal.fire("Campos requeridos", "Completa todos los campos", "warning");
            return;
        }

        if (ficha !== fichaConfirm) {
            Swal.fire("Error", "Los números de ficha no coinciden", "error");
            return;
        }

        setPaso(2);
    };

    const insumosFiltrados = insumos.filter(ins =>
        ins.Nom_Insumo.toLowerCase().includes(filtro.toLowerCase())
    );

    const handleCheckbox = (Id_Insumos, Id_Entradas) => {
        setLoteSeleccionado(prev => ({
            ...prev,
            [Id_Insumos]: prev[Id_Insumos] === Id_Entradas ? null : Id_Entradas
        }));
    };

    const handleAgregar = (insumo) => {
        const lote = insumo.entradas?.find(e => e.Id_Entradas === loteSeleccionado[insumo.Id_Insumos]);

        if (!lote) {
            Swal.fire("Selecciona un lote", "Marca el checkbox del lote que deseas", "warning");
            return;
        }

        const cantidad = parseInt(cantidades[insumo.Id_Insumos] || 0);

        if (!cantidad || cantidad <= 0) {
            Swal.fire("Cantidad inválida", "Ingresa una cantidad mayor a 0", "warning");
            return;
        }

        const stockLote = lote.Can_Inicial - lote.Can_Salida;

        if (cantidad > stockLote) {
            Swal.fire("Stock insuficiente", `Este lote solo tiene ${stockLote} disponibles`, "warning");
            return;
        }

        const yaExiste = carrito.find(item => item.Id_Entradas === lote.Id_Entradas);

        if (yaExiste) {
            setCarrito(carrito.map(item =>
                item.Id_Entradas === lote.Id_Entradas ? { ...item, cantidad } : item
            ));
        } else {
            setCarrito([...carrito, {
                Id_Insumos: insumo.Id_Insumos,
                Id_Entradas: lote.Id_Entradas,
                Nom_Insumo: insumo.Nom_Insumo,
                Lote: lote.Lote,
                Fec_Ven: lote.Fec_Ven_Entrada,
                Uni_Med: insumo.Uni_Med_Insumo,
                cantidad
            }]);
        }

        setCantidades(prev => ({ ...prev, [insumo.Id_Insumos]: "" }));
        setLoteSeleccionado(prev => ({ ...prev, [insumo.Id_Insumos]: null }));

        Swal.fire({ icon: "success", title: "Agregado", timer: 800, showConfirmButton: false });
    };

    const handleQuitar = (Id_Entradas) => {
        setCarrito(carrito.filter(item => item.Id_Entradas !== Id_Entradas));
    };

    const handleEnviar = async () => {
        if (carrito.length === 0) {
            Swal.fire("Carrito vacío", "Agrega al menos un insumo", "warning");
            return;
        }

        try {
            await apiAxios.post("/api/solicitudes/completa", {
                Id_Responsable: usuario.id,
                Fec_entrega: fechaEntrega,
                motivo,
                descripcion,
                ficha,
                insumos: carrito.map(item => ({
                    Id_insumos: item.Id_Insumos,
                    Id_Entradas: item.Id_Entradas,
                    cantidad_solicitada: item.cantidad
                }))
            });

            Swal.fire("¡Solicitud creada!", "Tu solicitud fue registrada correctamente", "success");

            setDescripcion("");
            setFicha("");
            setFichaConfirm("");
            setFechaEntrega("");
            setCarrito([]);
            setPaso(1);

        } catch (error) {
            Swal.fire("Error", error.response?.data?.message || "Error al crear", "error");
        }
    };

    return (
        <div className="container mt-4">
            <h4 className="fw-bold mb-4">Nueva Solicitud de Insumos</h4>

            {/* PASO 1 */}
            <div className="card mb-4 shadow-sm">
                <div className="card-body">
                    <div className="row g-3 align-items-end">

                        <div className="col-md-3">
                            <label className="form-label fw-semibold">Motivo</label>
                            <input className="form-control" value={motivo} disabled />
                        </div>

                        <div className="col-md-3">
                            <label className="form-label fw-semibold">Descripción</label>
                            <input
                                className="form-control"
                                value={descripcion}
                                onChange={e => setDescripcion(e.target.value)}
                                disabled={paso === 2}
                            />
                        </div>

                        <div className="col-md-2">
                            <label className="form-label fw-semibold">Ficha</label>
                            <input
                                type="number"
                                className="form-control"
                                value={ficha}
                                onChange={e => setFicha(e.target.value)}
                                disabled={paso === 2}
                            />
                        </div>

                        <div className="col-md-2">
                            <label className="form-label fw-semibold">Confirmar ficha</label>
                            <input
                                type="number"
                                className="form-control"
                                value={fichaConfirm}
                                onChange={e => setFichaConfirm(e.target.value)}
                                disabled={paso === 2}
                            />
                        </div>

                        <div className="col-md-2">
                            <label className="form-label fw-semibold">Fecha para cuándo</label>
                            <input
                                type="date"
                                className="form-control"
                                value={fechaEntrega}
                                onChange={e => setFechaEntrega(e.target.value)}
                                disabled={paso === 2}
                            />
                        </div>

                        <div className="col-md-12">
                            {paso === 1 ? (
                                <button className="btn btn-dark w-100" onClick={handleSiguiente}>
                                    Siguiente →
                                </button>
                            ) : (
                                <button className="btn btn-outline-dark w-100" onClick={() => setPaso(1)}>
                                    ← Editar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* PASO 2 → EXACTAMENTE TU DISEÑO */}
            {paso === 2 && (
                <div className="card shadow-sm">
                    <div className="card-body">

                        <div className="mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Filtro: El usuario empieza a digitar el nombre del insumo"
                                value={filtro}
                                onChange={e => setFiltro(e.target.value)}
                            />
                        </div>

                        <div style={{ maxHeight: 350, overflowY: "auto" }}>
                            <table className="table table-bordered table-hover table-sm mb-0">
                                <thead className="table-dark sticky-top">
                                    <tr>
                                        <th>Nombre Insumo</th>
                                        <th>Lotes disponibles ordenados por fecha de vencimiento</th>
                                        <th>Cantidad</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {insumosFiltrados.map(ins => {
                                        const hoy = new Date();

                                        const lotes = (ins.entradas || [])
                                            .filter(lote => {
                                                const disponible = lote.Can_Inicial - lote.Can_Salida;
                                                const fechaVencimiento = new Date(lote.Fec_Ven_Entrada);
                                                return disponible > 0 && fechaVencimiento >= hoy;
                                            })
                                            .sort((a, b) =>
                                                new Date(a.Fec_Ven_Entrada) - new Date(b.Fec_Ven_Entrada)
                                            );

                                        return (
                                            <tr key={ins.Id_Insumos}>
                                                <td className="align-middle fw-semibold">
                                                    {ins.Nom_Insumo}
                                                    <br />
                                                    <small className="text-muted">{ins.Uni_Med_Insumo}</small>
                                                </td>

                                                <td>
                                                    {lotes.map(lote => {
                                                        const disponible = lote.Can_Inicial - lote.Can_Salida;
                                                        const seleccionado =
                                                            loteSeleccionado[ins.Id_Insumos] === lote.Id_Entradas;

                                                        return (
                                                            <div key={lote.Id_Entradas} className="form-check mb-1">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-check-input"
                                                                    checked={seleccionado}
                                                                    onChange={() =>
                                                                        handleCheckbox(ins.Id_Insumos, lote.Id_Entradas)
                                                                    }
                                                                />
                                                                <label className="form-check-label small">
                                                                    <strong>{lote.Lote}</strong> — vence: {lote.Fec_Ven_Entrada} — disponible: <strong>{disponible}</strong>
                                                                </label>
                                                            </div>
                                                        );
                                                    })}
                                                </td>

                                                <td className="align-middle">
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm"
                                                        min={1}
                                                        style={{ width: 80 }}
                                                        value={cantidades[ins.Id_Insumos] || ""}
                                                        onChange={e => setCantidades(prev => ({
                                                            ...prev,
                                                            [ins.Id_Insumos]: e.target.value
                                                        }))}
                                                    />
                                                </td>

                                                <td className="align-middle">
                                                    <button
                                                        className="btn btn-dark btn-sm"
                                                        onClick={() => handleAgregar(ins)}
                                                        disabled={lotes.length === 0}
                                                    >
                                                        Agregar
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {carrito.length > 0 && (
                            <div className="mt-4">
                                <h6 className="fw-bold">
                                    <i className="fa-solid fa-cart-shopping me-1"></i>
                                    Insumos seleccionados
                                </h6>

                                <table className="table table-sm table-bordered">
                                    <thead className="table-secondary">
                                        <tr>
                                            <th>Insumo</th>
                                            <th>Lote</th>
                                            <th>Vence</th>
                                            <th>Cantidad</th>
                                            <th></th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {carrito.map(item => (
                                            <tr key={item.Id_Entradas}>
                                                <td>{item.Nom_Insumo}</td>
                                                <td>{item.Lote}</td>
                                                <td>{item.Fec_Ven}</td>
                                                <td>
                                                    <strong>{item.cantidad}</strong> {item.Uni_Med}
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-outline-danger btn-sm"
                                                        onClick={() => handleQuitar(item.Id_Entradas)}
                                                    >
                                                        <i className="fa-solid fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <button className="btn btn-dark w-100 mt-2" onClick={handleEnviar}>
                                    <i className="fa-solid fa-paper-plane me-2"></i>
                                    Crear Solicitud
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SolicitudConLotes;