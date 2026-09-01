import { useState, useEffect } from "react";
import apiAxios from "../api/axiosConfig.js";
import Swal from "sweetalert2";
import {
    FileText, Calendar, User, Search, ShoppingCart,
    Plus, Trash2, ArrowRight, ArrowLeft, Send, X, Package,
    MapPin, ChevronDown, Loader2
} from "lucide-react";

const SolicitudFormNuevo = ({ hideModal }) => {
    const [paso, setPaso] = useState(1);

    const [formData, setFormData] = useState({ motivo: "", Fec_entrega: "", Id_Destino: "" });
    const [insumos, setInsumos] = useState([]);
    const [destinos, setDestinos] = useState([]);
    const [filtro, setFiltro] = useState("");
    const [cantidades, setCantidades] = useState({});
    const [carrito, setCarrito] = useState([]);
    const [enviando, setEnviando] = useState(false);

    const usuario = JSON.parse(localStorage.getItem("userFoodStocker") || "{}");

    useEffect(() => {
        cargarDestinos();
    }, []);

    useEffect(() => {
        if (paso === 2) cargarInsumos();
    }, [paso]);

    const cargarDestinos = async () => {
        try {
            const res = await apiAxios.get("/api/destino");
            const activos = (Array.isArray(res.data) ? res.data : []).filter(d => (d.Estado || 'ACTIVO') === 'ACTIVO');
            setDestinos(activos);
        } catch (error) {
            console.error("Error al cargar destinos:", error);
        }
    };

    const cargarInsumos = async () => {
        try {
            const res = await apiAxios.get("/api/insumos/con-lotes");
            setInsumos(res.data);
        } catch (error) {
            console.error("Error al cargar insumos:", error);
        }
    };

    /** Calcula el stock total disponible (lotes con stock y no vencidos) */
    const calcularStockDisponible = (insumo) => {
        const hoy = new Date();
        return (insumo.entradas || [])
            .filter(lote => {
                const disponible = lote.Can_Inicial - lote.Can_Salida;
                const fechaVenc = new Date(lote.Fec_Ven_Entrada);
                return disponible > 0 && fechaVenc >= hoy && lote.Estado === "STOCK";
            })
            .reduce((acc, lote) => acc + (lote.Can_Inicial - lote.Can_Salida), 0);
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
        const hoy = new Date().toISOString().split("T")[0];
        if (formData.Fec_entrega < hoy) {
            Swal.fire("Fecha inválida", "La fecha de entrega no puede ser anterior a hoy", "warning");
            return;
        }
        setPaso(2);
    };

    const insumosFiltrados = insumos.filter(ins =>
        (ins.Estado || 'ACTIVO') === 'ACTIVO' &&
        ins.Nom_Insumo.toLowerCase().includes(filtro.toLowerCase())
    );

    const agregarAlCarrito = (insumo) => {
        const cantidad = parseInt(cantidades[insumo.Id_Insumos] || 0);
        if (!cantidad || cantidad <= 0) {
            Swal.fire("Cantidad inválida", "Ingresa una cantidad mayor a 0", "warning");
            return;
        }

        const stockTotal = calcularStockDisponible(insumo);
        if (cantidad > stockTotal) {
            Swal.fire("Sin stock suficiente", `Solo hay ${stockTotal} unidades disponibles para ${insumo.Nom_Insumo}`, "warning");
            return;
        }

        // Ordenar lotes por fecha de vencimiento (FEFO) y asignar automáticamente
        const hoy = new Date();
        const lotesOrdenados = (insumo.entradas || [])
            .filter(l => {
                const disp = l.Can_Inicial - l.Can_Salida;
                return disp > 0 && new Date(l.Fec_Ven_Entrada) >= hoy && l.Estado === "STOCK";
            })
            .sort((a, b) => new Date(a.Fec_Ven_Entrada) - new Date(b.Fec_Ven_Entrada));

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
                Uni_Med_Insumo: insumo.Uni_Med_Insumo,
                Lote: lote.Lote,
                Fec_Ven: lote.Fec_Ven_Entrada,
                cantidad: tomado
            });
            restante -= tomado;
        }

        // Reemplazar lotes anteriores del mismo insumo
        const carritoSinEste = carrito.filter(item => item.Id_Insumos !== insumo.Id_Insumos);
        setCarrito([...carritoSinEste, ...lotesUsados]);
        setCantidades({ ...cantidades, [insumo.Id_Insumos]: "" });

        const msg = lotesUsados.length > 1
            ? `Distribuido en ${lotesUsados.length} lotes automáticamente`
            : `Lote ${lotesUsados[0].Lote} asignado`;
        Swal.fire({ icon: "success", title: "Agregado", text: msg, timer: 1000, showConfirmButton: false });
    };

    const quitarDelCarrito = (Id_Insumos) => {
        setCarrito(carrito.filter(item => item.Id_Insumos !== Id_Insumos));
    };

    const enviarSolicitud = async () => {
        if (carrito.length === 0) {
            Swal.fire("Carrito vacío", "Agrega al menos un insumo", "warning");
            return;
        }

        // Agrupar carrito por insumo para el resumen
        const agrupado = carrito.reduce((acc, item) => {
            if (!acc[item.Nom_Insumo]) {
                acc[item.Nom_Insumo] = { total: 0, lotes: [] };
            }
            acc[item.Nom_Insumo].total += item.cantidad;
            acc[item.Nom_Insumo].lotes.push({ lote: item.Lote, cantidad: item.cantidad, vence: item.Fec_Ven });
            return acc;
        }, {});

        const totalLotes = carrito.length;
        const destinoNombre = destinos.find(d => d.Id_Destino == formData.Id_Destino)?.Nom_Destino;

        let resumenHTML = `
            <div style="text-align: left;">
                <p><strong>Motivo:</strong> ${formData.motivo}</p>
                <p><strong>Fecha de entrega:</strong> ${formData.Fec_entrega}</p>
                ${destinoNombre ? `<p><strong>Destino:</strong> ${destinoNombre}</p>` : ""}
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 12px 0;" />
                <p style="font-weight: 600; margin-bottom: 8px;">Insumos solicitados (${totalLotes} lote(s)):</p>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    ${Object.entries(agrupado).map(([nombre, info]) => `
                        <li style="padding: 6px 0; border-bottom: 1px solid #f3f4f6;">
                            <div style="display: flex; justify-content: space-between;">
                                <span>${nombre}</span>
                                <span style="font-weight: 600;">${info.total} ${carrito.find(i => i.Nom_Insumo === nombre)?.Uni_Med_Insumo || "unidad"}</span>
                            </div>
                            ${info.lotes.length > 0 ? `
                                <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">
                                    ${info.lotes.map(l => `Lote ${l.lote} (${l.cantidad} uds, vence: ${l.vence})`).join(" · ")}
                                </div>
                            ` : ""}
                        </li>
                    `).join("")}
                </ul>
            </div>
        `;

        const confirmacion = await Swal.fire({
            title: "¿Confirmar solicitud?",
            html: resumenHTML,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#1e3a5f",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Sí, enviar solicitud",
            cancelButtonText: "Cancelar",
            reverseButtons: true,
            focusConfirm: false
        });

        if (!confirmacion.isConfirmed) return;

        setEnviando(true);
        try {
            await apiAxios.post("/api/solicitudes/completa", {
                Id_Responsable: usuario.id,
                Fec_entrega: formData.Fec_entrega,
                motivo: formData.motivo,
                Id_Destino: formData.Id_Destino || null,
                insumos: carrito.map(item => ({
                    Id_insumos: item.Id_Insumos,
                    Id_Entradas: item.Id_Entradas,
                    cantidad_solicitada: item.cantidad
                }))
            });
            setEnviando(false);
            Swal.fire({ title: "¡Solicitud creada!", text: "Tu solicitud fue registrada correctamente", icon: "success", timer: 1800, showConfirmButton: false });
            hideModal();
        } catch (error) {
            setEnviando(false);
            Swal.fire("Error", error.response?.data?.message || "Error al crear la solicitud", "error");
        }
    };

    const inputClass = "tw-w-full tw-px-4 tw-py-2.5 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-gray-50 tw-text-sm tw-text-gray-700 focus:tw-outline-none focus:tw-border-primario-500 focus:tw-ring-2 focus:tw-ring-primario-100 focus:tw-bg-white tw-transition-all";
    const labelClass = "tw-block tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wide tw-mb-1.5";

    return (
        <div>
            {/* Stepper */}
            <div className="tw-flex tw-items-center tw-mb-6">
                <div className={`tw-flex tw-items-center tw-justify-center tw-w-8 tw-h-8 tw-rounded-full tw-text-sm tw-font-bold tw-shadow-sm tw-transition-all ${paso >= 1 ? "tw-bg-primario-900 tw-text-secundario-400" : "tw-bg-gray-200 tw-text-gray-500"}`}>1</div>
                <div className={`tw-flex-1 tw-h-1 tw-mx-2 tw-rounded-full tw-transition-all ${paso >= 2 ? "tw-bg-primario-700" : "tw-bg-gray-200"}`} />
                <div className={`tw-flex tw-items-center tw-justify-center tw-w-8 tw-h-8 tw-rounded-full tw-text-sm tw-font-bold tw-shadow-sm tw-transition-all ${paso >= 2 ? "tw-bg-primario-900 tw-text-secundario-400" : "tw-bg-gray-200 tw-text-gray-500"}`}>2</div>
            </div>

            {/* PASO 1 */}
            {paso === 1 && (
                <div className="tw-flex tw-flex-col tw-gap-4">
                    <p className="tw-text-sm tw-font-semibold tw-text-gray-600 tw-m-0">Información de la solicitud</p>

                    <div>
                        <label className={labelClass}>
                            <FileText className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1" /> Motivo
                        </label>
                        <input
                            type="text"
                            id="motivo"
                            className={inputClass}
                            placeholder="Ej: Práctica de panadería"
                            value={formData.motivo}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>
                            <Calendar className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1" /> Fecha de entrega
                        </label>
                        <input
                            type="date"
                            id="Fec_entrega"
                            className={inputClass}
                            value={formData.Fec_entrega}
                            onChange={handleInputChange}
                            min={new Date().toISOString().split("T")[0]}
                        />
                    </div>

                    <div className="tw-flex tw-items-center tw-gap-2 tw-px-3 tw-py-2 tw-rounded-lg tw-bg-primario-50 tw-border tw-border-primario-100">
                        <User className="tw-w-4 tw-h-4 tw-text-primario-600" />
                        <span className="tw-text-sm tw-text-primario-800">
                            Solicitante: <strong>{usuario.nombre || "No identificado"}</strong>
                        </span>
                    </div>

                    {/* Destino */}
                    <div>
                        <label className={labelClass}>
                            <MapPin className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1" /> Destino
                        </label>
                        <div className="tw-relative">
                            <select
                                id="Id_Destino"
                                className={`${inputClass} tw-appearance-none`}
                                value={formData.Id_Destino}
                                onChange={handleInputChange}
                            >
                                <option value="">Seleccione un destino...</option>
                                {destinos.filter(d => d.Estado === 'ACTIVO' || String(d.Id_Destino) === String(formData.Id_Destino)).map(d => (
                                    <option key={d.Id_Destino} value={d.Id_Destino}>
                                        {d.Nom_Destino} — {d.Tip_Destino}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="tw-absolute tw-right-4 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-gray-400 tw-pointer-events-none" />
                        </div>
                    </div>

                    <div className="tw-flex tw-gap-2 tw-mt-2">
                        <button
                            onClick={siguientePaso}
                            className="tw-flex-1 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-4 tw-py-2.5 tw-rounded-xl tw-bg-primario-900 tw-text-white tw-font-medium tw-text-sm hover:tw-bg-primario-700 tw-transition-all tw-shadow-md"
                        >
                            Siguiente <ArrowRight className="tw-w-4 tw-h-4" />
                        </button>
                        <button
                            onClick={hideModal}
                            className="tw-flex tw-items-center tw-gap-1.5 tw-px-4 tw-py-2.5 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-white tw-text-gray-600 tw-text-sm hover:tw-bg-gray-50 tw-transition-all"
                        >
                            <X className="tw-w-4 tw-h-4" /> Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* PASO 2 */}
            {paso === 2 && (
                <div className="tw-flex tw-flex-col tw-gap-4">
                    <p className="tw-text-sm tw-font-semibold tw-text-gray-600 tw-m-0">
                        El sistema asignará automáticamente el lote más próximo a vencer
                    </p>

                    {/* Buscador */}
                    <div className="tw-relative">
                        <Search className="tw-absolute tw-left-3 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-gray-400" />
                        <input
                            type="text"
                            className={`${inputClass} tw-pl-9`}
                            placeholder="Filtrar por nombre del insumo..."
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        />
                    </div>

                    {/* Tabla insumos */}
                    <div className="tw-rounded-xl tw-border tw-border-gray-200 tw-overflow-hidden" style={{ maxHeight: 240, overflowY: "auto" }}>
                        <table className="tw-w-full tw-text-sm">
                            <thead className="tw-sticky tw-top-0">
                                <tr className="tw-bg-primario-900">
                                    <th className="tw-text-left tw-px-4 tw-py-2.5 tw-text-xs tw-font-semibold tw-text-primario-100 tw-uppercase tw-tracking-wide">Insumo</th>
                                    <th className="tw-text-left tw-px-4 tw-py-2.5 tw-text-xs tw-font-semibold tw-text-primario-100 tw-uppercase tw-tracking-wide">Stock</th>
                                    <th className="tw-text-left tw-px-4 tw-py-2.5 tw-text-xs tw-font-semibold tw-text-primario-100 tw-uppercase tw-tracking-wide">Cantidad</th>
                                    <th className="tw-px-4 tw-py-2.5" />
                                </tr>
                            </thead>
                            <tbody>
                                {insumosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="tw-text-center tw-py-6 tw-text-gray-400 tw-text-sm">No se encontraron insumos</td>
                                    </tr>
                                ) : (
                                    insumosFiltrados.map(ins => {
                                        const stockTotal = calcularStockDisponible(ins);
                                        const sinStock = stockTotal === 0;
                                        return (
                                            <tr key={ins.Id_Insumos} className={`tw-border-t tw-border-gray-100 tw-transition-colors ${sinStock ? "tw-opacity-40" : "hover:tw-bg-gray-50"}`}>
                                                <td className="tw-px-4 tw-py-2.5 tw-font-medium tw-text-gray-700">{ins.Nom_Insumo}</td>
                                                <td className="tw-px-4 tw-py-2.5">
                                                    <span className={`tw-inline-flex tw-items-center tw-px-2 tw-py-0.5 tw-rounded-md tw-text-xs tw-font-bold ${sinStock ? "tw-bg-red-50 tw-text-red-500" : "tw-bg-green-50 tw-text-green-700"}`}>
                                                        {sinStock ? "Sin stock" : `${stockTotal} ${ins.Uni_Med_Insumo}`}
                                                    </span>
                                                </td>
                                                <td className="tw-px-4 tw-py-2.5">
                                                    <input
                                                        type="number"
                                                        className="tw-w-20 tw-px-2 tw-py-1.5 tw-rounded-lg tw-border tw-border-gray-200 tw-text-sm focus:tw-outline-none focus:tw-border-primario-400 tw-bg-gray-50 disabled:tw-opacity-40"
                                                        min={1}
                                                        max={stockTotal}
                                                        value={cantidades[ins.Id_Insumos] || ""}
                                                        onChange={(e) => setCantidades({ ...cantidades, [ins.Id_Insumos]: e.target.value })}
                                                        disabled={sinStock}
                                                    />
                                                </td>
                                                <td className="tw-px-4 tw-py-2.5">
                                                    <button
                                                        onClick={() => agregarAlCarrito(ins)}
                                                        disabled={sinStock}
                                                        className="tw-flex tw-items-center tw-gap-1 tw-px-3 tw-py-1.5 tw-rounded-lg tw-bg-primario-900 tw-text-white tw-text-xs tw-font-medium hover:tw-bg-primario-700 tw-transition-all disabled:tw-opacity-40 disabled:tw-cursor-not-allowed"
                                                    >
                                                        <Plus className="tw-w-3.5 tw-h-3.5" /> Agregar
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Carrito con lotes */}
                    {carrito.length > 0 && (
                        <div className="tw-rounded-xl tw-border tw-border-primario-100 tw-bg-primario-50 tw-overflow-hidden">
                            <div className="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2.5 tw-bg-primario-100">
                                <ShoppingCart className="tw-w-4 tw-h-4 tw-text-primario-700" />
                                <span className="tw-text-xs tw-font-semibold tw-text-primario-800 tw-uppercase tw-tracking-wide">
                                    Insumos seleccionados ({carrito.length} lote(s))
                                </span>
                            </div>
                            <ul className="tw-divide-y tw-divide-primario-100">
                                {(() => {
                                    // Agrupar para mostrar una fila de eliminar por insumo
                                    const itemsAgrupados = [];
                                    let lastInsumoId = null;
                                    carrito.forEach((item, idx) => {
                                        const esPrimero = lastInsumoId !== item.Id_Insumos;
                                        itemsAgrupados.push({ ...item, esPrimero });
                                        lastInsumoId = item.Id_Insumos;
                                    });
                                    return itemsAgrupados.map((item) => (
                                        <li key={`${item.Id_Insumos}-${item.Id_Entradas}`} className="tw-flex tw-items-center tw-justify-between tw-px-4 tw-py-2.5">
                                            <div className="tw-flex tw-items-center tw-gap-2 tw-flex-1">
                                                {item.esPrimero ? (
                                                    <span className="tw-text-sm tw-font-medium tw-text-gray-700 tw-min-w-[120px]">{item.Nom_Insumo}</span>
                                                ) : (
                                                    <span className="tw-text-gray-300 tw-text-xs tw-min-w-[120px] tw-pl-2">↳</span>
                                                )}
                                                <span className="tw-inline-flex tw-items-center tw-gap-1 tw-px-2 tw-py-0.5 tw-rounded-md tw-bg-primario-200 tw-text-primario-800 tw-text-xs">
                                                    <Package className="tw-w-3 tw-h-3" />{item.Lote}
                                                </span>
                                                <span className="tw-text-orange-500 tw-text-xs">{item.Fec_Ven}</span>
                                                <span className="tw-inline-flex tw-items-center tw-px-2 tw-py-0.5 tw-rounded-md tw-bg-primario-200 tw-text-primario-900 tw-text-xs tw-font-bold">
                                                    {item.cantidad} {item.Uni_Med_Insumo}
                                                </span>
                                            </div>
                                            {item.esPrimero && (
                                                <button
                                                    onClick={() => quitarDelCarrito(item.Id_Insumos)}
                                                    className="tw-flex tw-items-center tw-justify-center tw-w-7 tw-h-7 tw-rounded-lg tw-text-red-400 hover:tw-bg-red-50 hover:tw-text-red-600 tw-transition-all"
                                                >
                                                    <Trash2 className="tw-w-3.5 tw-h-3.5" />
                                                </button>
                                            )}
                                        </li>
                                    ));
                                })()}
                            </ul>
                        </div>
                    )}

                    {/* Botones */}
                    <div className="tw-flex tw-gap-2 tw-mt-1">
                        <button
                            onClick={() => setPaso(1)}
                            className="tw-flex tw-items-center tw-gap-1.5 tw-px-4 tw-py-2.5 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-white tw-text-gray-600 tw-text-sm hover:tw-bg-gray-50 tw-transition-all"
                        >
                            <ArrowLeft className="tw-w-4 tw-h-4" /> Atrás
                        </button>
                        <button
                            onClick={enviarSolicitud}
                            disabled={enviando}
                            className="tw-flex-1 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-4 tw-py-2.5 tw-rounded-xl tw-bg-primario-900 tw-text-white tw-font-medium tw-text-sm hover:tw-bg-primario-700 tw-transition-all tw-shadow-md disabled:tw-opacity-60 disabled:tw-cursor-not-allowed"
                        >
                            {enviando ? (
                                <><Loader2 className="tw-w-4 tw-h-4 tw-animate-spin" /> Enviando...</>
                            ) : (
                                <><Send className="tw-w-4 tw-h-4" /> Crear Solicitud</>
                            )}
                        </button>
                        <button
                            onClick={hideModal}
                            className="tw-flex tw-items-center tw-gap-1.5 tw-px-4 tw-py-2.5 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-white tw-text-gray-600 tw-text-sm hover:tw-bg-gray-50 tw-transition-all"
                        >
                            <X className="tw-w-4 tw-h-4" /> Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SolicitudFormNuevo;
