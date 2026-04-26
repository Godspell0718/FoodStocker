import { useState, useEffect } from "react";
import apiAxios from "../api/axiosConfig.js";
import Swal from "sweetalert2";
import {
    ClipboardList, Calendar, FileText, Hash, Search,
    ArrowRight, ArrowLeft, Send, Plus, Trash2, ShoppingCart, Package
} from "lucide-react";

const inputClass = "tw-w-full tw-px-4 tw-py-2.5 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-gray-50 tw-text-sm tw-text-gray-700 focus:tw-outline-none focus:tw-border-primario-500 focus:tw-ring-2 focus:tw-ring-primario-100 focus:tw-bg-white tw-transition-all";
const labelClass = "tw-block tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wide tw-mb-1.5";

const SolicitudConLotes = () => {
    const [paso, setPaso] = useState(1);
    const [motivo] = useState("Practica de formacion");
    const [descripcion, setDescripcion] = useState("");
    const [ficha, setFicha] = useState("");
    const [fichaConfirm, setFichaConfirm] = useState("");
    const [fechaEntrega, setFechaEntrega] = useState("");
    const [insumos, setInsumos] = useState([]);
    const [filtro, setFiltro] = useState("");
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

    // Calcula el stock total disponible (lotes no vencidos)
    const calcularStockDisponible = (insumo) => {
        const hoy = new Date();
        return (insumo.entradas || [])
            .filter(lote => {
                const disponible = lote.Can_Inicial - lote.Can_Salida;
                const fechaVenc = new Date(lote.Fec_Ven_Entrada);
                return disponible > 0 && fechaVenc >= hoy;
            })
            .reduce((acc, lote) => acc + (lote.Can_Inicial - lote.Can_Salida), 0);
    };

    // Obtiene el lote más próximo a vencer con stock disponible
    const getLoteMasProximo = (insumo) => {
        const hoy = new Date();
        return (insumo.entradas || [])
            .filter(lote => {
                const disponible = lote.Can_Inicial - lote.Can_Salida;
                const fechaVenc = new Date(lote.Fec_Ven_Entrada);
                return disponible > 0 && fechaVenc >= hoy;
            })
            .sort((a, b) => new Date(a.Fec_Ven_Entrada) - new Date(b.Fec_Ven_Entrada))[0] || null;
    };

    const insumosFiltrados = insumos.filter(ins =>
        ins.Nom_Insumo.toLowerCase().includes(filtro.toLowerCase())
    );

    const handleAgregar = (insumo) => {
        const cantidad = parseInt(cantidades[insumo.Id_Insumos] || 0);
        if (!cantidad || cantidad <= 0) {
            Swal.fire("Cantidad inválida", "Ingresa una cantidad mayor a 0", "warning");
            return;
        }

        const stockTotal = calcularStockDisponible(insumo);
        if (cantidad > stockTotal) {
            Swal.fire("Stock insuficiente", `Solo hay ${stockTotal} unidades disponibles para ${insumo.Nom_Insumo}`, "warning");
            return;
        }

        // Ordenar lotes por fecha de vencimiento más próxima
        const hoy = new Date();
        const lotesOrdenados = (insumo.entradas || [])
            .filter(l => {
                const disp = l.Can_Inicial - l.Can_Salida;
                return disp > 0 && new Date(l.Fec_Ven_Entrada) >= hoy;
            })
            .sort((a, b) => new Date(a.Fec_Ven_Entrada) - new Date(b.Fec_Ven_Entrada));

        // Distribuir cantidad entre lotes automáticamente
        let restante = cantidad;
        const lotesUsados = [];
        for (const lote of lotesOrdenados) {
            if (restante <= 0) break;
            const disponible = lote.Can_Inicial - lote.Can_Salida;
            const tomado = Math.min(restante, disponible);
            lotesUsados.push({
                Id_Insumos: insumo.Id_Insumos,
                Id_Entradas: lote.Id_Entradas,
                Nom_Insumo: insumo.Nom_Insumo,
                Lote: lote.Lote,
                Fec_Ven: lote.Fec_Ven_Entrada,
                Uni_Med: insumo.Uni_Med_Insumo,
                cantidad: tomado
            });
            restante -= tomado;
        }

        // Reemplazar entradas previas del mismo insumo y agregar las nuevas
        const carritoSinEste = carrito.filter(item => item.Id_Insumos !== insumo.Id_Insumos);
        setCarrito([...carritoSinEste, ...lotesUsados]);
        setCantidades(prev => ({ ...prev, [insumo.Id_Insumos]: "" }));

        const msg = lotesUsados.length > 1
            ? `Distribuido en ${lotesUsados.length} lotes automáticamente`
            : `Lote ${lotesUsados[0].Lote} asignado`;
        Swal.fire({ icon: "success", title: "Agregado", text: msg, timer: 1000, showConfirmButton: false });
    };

    // Quita TODOS los lotes del insumo del carrito
    const handleQuitar = (Id_Insumos) => {
        setCarrito(carrito.filter(item => item.Id_Insumos !== Id_Insumos));
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
                motivo, descripcion, ficha,
                insumos: carrito.map(item => ({
                    Id_insumos: item.Id_Insumos,
                    Id_Entradas: item.Id_Entradas,
                    cantidad_solicitada: item.cantidad
                }))
            });
            Swal.fire({ title: "¡Solicitud creada!", text: "Tu solicitud fue registrada correctamente", icon: "success", timer: 1800, showConfirmButton: false });
            setDescripcion(""); setFicha(""); setFichaConfirm("");
            setFechaEntrega(""); setCarrito([]); setPaso(1);
            window.dispatchEvent(new Event("nuevaSolicitud"));
        } catch (error) {
            Swal.fire("Error", error.response?.data?.message || "Error al crear", "error");
        }
    };

    return (
        <div className="tw-p-2">

            {/* Header */}
            <div className="tw-flex tw-items-center tw-gap-3 tw-mb-6">
                <div className="tw-w-10 tw-h-10 tw-rounded-xl tw-bg-primario-900 tw-flex tw-items-center tw-justify-center tw-shadow-md">
                    <ClipboardList className="tw-w-5 tw-h-5 tw-text-secundario-400" />
                </div>
                <div>
                    <h1 className="tw-text-xl tw-font-bold tw-text-gray-800 tw-m-0">Nueva Solicitud de Insumos</h1>
                    <p className="tw-text-sm tw-text-gray-500 tw-m-0">El sistema asignará automáticamente el lote más próximo a vencer</p>
                </div>
            </div>

            {/* Stepper */}
            <div className="tw-flex tw-items-center tw-mb-6">
                <div className={`tw-flex tw-items-center tw-justify-center tw-w-8 tw-h-8 tw-rounded-full tw-text-sm tw-font-bold tw-shadow-sm ${paso >= 1 ? "tw-bg-primario-900 tw-text-secundario-400" : "tw-bg-gray-200 tw-text-gray-500"}`}>1</div>
                <div className={`tw-flex-1 tw-h-1 tw-mx-2 tw-rounded-full tw-transition-all ${paso >= 2 ? "tw-bg-primario-700" : "tw-bg-gray-200"}`} />
                <div className={`tw-flex tw-items-center tw-justify-center tw-w-8 tw-h-8 tw-rounded-full tw-text-sm tw-font-bold tw-shadow-sm ${paso >= 2 ? "tw-bg-primario-900 tw-text-secundario-400" : "tw-bg-gray-200 tw-text-gray-500"}`}>2</div>
            </div>

            {/* PASO 1 — Datos */}
            <div className="tw-bg-white tw-rounded-2xl tw-border tw-border-gray-100 tw-shadow-sm tw-p-5 tw-mb-4">
                <p className="tw-text-sm tw-font-semibold tw-text-gray-600 tw-mb-4">
                    {paso === 1 ? <span>Información de la solicitud</span> : <span>Resumen de la solicitud</span>}
                </p>
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                    <div>
                        <label className={labelClass}><FileText className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1" />Motivo</label>
                        <input className={`${inputClass} tw-opacity-60 tw-cursor-not-allowed`} value={motivo} disabled />
                    </div>
                    <div>
                        <label className={labelClass}><FileText className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1" />Descripción</label>
                        <input className={paso === 2 ? `${inputClass} tw-opacity-60 tw-cursor-not-allowed` : inputClass} value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción de la práctica..." disabled={paso === 2} />
                    </div>
                    <div>
                        <label className={labelClass}><Hash className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1" />Ficha</label>
                        <input type="number" className={paso === 2 ? `${inputClass} tw-opacity-60 tw-cursor-not-allowed` : inputClass} value={ficha} onChange={e => setFicha(e.target.value)} placeholder="Número de ficha" disabled={paso === 2} />
                    </div>
                    <div>
                        <label className={labelClass}><Hash className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1" />Confirmar Ficha</label>
                        <input type="number" className={paso === 2 ? `${inputClass} tw-opacity-60 tw-cursor-not-allowed` : inputClass} value={fichaConfirm} onChange={e => setFichaConfirm(e.target.value)} placeholder="Repite el número" disabled={paso === 2} />
                    </div>
                    <div className="md:tw-col-span-2">
                        <label className={labelClass}><Calendar className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1" />Fecha de entrega</label>
                        <input type="date" className={paso === 2 ? `${inputClass} tw-opacity-60 tw-cursor-not-allowed` : inputClass} value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)} disabled={paso === 2} />
                    </div>
                </div>
                <div className="tw-mt-4">
                    {paso === 1 ? (
                        <button onClick={handleSiguiente} className="tw-flex tw-items-center tw-gap-2 tw-px-5 tw-py-2.5 tw-rounded-xl tw-bg-primario-900 tw-text-white tw-font-medium tw-text-sm hover:tw-bg-primario-700 tw-transition-all tw-shadow-md">
                            <span>Siguiente</span> <ArrowRight className="tw-w-4 tw-h-4" />
                        </button>
                    ) : (
                        <button onClick={() => setPaso(1)} className="tw-flex tw-items-center tw-gap-2 tw-px-5 tw-py-2.5 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-white tw-text-gray-600 tw-text-sm hover:tw-bg-gray-50 tw-transition-all">
                            <ArrowLeft className="tw-w-4 tw-h-4" /> <span>Editar datos</span>
                        </button>
                    )}
                </div>
            </div>

            {/* PASO 2 — Selección de insumos */}
            {paso === 2 && (
                <div className="tw-flex tw-flex-col tw-gap-4">

                    {/* Buscador */}
                    <div className="tw-relative">
                        <Search className="tw-absolute tw-left-3 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-gray-400" />
                        <input type="text" className={`${inputClass} tw-pl-9`} placeholder="Filtrar por nombre del insumo..." value={filtro} onChange={e => setFiltro(e.target.value)} />
                    </div>

                    {/* Tabla de insumos — sin selección de lote */}
                    <div className="tw-bg-white tw-rounded-2xl tw-border tw-border-gray-100 tw-shadow-sm tw-overflow-hidden">
                        <div className="tw-overflow-auto" style={{ maxHeight: 380 }}>
                            <table className="tw-w-full tw-text-sm">
                                <thead className="tw-sticky tw-top-0">
                                    <tr className="tw-bg-primario-900">
                                        <th className="tw-text-left tw-px-4 tw-py-3 tw-text-xs tw-font-semibold tw-text-primario-100 tw-uppercase tw-tracking-wide">Insumo</th>
                                        <th className="tw-text-left tw-px-4 tw-py-3 tw-text-xs tw-font-semibold tw-text-primario-100 tw-uppercase tw-tracking-wide">Stock disponible</th>
                                        <th className="tw-text-left tw-px-4 tw-py-3 tw-text-xs tw-font-semibold tw-text-primario-100 tw-uppercase tw-tracking-wide tw-w-32">Cantidad</th>
                                        <th className="tw-px-4 tw-py-3 tw-w-28" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {insumosFiltrados.length === 0 ? (
                                        <tr><td colSpan={4} className="tw-py-10 tw-text-center tw-text-gray-400 tw-text-sm"><span>No se encontraron insumos</span></td></tr>
                                    ) : (
                                        insumosFiltrados.map(ins => {
                                            const stockTotal = calcularStockDisponible(ins);
                                            const sinStock = stockTotal === 0;
                                            return (
                                                <tr key={ins.Id_Insumos} className={`tw-border-t tw-border-gray-100 tw-transition-colors ${sinStock ? "tw-opacity-40" : "hover:tw-bg-gray-50"}`}>
                                                    <td className="tw-px-4 tw-py-3">
                                                        <p className="tw-font-semibold tw-text-gray-800 tw-m-0">{ins.Nom_Insumo}</p>
                                                        <p className="tw-text-xs tw-text-gray-400 tw-m-0">{ins.Uni_Med_Insumo}</p>
                                                    </td>
                                                    <td className="tw-px-4 tw-py-3">
                                                        <span className={`tw-inline-flex tw-items-center tw-px-2.5 tw-py-1 tw-rounded-lg tw-text-xs tw-font-bold ${sinStock ? "tw-bg-red-50 tw-text-red-500" : "tw-bg-green-50 tw-text-green-700"}`}>
                                                            {sinStock ? <span>Sin stock</span> : <span>{stockTotal} {ins.Uni_Med_Insumo}</span>}
                                                        </span>
                                                    </td>
                                                    <td className="tw-px-4 tw-py-3">
                                                        <input
                                                            type="number"
                                                            className="tw-w-24 tw-px-3 tw-py-1.5 tw-rounded-lg tw-border tw-border-gray-200 tw-text-sm focus:tw-outline-none focus:tw-border-primario-400 tw-bg-gray-50 disabled:tw-opacity-40"
                                                            min={1}
                                                            max={stockTotal}
                                                            value={cantidades[ins.Id_Insumos] || ""}
                                                            onChange={e => setCantidades(prev => ({ ...prev, [ins.Id_Insumos]: e.target.value }))}
                                                            disabled={sinStock}
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                    <td className="tw-px-4 tw-py-3">
                                                        <button
                                                            onClick={() => handleAgregar(ins)}
                                                            disabled={sinStock}
                                                            className="tw-flex tw-items-center tw-gap-1.5 tw-px-3 tw-py-1.5 tw-rounded-lg tw-bg-primario-900 tw-text-white tw-text-xs tw-font-medium hover:tw-bg-primario-700 tw-transition-all disabled:tw-opacity-40 disabled:tw-cursor-not-allowed"
                                                        >
                                                            <Plus className="tw-w-3.5 tw-h-3.5" /> <span>Agregar</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Carrito */}
                    {carrito.length > 0 && (
                        <div className="tw-bg-white tw-rounded-2xl tw-border tw-border-primario-100 tw-shadow-sm tw-overflow-hidden">
                            <div className="tw-flex tw-items-center tw-justify-between tw-px-5 tw-py-3 tw-bg-primario-900">
                                <div className="tw-flex tw-items-center tw-gap-2">
                                    <ShoppingCart className="tw-w-4 tw-h-4 tw-text-secundario-400" />
                                    <span className="tw-text-white tw-text-sm tw-font-semibold">Insumos a solicitar ({carrito.length})</span>
                                </div>
                            </div>
                            <table className="tw-w-full tw-text-sm">
                                <thead>
                                    <tr className="tw-bg-gray-50">
                                        <th className="tw-text-left tw-px-4 tw-py-2.5 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wide">Insumo</th>
                                        <th className="tw-text-left tw-px-4 tw-py-2.5 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wide">Lote asignado</th>
                                        <th className="tw-text-left tw-px-4 tw-py-2.5 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wide">Vence</th>
                                        <th className="tw-text-left tw-px-4 tw-py-2.5 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wide">Cantidad</th>
                                        <th />
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Agrupar por insumo: mostrar fila de eliminar solo en el primer lote */}
                                    {carrito.map((item, idx) => {
                                        const esPrimeroDeInsumo = idx === 0 || carrito[idx - 1].Id_Insumos !== item.Id_Insumos;
                                        const totalLotesInsumo = carrito.filter(i => i.Id_Insumos === item.Id_Insumos).length;
                                        return (
                                            <tr key={item.Id_Entradas} className="tw-border-t tw-border-gray-100 hover:tw-bg-gray-50">
                                                <td className="tw-px-4 tw-py-2.5 tw-font-medium tw-text-gray-700">
                                                    {esPrimeroDeInsumo ? item.Nom_Insumo : (
                                                        <span className="tw-text-gray-300 tw-text-xs tw-pl-2">↳</span>
                                                    )}
                                                </td>
                                                <td className="tw-px-4 tw-py-2.5">
                                                    <span className="tw-inline-flex tw-items-center tw-gap-1 tw-px-2 tw-py-0.5 tw-rounded-md tw-bg-gray-100 tw-text-gray-600 tw-text-xs">
                                                        <Package className="tw-w-3 tw-h-3" />{item.Lote}
                                                    </span>
                                                </td>
                                                <td className="tw-px-4 tw-py-2.5 tw-text-orange-500 tw-text-xs tw-font-medium">{item.Fec_Ven}</td>
                                                <td className="tw-px-4 tw-py-2.5">
                                                    <span className="tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-md tw-bg-primario-50 tw-text-primario-800 tw-font-bold tw-text-xs">
                                                        {item.cantidad} {item.Uni_Med}
                                                    </span>
                                                </td>
                                                <td className="tw-px-4 tw-py-2.5">
                                                    {esPrimeroDeInsumo && (
                                                        <button
                                                            title={totalLotesInsumo > 1 ? `Quitar ${totalLotesInsumo} lotes de ${item.Nom_Insumo}` : `Quitar ${item.Nom_Insumo}`}
                                                            onClick={() => handleQuitar(item.Id_Insumos)}
                                                            className="tw-flex tw-items-center tw-justify-center tw-w-7 tw-h-7 tw-rounded-lg tw-text-red-400 hover:tw-bg-red-50 hover:tw-text-red-600 tw-transition-all"
                                                        >
                                                            <Trash2 className="tw-w-3.5 tw-h-3.5" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <div className="tw-px-5 tw-py-4 tw-border-t tw-border-gray-100">
                                <button onClick={handleEnviar} className="tw-w-full tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-4 tw-py-2.5 tw-rounded-xl tw-bg-primario-900 tw-text-white tw-font-medium tw-text-sm hover:tw-bg-primario-700 tw-transition-all tw-shadow-md">
                                    <Send className="tw-w-4 tw-h-4" /> <span>Crear Solicitud</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SolicitudConLotes;