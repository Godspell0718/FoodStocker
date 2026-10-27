import { useState, useEffect } from "react";
import apiAxios from "../api/axiosConfig.js";
import Swal from "sweetalert2";
import {
    ClipboardList, Calendar, FileText, Hash, Search,
    ArrowRight, ArrowLeft, Send, Plus, Trash2, ShoppingCart, Package,
    CheckCircle, XCircle, Loader2, Truck, Eye, MapPin, ChevronDown, Boxes, Layers, AlertTriangle, X,
    Clock, RotateCcw, Filter, ChevronLeft, ChevronRight, Check
} from "lucide-react";
import {
    fmtUnidad,
    nombrePresentacion,
    tienePresentacion,
    describirPresentacion,
    fmtCantidadConPresentacion,
    fmtFechaVencimiento,
    loteVigente,
    compararPorVencimiento
} from "../utils/inventario.js";

const inputClass = "tw-w-full tw-px-4 tw-py-2.5 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-gray-50 tw-text-sm tw-text-gray-700 focus:tw-outline-none focus:tw-border-primario-500 focus:tw-ring-2 focus:tw-ring-primario-100 focus:tw-bg-white tw-transition-all";
const labelClass = "tw-block tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wide tw-mb-1.5";

const SolicitudConLotes = () => {
    const [paso, setPaso] = useState(1);
    const [tipSolicitud, setTipSolicitud] = useState("PRESENTACION");
    const [motivo, setMotivo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [observaciones, setObservaciones] = useState("");
    const [ficha, setFicha] = useState("");
    const [fichaConfirm, setFichaConfirm] = useState("");
    const [fechaEntrega, setFechaEntrega] = useState("");
    const [Id_Destino, setId_Destino] = useState("");
    const [insumos, setInsumos] = useState([]);
    const [destinos, setDestinos] = useState([]);
    const [filtro, setFiltro] = useState("");
    const [cantidades, setCantidades] = useState({});
    const [carrito, setCarrito] = useState([]);
    const [enviando, setEnviando] = useState(false);
    const [misSolicitudes, setMisSolicitudes] = useState([]);
    const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);

    // Pestaña activa y controles de Mis Solicitudes
    const [tabActiva, setTabActiva] = useState("nueva"); // "nueva" | "mis-solicitudes"
    const [filtroEstadoMis, setFiltroEstadoMis] = useState("todos");
    const [busquedaMis, setBusquedaMis] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const ITEMS_POR_PAGINA = 5;

    // Motivos disponibles
    const MOTIVOS = [
        "Elaboración de productos SENA empresa",
        "Producción por práctica de formación",
        "Producción por institución educativa",
        "Institución externa",
    ];

    const usuario = JSON.parse(localStorage.getItem("userFoodStocker") || "{}");

    useEffect(() => {
        if (paso === 2) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            cargarInsumosConLotes();
        }
    }, [paso]);

    useEffect(() => {
        cargarDestinos();
        cargarMisSolicitudes();
        const handleRefresh = () => cargarMisSolicitudes();
        window.addEventListener("nuevaSolicitud", handleRefresh);
        return () => window.removeEventListener("nuevaSolicitud", handleRefresh);
    }, []);

    const cargarDestinos = async () => {
        try {
            const res = await apiAxios.get("/api/destino");
            const activos = (Array.isArray(res.data) ? res.data : []).filter(d => (d.Estado || 'ACTIVO') === 'ACTIVO');
            setDestinos(activos);
        } catch (error) {
            console.error("Error cargando destinos:", error);
        }
    };

    const cargarMisSolicitudes = async () => {
        try {
            setLoadingSolicitudes(true);
            const res = await apiAxios.get("/api/solicitudes/pendientes");
            const userId = usuario.id || usuario.Id_Responsable;
            const filtradas = res.data.filter(sol => String(sol.Id_Responsable) === String(userId));
            setMisSolicitudes(filtradas);
        } catch (error) {
            console.error("Error cargando solicitudes:", error);
        } finally {
            setLoadingSolicitudes(false);
        }
    };

    const cargarInsumosConLotes = async () => {
        try {
            const res = await apiAxios.get("/api/insumos/con-lotes");
            setInsumos(res.data);
        } catch (error) {
            console.error("Error cargando insumos:", error);
        }
    };

    const handleSiguiente = () => {
        if (!motivo || !fechaEntrega || !descripcion.trim()) {
            Swal.fire("Campos requeridos", "Completa el motivo, la descripción y la fecha de entrega", "warning");
            return;
        }
        // Ficha: si se ingresó algo, debe coincidir con la confirmación
        if (ficha && ficha !== fichaConfirm) {
            Swal.fire("Error", "Los números de ficha no coinciden", "error");
            return;
        }
        const hoy = new Date().toISOString().split("T")[0];
        if (fechaEntrega < hoy) {
            Swal.fire("Fecha inválida", "La fecha de entrega no puede ser anterior a hoy", "warning");
            return;
        }
        setPaso(2);
    };

    // Calcula el stock total disponible (lotes vigentes, sin vencer)
    const calcularStockDisponible = (insumo) => {
        return (insumo.entradas || [])
            .filter(lote => {
                const disponible = (lote.Can_Inicial || 0) - (lote.Can_Salida || 0);
                return disponible > 0 && loteVigente(lote.Fec_Ven_Entrada) && lote.Estado === 'STOCK';
            })
            .reduce((acc, lote) => acc + ((lote.Can_Inicial || 0) - (lote.Can_Salida || 0)), 0);
    };

    const insumosFiltrados = insumos.filter(ins =>
        (ins.Estado || 'ACTIVO') === 'ACTIVO' &&
        ins.Nom_Insumo.toLowerCase().includes(filtro.toLowerCase())
    );

    const handleAgregar = (insumo) => {
        const inputVal = parseInt(cantidades[insumo.Id_Insumos] || 0);
        if (!inputVal || inputVal <= 0) {
            Swal.fire("Cantidad inválida", "Ingresa una cantidad mayor a 0", "warning");
            return;
        }

        // Si la solicitud es por presentación completa y el insumo la tiene configurada:
        // la cantidad base es: inputVal (número de empaques) * Can_Presentacion
        const esPorPresentacion = tipSolicitud === "PRESENTACION" && tienePresentacion(insumo);
        const cantidadBase = esPorPresentacion
            ? inputVal * Number(insumo.Can_Presentacion)
            : inputVal;

        const stockTotal = calcularStockDisponible(insumo);
        if (cantidadBase > stockTotal) {
            const unidadTxt = fmtUnidad(insumo.Uni_medida);
            const extraMsg = esPorPresentacion
                ? ` (${inputVal} ${nombrePresentacion(insumo.Tip_Presentacion, inputVal)} = ${cantidadBase.toLocaleString("es-CO")} ${unidadTxt})`
                : "";
            Swal.fire("Stock insuficiente", `Solo hay ${stockTotal.toLocaleString("es-CO")} ${unidadTxt} disponibles para ${insumo.Nom_Insumo}${extraMsg}`, "warning");
            return;
        }

        // Ordenar lotes por FEFO (más próximo a vencer primero; sin fecha al final)
        const lotesOrdenados = (insumo.entradas || [])
            .filter(l => {
                const disp = (l.Can_Inicial || 0) - (l.Can_Salida || 0);
                return disp > 0 && loteVigente(l.Fec_Ven_Entrada) && l.Estado === 'STOCK';
            })
            .sort(compararPorVencimiento);

        // Distribuir cantidad base entre lotes automáticamente
        let restante = cantidadBase;
        const lotesUsados = [];
        for (const lote of lotesOrdenados) {
            if (restante <= 0) break;
            const disponible = (lote.Can_Inicial || 0) - (lote.Can_Salida || 0);
            const tomado = Math.min(restante, disponible);
            lotesUsados.push({
                Id_Insumos: insumo.Id_Insumos,
                Id_Entradas: lote.Id_Entradas,
                Nom_Insumo: insumo.Nom_Insumo,
                Lote: lote.Lote,
                Fec_Ven: lote.Fec_Ven_Entrada,
                Uni_Med: fmtUnidad(insumo.Uni_medida),
                Tip_Presentacion: insumo.Tip_Presentacion,
                Can_Presentacion: insumo.Can_Presentacion,
                esPorPresentacion,
                empaquesPedidas: esPorPresentacion ? inputVal : null,
                cantidad: tomado
            });
            restante -= tomado;
        }

        const carritoSinEste = carrito.filter(item => item.Id_Insumos !== insumo.Id_Insumos);
        setCarrito([...carritoSinEste, ...lotesUsados]);
        setCantidades(prev => ({ ...prev, [insumo.Id_Insumos]: "" }));

        const detalleTexto = esPorPresentacion
            ? `${inputVal} ${nombrePresentacion(insumo.Tip_Presentacion, inputVal)} (${cantidadBase.toLocaleString("es-CO")} ${fmtUnidad(insumo.Uni_medida)})`
            : `${cantidadBase.toLocaleString("es-CO")} ${fmtUnidad(insumo.Uni_medida)}`;

        Swal.fire({
            icon: "success",
            title: "Agregado",
            text: `${insumo.Nom_Insumo}: ${detalleTexto}`,
            timer: 1200,
            showConfirmButton: false
        });
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

        const agrupado = carrito.reduce((acc, item) => {
            if (!acc[item.Nom_Insumo]) {
                acc[item.Nom_Insumo] = {
                    total: 0,
                    lotes: [],
                    uniMed: item.Uni_Med,
                    tipPres: item.Tip_Presentacion,
                    canPres: item.Can_Presentacion
                };
            }
            acc[item.Nom_Insumo].total += item.cantidad;
            acc[item.Nom_Insumo].lotes.push({ lote: item.Lote, cantidad: item.cantidad, vence: fmtFechaVencimiento(item.Fec_Ven) });
            return acc;
        }, {});

        const tipoLabel = tipSolicitud === "PRESENTACION"
            ? "Por empaque completo (Bulto, Cubeta, etc.)"
            : "Por cantidad exacta / fraccionada";

        let resumenHTML = `
            <div style="text-align: left; font-size: 13px;">
                <p style="margin: 4px 0;"><strong>Tipo de solicitud:</strong> <span style="color: #1e3a5f; font-weight: 700;">${tipoLabel}</span></p>
                <p style="margin: 4px 0;"><strong>Motivo:</strong> ${motivo}</p>
                <p style="margin: 4px 0;"><strong>Descripción:</strong> ${descripcion}</p>
                ${observaciones ? `<p style="margin: 4px 0;"><strong>Observaciones:</strong> ${observaciones}</p>` : ""}
                ${ficha ? `<p style="margin: 4px 0;"><strong>Ficha:</strong> ${ficha}</p>` : ""}
                <p style="margin: 4px 0;"><strong>Fecha de entrega:</strong> ${fechaEntrega}</p>
                ${Id_Destino ? `<p style="margin: 4px 0;"><strong>Destino:</strong> ${destinos.find(d => d.Id_Destino == Id_Destino)?.Nom_Destino || Id_Destino}</p>` : ""}
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 10px 0;" />
                <p style="font-weight: 700; margin-bottom: 6px;">Insumos solicitados (${carrito.length} lote(s)):</p>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    ${Object.entries(agrupado).map(([nombre, info]) => {
                        const cantConPres = fmtCantidadConPresentacion(info.total, {
                            Tip_Presentacion: info.tipPres,
                            Can_Presentacion: info.canPres,
                            Uni_medida: info.uniMed
                        });
                        return `
                        <li style="padding: 6px 0; border-bottom: 1px solid #f3f4f6;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-weight: 600;">${nombre}</span>
                                <span style="font-weight: 700; color: #1e3a5f;">${cantConPres}</span>
                            </div>
                            ${info.lotes.length > 0 ? `
                                <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">
                                    ${info.lotes.map(l => `Lote ${l.lote} (${l.cantidad.toLocaleString("es-CO")} ${info.uniMed}, vence: ${l.vence})`).join(" · ")}
                                </div>
                            ` : ""}
                        </li>`;
                    }).join("")}
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
                Id_Responsable: usuario.id || usuario.Id_Responsable,
                Fec_entrega: fechaEntrega,
                motivo, 
                descripcion, 
                observaciones: observaciones || null,
                ficha: ficha || null,
                Id_Destino: Id_Destino || null,
                Tip_solicitud: tipSolicitud,
                insumos: carrito.map(item => ({
                    Id_insumos: item.Id_Insumos,
                    Id_Entradas: item.Id_Entradas,
                    cantidad_solicitada: item.cantidad
                }))
            });
            setEnviando(false);
            Swal.fire({ title: "¡Solicitud creada!", text: "Tu solicitud fue registrada correctamente", icon: "success", timer: 1800, showConfirmButton: false });
            setMotivo(""); setDescripcion(""); setObservaciones(""); setFicha(""); setFichaConfirm("");
            setFechaEntrega(""); setId_Destino(""); setCarrito([]); setPaso(1);
            cargarMisSolicitudes();
            setTabActiva("mis-solicitudes");
            setFiltroEstadoMis("todos");
            setPaginaActual(1);
            window.dispatchEvent(new Event("nuevaSolicitud"));
        } catch (error) {
            setEnviando(false);
            Swal.fire("Error", error.response?.data?.message || "Error al crear", "error");
        }
    };

    // Métricas y filtrado para Mis Solicitudes
    const totalMis = misSolicitudes.length;
    const cantSolicitado = misSolicitudes.filter(s => (s.ultimoEstado || "").toLowerCase() === "solicitado").length;
    const cantProceso = misSolicitudes.filter(s => (s.ultimoEstado || "").toLowerCase() === "proceso").length;
    const cantDespachado = misSolicitudes.filter(s => (s.ultimoEstado || "").toLowerCase() === "despachado").length;
    const cantCancelado = misSolicitudes.filter(s => (s.ultimoEstado || "").toLowerCase() === "cancelado").length;

    const solicitudesFiltradas = misSolicitudes.filter(sol => {
        const estado = (sol.ultimoEstado || "solicitado").toLowerCase();
        if (filtroEstadoMis !== "todos" && estado !== filtroEstadoMis) return false;
        if (busquedaMis.trim()) {
            const q = busquedaMis.toLowerCase();
            const idMatch = String(sol.Id_solicitud).includes(q) || `#${sol.Id_solicitud}`.includes(q);
            const descMatch = (sol.Descripcion || "").toLowerCase().includes(q);
            const motivoMatch = (sol.motivo || "").toLowerCase().includes(q);
            const fechaMatch = (sol.Fec_entrega || "").toLowerCase().includes(q);
            if (!idMatch && !descMatch && !motivoMatch && !fechaMatch) return false;
        }
        return true;
    });

    const totalPaginas = Math.max(1, Math.ceil(solicitudesFiltradas.length / ITEMS_POR_PAGINA));
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    const solicitudesPaginadas = solicitudesFiltradas.slice(inicio, inicio + ITEMS_POR_PAGINA);

    return (
        <div className="tw-p-2">

            {/* Header con Pestañas Superiores */}
            <div className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center sm:tw-justify-between tw-gap-4 tw-mb-6 tw-bg-white tw-p-4 tw-rounded-2xl tw-border tw-border-gray-100 tw-shadow-sm">
                <div className="tw-flex tw-items-center tw-gap-3">
                    <div className="tw-w-10 tw-h-10 tw-rounded-xl tw-bg-primario-900 tw-flex tw-items-center tw-justify-center tw-shadow-md tw-shrink-0">
                        {tabActiva === "nueva" ? (
                            <ClipboardList className="tw-w-5 tw-h-5 tw-text-secundario-400" />
                        ) : (
                            <Eye className="tw-w-5 tw-h-5 tw-text-secundario-400" />
                        )}
                    </div>
                    <div>
                        <h1 className="tw-text-lg sm:tw-text-xl tw-font-bold tw-text-gray-800 tw-m-0">
                            {tabActiva === "nueva" ? "Nueva Solicitud de Insumos" : "Mis Solicitudes"}
                        </h1>
                        <p className="tw-text-xs sm:tw-text-sm tw-text-gray-500 tw-m-0">
                            {tabActiva === "nueva"
                                ? "El sistema asignará automáticamente el lote más próximo a vencer"
                                : "Seguimiento en tiempo real del estado de tus solicitudes"}
                        </p>
                    </div>
                </div>

                {/* Selector de Pestañas */}
                <div className="tw-inline-flex tw-p-1 tw-bg-gray-100 tw-rounded-xl tw-border tw-border-gray-200/80 tw-self-start sm:tw-self-auto">
                    <button
                        type="button"
                        onClick={() => setTabActiva("nueva")}
                        className={`tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-rounded-lg tw-text-xs sm:tw-text-sm tw-font-semibold tw-transition-all ${
                            tabActiva === "nueva"
                                ? "tw-bg-white tw-text-primario-900 tw-shadow-sm"
                                : "tw-text-gray-500 hover:tw-text-gray-800"
                        }`}
                    >
                        <Plus className="tw-w-4 tw-h-4" />
                        <span>Crear Solicitud</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setTabActiva("mis-solicitudes")}
                        className={`tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-rounded-lg tw-text-xs sm:tw-text-sm tw-font-semibold tw-transition-all ${
                            tabActiva === "mis-solicitudes"
                                ? "tw-bg-white tw-text-primario-900 tw-shadow-sm"
                                : "tw-text-gray-500 hover:tw-text-gray-800"
                        }`}
                    >
                        <Eye className="tw-w-4 tw-h-4" />
                        <span>Mis Solicitudes</span>
                        {misSolicitudes.length > 0 && (
                            <span className={`tw-px-2 tw-py-0.2 tw-rounded-full tw-text-[11px] tw-font-bold ${
                                tabActiva === "mis-solicitudes"
                                    ? "tw-bg-primario-50 tw-text-primario-900"
                                    : "tw-bg-gray-200 tw-text-gray-700"
                            }`}>
                                {misSolicitudes.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* VISTA 1: CREAR SOLICITUD */}
            {tabActiva === "nueva" && (
                <>
                    {/* Stepper */}
                    <div className="tw-flex tw-items-center tw-mb-8">
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
                        <div className="tw-relative">
                            <select
                                className={paso === 2 ? `${inputClass} tw-appearance-none tw-opacity-60 tw-cursor-not-allowed` : `${inputClass} tw-appearance-none`}
                                value={motivo}
                                onChange={e => setMotivo(e.target.value)}
                                disabled={paso === 2}
                            >
                                <option value="">Seleccione el tipo de solicitud...</option>
                                {MOTIVOS.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                            <ChevronDown className="tw-absolute tw-right-4 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-gray-400 tw-pointer-events-none" />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}><FileText className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1" />Descripción</label>
                        <input className={paso === 2 ? `${inputClass} tw-opacity-60 tw-cursor-not-allowed` : inputClass} value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción de la práctica..." disabled={paso === 2} />
                    </div>
                    <div>
                        <label className={labelClass}><Hash className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1" />Ficha <span className="tw-text-gray-400 tw-normal-case">(opcional)</span></label>
                        <input type="number" className={paso === 2 ? `${inputClass} tw-opacity-60 tw-cursor-not-allowed` : inputClass} value={ficha} onChange={e => setFicha(e.target.value)} placeholder="Número de ficha (si aplica)" disabled={paso === 2} />
                    </div>
                    <div>
                        <label className={labelClass}><Hash className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1" />Confirmar Ficha <span className="tw-text-gray-400 tw-normal-case">(opcional)</span></label>
                        <input type="number" className={paso === 2 ? `${inputClass} tw-opacity-60 tw-cursor-not-allowed` : inputClass} value={fichaConfirm} onChange={e => setFichaConfirm(e.target.value)} placeholder="Repite el número (si aplica)" disabled={paso === 2 || !ficha} />
                    </div>
                    <div>
                        <label className={labelClass}><Calendar className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1" />Fecha de entrega</label>
                        <input type="date" className={paso === 2 ? `${inputClass} tw-opacity-60 tw-cursor-not-allowed` : inputClass} value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)} disabled={paso === 2} min={new Date().toISOString().split("T")[0]} />
                    </div>
                    <div>
                        <label className={labelClass}><MapPin className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1" />Destino</label>
                        <div className="tw-relative">
                            <select
                                className={paso === 2 ? `${inputClass} tw-appearance-none tw-opacity-60 tw-cursor-not-allowed` : `${inputClass} tw-appearance-none`}
                                value={Id_Destino}
                                onChange={e => setId_Destino(e.target.value)}
                                disabled={paso === 2}
                            >
                                <option value="">Seleccione un destino...</option>
                                {destinos.filter(d => d.Estado === 'ACTIVO' || d.Id_Destino === Id_Destino).map(d => (
                                    <option key={d.Id_Destino} value={d.Id_Destino}>
                                        {d.Nom_Destino} — {d.Tip_Destino}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="tw-absolute tw-right-4 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-gray-400 tw-pointer-events-none" />
                        </div>
                    </div>

                    {/* Modalidad de solicitud (Requerimiento: por empaque completo vs cantidad exacta) */}
                    <div className="md:tw-col-span-2">
                        <label className={labelClass}>
                            <Layers className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1" />
                            Modalidad de Solicitud *
                        </label>
                        <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-3">
                            <button
                                type="button"
                                onClick={() => setTipSolicitud("PRESENTACION")}
                                disabled={paso === 2}
                                className={`tw-p-3.5 tw-rounded-xl tw-border tw-text-left tw-transition-all tw-flex tw-items-start tw-gap-3 ${
                                    tipSolicitud === "PRESENTACION"
                                        ? "tw-border-primario-900 tw-bg-primario-50/60 tw-ring-2 tw-ring-primario-900/10"
                                        : "tw-border-gray-200 tw-bg-gray-50 hover:tw-bg-white"
                                }`}
                            >
                                <div className={`tw-p-2 tw-rounded-lg ${tipSolicitud === "PRESENTACION" ? "tw-bg-primario-900 tw-text-secundario-400" : "tw-bg-gray-200 tw-text-gray-500"}`}>
                                    <Boxes className="tw-w-5 tw-h-5" />
                                </div>
                                <div className="tw-flex-1">
                                    <p className="tw-text-sm tw-font-bold tw-text-gray-800 tw-m-0">
                                        Por empaque completo (Bulto, Cubeta, etc.)
                                    </p>
                                    <p className="tw-text-xs tw-text-gray-500 tw-m-0 tw-mt-0.5">
                                        Pide insumos por unidades cerradas completas (ej. 1 bulto de sal, 2 cubetas de huevos).
                                    </p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setTipSolicitud("CANTIDAD")}
                                disabled={paso === 2}
                                className={`tw-p-3.5 tw-rounded-xl tw-border tw-text-left tw-transition-all tw-flex tw-items-start tw-gap-3 ${
                                    tipSolicitud === "CANTIDAD"
                                        ? "tw-border-primario-900 tw-bg-primario-50/60 tw-ring-2 tw-ring-primario-900/10"
                                        : "tw-border-gray-200 tw-bg-gray-50 hover:tw-bg-white"
                                }`}
                            >
                                <div className={`tw-p-2 tw-rounded-lg ${tipSolicitud === "CANTIDAD" ? "tw-bg-primario-900 tw-text-secundario-400" : "tw-bg-gray-200 tw-text-gray-500"}`}>
                                    <Package className="tw-w-5 tw-h-5" />
                                </div>
                                <div className="tw-flex-1">
                                    <p className="tw-text-sm tw-font-bold tw-text-gray-800 tw-m-0">
                                        Por cantidad exacta / fraccionada
                                    </p>
                                    <p className="tw-text-xs tw-text-gray-500 tw-m-0 tw-mt-0.5">
                                        Para pedidos específicos fraccionados (ej. 100 gr de sal, 2 huevos, 250 ml).
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Observaciones adicionales (Requerimiento 4) */}
                    <div className="md:tw-col-span-2">
                        <label className={labelClass}>
                            <FileText className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1" />
                            Observaciones adicionales <span className="tw-text-gray-400 tw-normal-case">(opcional)</span>
                        </label>
                        <textarea
                            className={paso === 2 ? `${inputClass} tw-opacity-60 tw-cursor-not-allowed` : inputClass}
                            rows={2}
                            value={observaciones}
                            onChange={e => setObservaciones(e.target.value)}
                            placeholder="Indicaciones para el almacén, especificaciones de entrega, etc..."
                            disabled={paso === 2}
                        />
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
                                        <th className="tw-text-left tw-px-4 tw-py-3 tw-text-xs tw-font-semibold tw-text-primario-100 tw-uppercase tw-tracking-wide tw-w-44">
                                            {tipSolicitud === "PRESENTACION" ? "N° de Empaques" : "Cantidad"}
                                        </th>
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
                                            const uni = fmtUnidad(ins.Uni_medida);
                                            const tienePres = tienePresentacion(ins);
                                            const esPres = tipSolicitud === "PRESENTACION" && tienePres;
                                            const cantInput = cantidades[ins.Id_Insumos] || "";
                                            const numEmp = Number(cantInput);
                                            const cantCalc = esPres && numEmp > 0 ? numEmp * Number(ins.Can_Presentacion) : null;

                                            return (
                                                <tr key={ins.Id_Insumos} className={`tw-border-t tw-border-gray-100 tw-transition-colors ${sinStock ? "tw-opacity-40" : "hover:tw-bg-gray-50"}`}>
                                                    <td className="tw-px-4 tw-py-3">
                                                        <p className="tw-font-semibold tw-text-gray-800 tw-m-0">{ins.Nom_Insumo}</p>
                                                        {tienePres ? (
                                                            <span className="tw-inline-flex tw-items-center tw-gap-1 tw-text-[11px] tw-font-medium tw-text-primario-800 tw-bg-primario-50 tw-px-1.5 tw-py-0.5 tw-rounded tw-mt-0.5">
                                                                <Boxes className="tw-w-3 tw-h-3" />
                                                                {describirPresentacion(ins)}
                                                            </span>
                                                        ) : (
                                                            <p className="tw-text-xs tw-text-gray-400 tw-m-0">{uni}</p>
                                                        )}
                                                    </td>
                                                    <td className="tw-px-4 tw-py-3">
                                                        <span className={`tw-inline-flex tw-items-center tw-px-2.5 tw-py-1 tw-rounded-lg tw-text-xs tw-font-bold ${sinStock ? "tw-bg-red-50 tw-text-red-500" : "tw-bg-green-50 tw-text-green-700"}`}>
                                                            {sinStock ? (
                                                                <span>Sin stock</span>
                                                            ) : esPres ? (
                                                                <span>{Math.floor(stockTotal / Number(ins.Can_Presentacion))} {nombrePresentacion(ins.Tip_Presentacion, Math.floor(stockTotal / Number(ins.Can_Presentacion)))} ({stockTotal.toLocaleString("es-CO")} {uni})</span>
                                                            ) : (
                                                                <span>{stockTotal.toLocaleString("es-CO")} {uni}</span>
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="tw-px-4 tw-py-3">
                                                        <div>
                                                            <div className="tw-relative">
                                                                <input
                                                                    type="number"
                                                                    className="tw-w-full tw-px-3 tw-py-1.5 tw-rounded-lg tw-border tw-border-gray-200 tw-text-sm focus:tw-outline-none focus:tw-border-primario-400 tw-bg-gray-50 disabled:tw-opacity-40"
                                                                    min={1}
                                                                    value={cantInput}
                                                                    onChange={e => setCantidades(prev => ({ ...prev, [ins.Id_Insumos]: e.target.value }))}
                                                                    disabled={sinStock}
                                                                    placeholder={esPres ? `Ej: 1 ${ins.Tip_Presentacion}` : `0 ${uni}`}
                                                                />
                                                            </div>
                                                            {cantCalc !== null && (
                                                                <span className="tw-text-[11px] tw-text-primario-800 tw-font-semibold tw-block tw-mt-1">
                                                                    = {cantCalc.toLocaleString("es-CO")} {uni}
                                                                </span>
                                                            )}
                                                        </div>
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
                                <button onClick={handleEnviar} disabled={enviando} className="tw-w-full tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-4 tw-py-2.5 tw-rounded-xl tw-bg-primario-900 tw-text-white tw-font-medium tw-text-sm hover:tw-bg-primario-700 tw-transition-all tw-shadow-md disabled:tw-opacity-60 disabled:tw-cursor-not-allowed">
                                    {enviando ? (
                                        <><Loader2 className="tw-w-4 tw-h-4 tw-animate-spin" /> Enviando...</>
                                    ) : (
                                        <><Send className="tw-w-4 tw-h-4" /> <span>Crear Solicitud</span></>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

                </>
            )}

            {/* VISTA 2: MIS SOLICITUDES DASHBOARD */}
            {tabActiva === "mis-solicitudes" && (
                <div className="tw-space-y-6">
                    {/* Tarjetas de Métricas / KPI */}
                    <div className="tw-grid tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-3 sm:tw-gap-4">
                        <div
                            onClick={() => { setFiltroEstadoMis("todos"); setPaginaActual(1); }}
                            className={`tw-bg-white tw-p-4 tw-rounded-2xl tw-border tw-transition-all tw-cursor-pointer tw-shadow-sm hover:tw-shadow-md ${
                                filtroEstadoMis === "todos" ? "tw-border-primario-900 tw-ring-2 tw-ring-primario-100" : "tw-border-gray-100 hover:tw-border-gray-200"
                            }`}
                        >
                            <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
                                <span className="tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wider">Total</span>
                                <div className="tw-w-8 tw-h-8 tw-rounded-lg tw-bg-primario-50 tw-flex tw-items-center tw-justify-center tw-text-primario-900">
                                    <ClipboardList className="tw-w-4 tw-h-4" />
                                </div>
                            </div>
                            <div className="tw-text-2xl tw-font-black tw-text-gray-900">{totalMis}</div>
                            <p className="tw-text-[11px] tw-text-gray-400 tw-m-0 tw-mt-1">Todas las solicitudes</p>
                        </div>

                        <div
                            onClick={() => { setFiltroEstadoMis("solicitado"); setPaginaActual(1); }}
                            className={`tw-bg-white tw-p-4 tw-rounded-2xl tw-border tw-transition-all tw-cursor-pointer tw-shadow-sm hover:tw-shadow-md ${
                                filtroEstadoMis === "solicitado" ? "tw-border-amber-500 tw-ring-2 tw-ring-amber-100" : "tw-border-gray-100 hover:tw-border-gray-200"
                            }`}
                        >
                            <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
                                <span className="tw-text-xs tw-font-semibold tw-text-amber-700 tw-uppercase tw-tracking-wider">En Espera</span>
                                <div className="tw-w-8 tw-h-8 tw-rounded-lg tw-bg-amber-50 tw-flex tw-items-center tw-justify-center tw-text-amber-600">
                                    <Clock className="tw-w-4 tw-h-4" />
                                </div>
                            </div>
                            <div className="tw-text-2xl tw-font-black tw-text-amber-700">{cantSolicitado}</div>
                            <p className="tw-text-[11px] tw-text-gray-400 tw-m-0 tw-mt-1">Pendientes de revisión</p>
                        </div>

                        <div
                            onClick={() => { setFiltroEstadoMis("proceso"); setPaginaActual(1); }}
                            className={`tw-bg-white tw-p-4 tw-rounded-2xl tw-border tw-transition-all tw-cursor-pointer tw-shadow-sm hover:tw-shadow-md ${
                                filtroEstadoMis === "proceso" ? "tw-border-blue-600 tw-ring-2 tw-ring-blue-100" : "tw-border-gray-100 hover:tw-border-gray-200"
                            }`}
                        >
                            <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
                                <span className="tw-text-xs tw-font-semibold tw-text-blue-700 tw-uppercase tw-tracking-wider">En Alistamiento</span>
                                <div className="tw-w-8 tw-h-8 tw-rounded-lg tw-bg-blue-50 tw-flex tw-items-center tw-justify-center tw-text-blue-600">
                                    <Loader2 className="tw-w-4 tw-h-4" />
                                </div>
                            </div>
                            <div className="tw-text-2xl tw-font-black tw-text-blue-700">{cantProceso}</div>
                            <p className="tw-text-[11px] tw-text-gray-400 tw-m-0 tw-mt-1">Siendo preparadas</p>
                        </div>

                        <div
                            onClick={() => { setFiltroEstadoMis("despachado"); setPaginaActual(1); }}
                            className={`tw-bg-white tw-p-4 tw-rounded-2xl tw-border tw-transition-all tw-cursor-pointer tw-shadow-sm hover:tw-shadow-md ${
                                filtroEstadoMis === "despachado" ? "tw-border-green-600 tw-ring-2 tw-ring-green-100" : "tw-border-gray-100 hover:tw-border-gray-200"
                            }`}
                        >
                            <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
                                <span className="tw-text-xs tw-font-semibold tw-text-green-700 tw-uppercase tw-tracking-wider">Despachadas</span>
                                <div className="tw-w-8 tw-h-8 tw-rounded-lg tw-bg-green-50 tw-flex tw-items-center tw-justify-center tw-text-green-600">
                                    <Truck className="tw-w-4 tw-h-4" />
                                </div>
                            </div>
                            <div className="tw-text-2xl tw-font-black tw-text-green-700">{cantDespachado}</div>
                            <p className="tw-text-[11px] tw-text-gray-400 tw-m-0 tw-mt-1">Entregadas con éxito</p>
                        </div>
                    </div>

                    {/* Barra de Búsqueda y Filtros */}
                    <div className="tw-bg-white tw-p-3 sm:tw-p-4 tw-rounded-2xl tw-border tw-border-gray-100 tw-shadow-sm tw-flex tw-flex-col md:tw-flex-row md:tw-items-center md:tw-justify-between tw-gap-3">
                        <div className="tw-relative tw-flex-1 tw-max-w-md">
                            <Search className="tw-w-4 tw-h-4 tw-text-gray-400 tw-absolute tw-left-3.5 tw-top-1/2 -tw-translate-y-1/2 tw-pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Buscar por #ID, motivo o descripción..."
                                value={busquedaMis}
                                onChange={e => { setBusquedaMis(e.target.value); setPaginaActual(1); }}
                                className="tw-w-full tw-pl-9 tw-pr-8 tw-py-2 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-gray-50 tw-text-xs sm:tw-text-sm focus:tw-outline-none focus:tw-border-primario-500 focus:tw-bg-white tw-transition-all"
                            />
                            {busquedaMis && (
                                <button
                                    onClick={() => { setBusquedaMis(""); setPaginaActual(1); }}
                                    className="tw-absolute tw-right-2.5 tw-top-1/2 -tw-translate-y-1/2 tw-text-gray-400 hover:tw-text-gray-600"
                                >
                                    <X className="tw-w-3.5 tw-h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Filtros por Estado */}
                        <div className="tw-flex tw-items-center tw-gap-1.5 tw-overflow-x-auto tw-pb-1 md:tw-pb-0">
                            {[
                                { id: "todos", label: "Todas", count: totalMis },
                                { id: "solicitado", label: "En Espera", count: cantSolicitado },
                                { id: "proceso", label: "En Proceso", count: cantProceso },
                                { id: "despachado", label: "Despachadas", count: cantDespachado },
                                ...(cantCancelado > 0 ? [{ id: "cancelado", label: "Canceladas", count: cantCancelado }] : [])
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => { setFiltroEstadoMis(tab.id); setPaginaActual(1); }}
                                    className={`tw-px-3 tw-py-1.5 tw-rounded-xl tw-text-xs tw-font-semibold tw-whitespace-nowrap tw-transition-all tw-flex tw-items-center tw-gap-1.5 ${
                                        filtroEstadoMis === tab.id
                                            ? "tw-bg-primario-900 tw-text-white tw-shadow-sm"
                                            : "tw-bg-gray-100 tw-text-gray-600 hover:tw-bg-gray-200"
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                    <span className={`tw-px-1.5 tw-py-0.2 tw-rounded-full tw-text-[10px] ${
                                        filtroEstadoMis === tab.id ? "tw-bg-white/20 tw-text-white" : "tw-bg-gray-200 tw-text-gray-700"
                                    }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}

                            <button
                                type="button"
                                onClick={cargarMisSolicitudes}
                                title="Actualizar solicitudes"
                                className="tw-p-2 tw-rounded-xl tw-border tw-border-gray-200 tw-text-gray-500 hover:tw-text-primario-900 hover:tw-bg-gray-50 tw-transition-all tw-shrink-0"
                            >
                                <RotateCcw className={`tw-w-4 tw-h-4 ${loadingSolicitudes ? "tw-animate-spin tw-text-primario-600" : ""}`} />
                            </button>
                        </div>
                    </div>

                    {/* Listado de Solicitudes */}
                    {loadingSolicitudes ? (
                        <div className="tw-bg-white tw-rounded-2xl tw-border tw-border-gray-100 tw-p-12 tw-text-center tw-flex tw-flex-col tw-items-center tw-gap-3">
                            <Loader2 className="tw-w-8 tw-h-8 tw-text-primario-500 tw-animate-spin" />
                            <p className="tw-text-gray-500 tw-text-sm tw-font-medium tw-m-0">Actualizando tus solicitudes...</p>
                        </div>
                    ) : solicitudesFiltradas.length === 0 ? (
                        <div className="tw-bg-white tw-rounded-2xl tw-border tw-border-gray-100 tw-shadow-sm tw-py-12 tw-px-4 tw-text-center">
                            <ClipboardList className="tw-w-12 tw-h-12 tw-text-gray-300 tw-mx-auto tw-mb-3" />
                            <h3 className="tw-text-base tw-font-bold tw-text-gray-700 tw-m-0">No se encontraron solicitudes</h3>
                            <p className="tw-text-gray-400 tw-text-xs sm:tw-text-sm tw-mt-1 tw-max-w-md tw-mx-auto">
                                {busquedaMis || filtroEstadoMis !== "todos"
                                    ? "No hay solicitudes que coincidan con los filtros seleccionados."
                                    : "Aún no has creado solicitudes. ¡Empieza creando tu primera solicitud!"}
                            </p>
                            {busquedaMis || filtroEstadoMis !== "todos" ? (
                                <button
                                    onClick={() => { setBusquedaMis(""); setFiltroEstadoMis("todos"); setPaginaActual(1); }}
                                    className="tw-mt-4 tw-px-4 tw-py-2 tw-rounded-xl tw-bg-gray-100 hover:tw-bg-gray-200 tw-text-gray-700 tw-text-xs tw-font-semibold tw-transition-all"
                                >
                                    Limpiar filtros
                                </button>
                            ) : (
                                <button
                                    onClick={() => setTabActiva("nueva")}
                                    className="tw-mt-4 tw-inline-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2.5 tw-rounded-xl tw-bg-primario-900 hover:tw-bg-primario-800 tw-text-white tw-text-xs tw-font-semibold tw-transition-all tw-shadow-md"
                                >
                                    <Plus className="tw-w-4 tw-h-4" />
                                    Crear primera solicitud
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="tw-space-y-3.5">
                            {solicitudesPaginadas.map(sol => {
                                const estado = (sol.ultimoEstado || "solicitado").toLowerCase();
                                const esCancelado = estado === "cancelado";
                                const pasoActual = esCancelado ? 0 : estado === "solicitado" ? 1 : estado === "proceso" ? 2 : estado === "despachado" ? 3 : 1;

                                const pasos = [
                                    { num: 1, label: "Solicitado", icon: ClipboardList },
                                    { num: 2, label: "En Proceso", icon: Loader2 },
                                    { num: 3, label: "Despachado", icon: Truck },
                                ];

                                return (
                                    <div key={sol.Id_solicitud} className="tw-bg-white tw-rounded-2xl tw-border tw-border-gray-200/80 tw-shadow-sm hover:tw-shadow-md tw-transition-all tw-overflow-hidden">
                                        {/* Header de la tarjeta */}
                                        <div className="tw-px-4 sm:tw-px-5 tw-py-3 tw-bg-gray-50/80 tw-border-b tw-border-gray-100 tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-2">
                                            <div className="tw-flex tw-items-center tw-gap-2 tw-flex-wrap">
                                                <span className="tw-inline-flex tw-items-center tw-px-2.5 tw-py-1 tw-rounded-lg tw-text-xs tw-font-bold tw-bg-primario-900 tw-text-secundario-400">
                                                    #{sol.Id_solicitud}
                                                </span>
                                                <span className="tw-font-bold tw-text-sm tw-text-gray-800">
                                                    {sol.Descripcion || sol.motivo}
                                                </span>
                                                <span className="tw-text-[11px] tw-font-medium tw-px-2.5 tw-py-0.5 tw-rounded-full tw-bg-primario-50 tw-text-primario-800 tw-border tw-border-primario-200/60">
                                                    {sol.Tip_solicitud === 'PRESENTACION' ? '📦 Por empaque completo' : '⚖️ Por cantidad exacta'}
                                                </span>
                                                {sol.destino && (
                                                    <span className="tw-text-[11px] tw-text-gray-500 tw-flex tw-items-center tw-gap-1 tw-bg-gray-100 tw-px-2 tw-py-0.5 tw-rounded-full">
                                                        <MapPin className="tw-w-3 tw-h-3 tw-text-gray-400" />
                                                        {sol.destino.Nom_Destino || sol.destino}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="tw-flex tw-items-center tw-gap-3">
                                                <span className="tw-text-xs tw-text-gray-500 tw-flex tw-items-center tw-gap-1 tw-font-mono">
                                                    <Calendar className="tw-w-3.5 tw-h-3.5 tw-text-gray-400" />
                                                    Entrega: {sol.Fec_entrega}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setSolicitudSeleccionada(sol)}
                                                    className="tw-flex tw-items-center tw-gap-1.5 tw-px-3 tw-py-1.5 tw-rounded-xl tw-bg-primario-900 hover:tw-bg-primario-800 active:tw-scale-95 tw-text-secundario-400 hover:tw-text-white tw-text-xs tw-font-semibold tw-transition-all tw-shadow-sm cursor-pointer"
                                                    title="Ver qué pedí en esta solicitud"
                                                >
                                                    <Eye className="tw-w-3.5 tw-h-3.5" />
                                                    <span>Ver pedido</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Stepper y detalles */}
                                        <div className="tw-px-4 sm:tw-px-6 tw-py-4">
                                            {esCancelado ? (
                                                <div className="tw-flex tw-items-center tw-gap-3 tw-p-3 tw-rounded-xl tw-bg-red-50 tw-border tw-border-red-200">
                                                    <XCircle className="tw-w-5 tw-h-5 tw-text-red-500 tw-shrink-0" />
                                                    <div className="tw-flex-1">
                                                        <p className="tw-text-xs tw-font-bold tw-text-red-700 tw-m-0 tw-uppercase">Solicitud Cancelada</p>
                                                        <p className="tw-text-xs tw-text-red-600 tw-m-0 tw-mt-0.5">
                                                            {sol.motivo_cancelacion ? `Motivo: "${sol.motivo_cancelacion}"` : "Esta solicitud fue cancelada por el almacén."}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="tw-flex tw-items-center tw-justify-between tw-max-w-xl tw-mx-auto">
                                                    {pasos.map((p, idx) => {
                                                        const completado = pasoActual >= p.num;
                                                        const esActual = pasoActual === p.num;
                                                        const IconComponent = p.icon;

                                                        return (
                                                            <div key={p.num} className="tw-flex tw-items-center tw-flex-1">
                                                                <div className="tw-flex tw-flex-col tw-items-center tw-gap-1 tw-text-center">
                                                                    <div className={`tw-flex tw-items-center tw-justify-center tw-w-9 tw-h-9 tw-rounded-full tw-transition-all tw-duration-300 ${
                                                                        completado
                                                                            ? esActual
                                                                                ? "tw-bg-primario-900 tw-text-secundario-400 tw-shadow-md tw-ring-4 tw-ring-primario-100"
                                                                                : "tw-bg-green-500 tw-text-white tw-shadow-sm"
                                                                            : "tw-bg-gray-100 tw-text-gray-400 tw-border tw-border-gray-200"
                                                                    }`}>
                                                                        {completado && !esActual ? (
                                                                            <CheckCircle className="tw-w-4 tw-h-4" />
                                                                        ) : (
                                                                            <IconComponent className="tw-w-4 tw-h-4" />
                                                                        )}
                                                                    </div>
                                                                    <span className={`tw-text-xs tw-font-semibold tw-whitespace-nowrap ${
                                                                        completado ? esActual ? "tw-text-primario-900" : "tw-text-green-600" : "tw-text-gray-400"
                                                                    }`}>
                                                                        {p.label}
                                                                    </span>
                                                                </div>
                                                                {idx < pasos.length - 1 && (
                                                                    <div className={`tw-flex-1 tw-h-1 tw-mx-2 sm:tw-mx-3 tw-rounded-full tw-transition-all tw-duration-300 ${
                                                                        pasoActual > p.num ? "tw-bg-green-500" : "tw-bg-gray-200"
                                                                    }`} />
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Novedad si existe */}
                                            {sol.novedad && (
                                                <div className="tw-mt-3 tw-flex tw-items-start tw-gap-2 tw-px-3.5 tw-py-2 tw-rounded-xl tw-bg-amber-50 tw-border tw-border-amber-200">
                                                    <AlertTriangle className="tw-w-4 tw-h-4 tw-text-amber-500 tw-shrink-0 tw-mt-0.5" />
                                                    <div>
                                                        <p className="tw-text-[11px] tw-font-bold tw-text-amber-700 tw-m-0 tw-uppercase">Novedad del almacén</p>
                                                        <p className="tw-text-xs tw-text-amber-900 tw-m-0">{sol.novedad}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Observaciones si existen */}
                                            {sol.Observaciones && (
                                                <p className="tw-text-xs tw-text-gray-500 tw-m-0 tw-mt-2.5 tw-pt-2 tw-border-t tw-border-gray-50">
                                                    <span className="tw-font-semibold tw-text-gray-700">Nota:</span> {sol.Observaciones}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Paginación */}
                    {!loadingSolicitudes && solicitudesFiltradas.length > ITEMS_POR_PAGINA && (
                        <div className="tw-bg-white tw-px-4 tw-py-3 tw-rounded-2xl tw-border tw-border-gray-100 tw-shadow-sm tw-flex tw-items-center tw-justify-between">
                            <span className="tw-text-xs tw-text-gray-500">
                                Mostrando <strong className="tw-text-gray-800">{inicio + 1}</strong> a <strong className="tw-text-gray-800">{Math.min(inicio + ITEMS_POR_PAGINA, solicitudesFiltradas.length)}</strong> de <strong className="tw-text-gray-800">{solicitudesFiltradas.length}</strong> solicitudes
                            </span>
                            <div className="tw-flex tw-items-center tw-gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                                    disabled={paginaActual === 1}
                                    className="tw-p-1.5 tw-rounded-lg tw-border tw-border-gray-200 tw-text-gray-600 hover:tw-bg-gray-50 disabled:tw-opacity-40 disabled:tw-pointer-events-none tw-transition-all"
                                >
                                    <ChevronLeft className="tw-w-4 tw-h-4" />
                                </button>
                                <span className="tw-text-xs tw-font-semibold tw-text-gray-700 tw-px-2">
                                    {paginaActual} / {totalPaginas}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                                    disabled={paginaActual === totalPaginas}
                                    className="tw-p-1.5 tw-rounded-lg tw-border tw-border-gray-200 tw-text-gray-600 hover:tw-bg-gray-50 disabled:tw-opacity-40 disabled:tw-pointer-events-none tw-transition-all"
                                >
                                    <ChevronRight className="tw-w-4 tw-h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* MODAL DETALLE DE LO SOLICITADO */}
            {solicitudSeleccionada && (
                <div
                    className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-4 tw-bg-black/60 tw-backdrop-blur-sm"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setSolicitudSeleccionada(null);
                    }}
                >
                    <div className="tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-3xl tw-overflow-hidden tw-border tw-border-gray-100 tw-flex tw-flex-col tw-max-h-[90vh]">
                        {/* Header del Modal */}
                        <div className="tw-px-6 tw-py-4 tw-bg-primario-900 tw-flex tw-items-center tw-justify-between tw-border-b tw-border-primario-800">
                            <div className="tw-flex tw-items-center tw-gap-3">
                                <div className="tw-w-10 tw-h-10 tw-rounded-xl tw-bg-primario-800 tw-flex tw-items-center tw-justify-center tw-text-secundario-400 tw-shadow-sm">
                                    <Eye className="tw-w-5 tw-h-5" />
                                </div>
                                <div>
                                    <div className="tw-flex tw-items-center tw-gap-2">
                                        <h3 className="tw-text-lg tw-font-bold tw-text-white tw-m-0">
                                            Solicitud #{solicitudSeleccionada.Id_solicitud}
                                        </h3>
                                        <span className="tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-[11px] tw-font-bold tw-bg-primario-800 tw-text-secundario-300 tw-border tw-border-primario-700">
                                            {solicitudSeleccionada.Tip_solicitud === 'PRESENTACION' ? 'Por empaque completo' : 'Por cantidad exacta'}
                                        </span>
                                    </div>
                                    <p className="tw-text-xs tw-text-primario-300 tw-m-0">
                                        Detalle de los insumos y cantidades que solicitaste
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSolicitudSeleccionada(null)}
                                className="tw-w-8 tw-h-8 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-text-primario-300 hover:tw-text-white hover:tw-bg-primario-800 tw-transition-colors cursor-pointer"
                                title="Cerrar"
                            >
                                <X className="tw-w-5 tw-h-5" />
                            </button>
                        </div>

                        {/* Contenido del Modal */}
                        <div className="tw-p-6 tw-overflow-y-auto tw-space-y-5">
                            {/* Resumen General */}
                            <div className="tw-grid tw-grid-cols-2 sm:tw-grid-cols-4 tw-gap-3 tw-bg-gray-50 tw-p-4 tw-rounded-xl tw-border tw-border-gray-200/70">
                                <div>
                                    <span className="tw-text-[11px] tw-font-semibold tw-text-gray-400 tw-uppercase tw-tracking-wide tw-block">
                                        Motivo
                                    </span>
                                    <p className="tw-text-xs tw-font-bold tw-text-gray-700 tw-m-0 tw-mt-0.5 tw-truncate" title={solicitudSeleccionada.motivo}>
                                        {solicitudSeleccionada.motivo || "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <span className="tw-text-[11px] tw-font-semibold tw-text-gray-400 tw-uppercase tw-tracking-wide tw-block">
                                        Destino
                                    </span>
                                    <p className="tw-text-xs tw-font-bold tw-text-gray-700 tw-m-0 tw-mt-0.5">
                                        {solicitudSeleccionada.destino?.Nom_Destino || "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <span className="tw-text-[11px] tw-font-semibold tw-text-gray-400 tw-uppercase tw-tracking-wide tw-block">
                                        Fecha Entrega
                                    </span>
                                    <p className="tw-text-xs tw-font-bold tw-text-gray-700 tw-m-0 tw-mt-0.5">
                                        {solicitudSeleccionada.Fec_entrega || "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <span className="tw-text-[11px] tw-font-semibold tw-text-gray-400 tw-uppercase tw-tracking-wide tw-block">
                                        Ficha
                                    </span>
                                    <p className="tw-text-xs tw-font-bold tw-text-gray-700 tw-m-0 tw-mt-0.5">
                                        {solicitudSeleccionada.Ficha || "N/A"}
                                    </p>
                                </div>
                            </div>

                            {/* Descripción */}
                            {solicitudSeleccionada.Descripcion && (
                                <div className="tw-bg-blue-50/60 tw-border tw-border-blue-100 tw-rounded-xl tw-p-3.5">
                                    <span className="tw-text-[11px] tw-font-bold tw-text-blue-900 tw-uppercase tw-tracking-wide tw-block tw-mb-1">
                                        Descripción
                                    </span>
                                    <p className="tw-text-xs tw-text-blue-950 tw-m-0">
                                        {solicitudSeleccionada.Descripcion}
                                    </p>
                                </div>
                            )}

                            {/* Lista de Insumos Solicitados */}
                            <div>
                                <div className="tw-flex tw-items-center tw-justify-between tw-mb-2.5">
                                    <div className="tw-flex tw-items-center tw-gap-2">
                                        <Package className="tw-w-4 tw-h-4 tw-text-primario-600" />
                                        <h4 className="tw-text-sm tw-font-bold tw-text-gray-800 tw-m-0">
                                            Insumos Pedidos ({solicitudSeleccionada.insumos?.length || 0})
                                        </h4>
                                    </div>
                                    <span className="tw-text-xs tw-text-gray-400">
                                        Estado: <strong className="tw-capitalize tw-text-primario-900">{solicitudSeleccionada.ultimoEstado || 'Solicitado'}</strong>
                                    </span>
                                </div>

                                {!solicitudSeleccionada.insumos || solicitudSeleccionada.insumos.length === 0 ? (
                                    <div className="tw-text-center tw-py-8 tw-bg-gray-50 tw-rounded-xl tw-border tw-border-gray-200">
                                        <Package className="tw-w-8 tw-h-8 tw-text-gray-300 tw-mx-auto tw-mb-2" />
                                        <p className="tw-text-xs tw-text-gray-500 tw-m-0">
                                            No hay registros de insumos para esta solicitud
                                        </p>
                                    </div>
                                ) : (
                                    <div className="tw-border tw-border-gray-200 tw-rounded-xl tw-overflow-hidden tw-shadow-sm">
                                        <div className="tw-overflow-x-auto">
                                            <table className="tw-w-full tw-text-left tw-border-collapse">
                                                <thead>
                                                    <tr className="tw-bg-primario-900 tw-text-white tw-text-[11px] tw-font-semibold tw-uppercase tw-tracking-wider">
                                                        <th className="tw-py-2.5 tw-px-3">Insumo</th>
                                                        <th className="tw-py-2.5 tw-px-3">Lote</th>
                                                        <th className="tw-py-2.5 tw-px-3 tw-text-center">Cant. Solicitada</th>
                                                        {solicitudSeleccionada.ultimoEstado?.toLowerCase() !== 'solicitado' && (
                                                            <th className="tw-py-2.5 tw-px-3 tw-text-center">Cant. Entregada</th>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody className="tw-divide-y tw-divide-gray-100 tw-text-xs tw-bg-white">
                                                    {solicitudSeleccionada.insumos.map((item, idx) => {
                                                        const nombreInsumo = item.insumo?.Nom_Insumo || `Insumo #${item.Id_insumos}`;
                                                        const loteNum = item.entrada?.Lote || (item.Id_Entradas ? `#${item.Id_Entradas}` : "—");
                                                        const fecVen = item.entrada?.Fec_Ven_Entrada ? fmtFechaVencimiento(item.entrada.Fec_Ven_Entrada) : null;
                                                        const cantSolicitadaTexto = fmtCantidadConPresentacion(item.cantidad_solicitada, item.insumo);
                                                        const estadoSol = solicitudSeleccionada.ultimoEstado?.toLowerCase() || 'solicitado';
                                                        const esDespachado = estadoSol === 'despachado';
                                                        const valorEntregado = (item.cantidad_entregada !== null && item.cantidad_entregada !== undefined)
                                                            ? item.cantidad_entregada
                                                            : (esDespachado ? item.cantidad_solicitada : null);

                                                        const tieneEntrega = valorEntregado !== null && valorEntregado !== undefined;
                                                        const cantEntregadaTexto = tieneEntrega
                                                            ? fmtCantidadConPresentacion(valorEntregado, item.insumo)
                                                            : null;

                                                        return (
                                                            <tr key={idx} className="hover:tw-bg-gray-50/80 tw-transition-colors">
                                                                <td className="tw-py-3 tw-px-3">
                                                                    <div className="tw-font-bold tw-text-gray-800">{nombreInsumo}</div>
                                                                    {tienePresentacion(item.insumo) && (
                                                                        <div className="tw-text-[11px] tw-text-gray-400">
                                                                            {describirPresentacion(item.insumo)}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className="tw-py-3 tw-px-3">
                                                                    <span className="tw-inline-flex tw-items-center tw-gap-1 tw-px-2 tw-py-0.5 tw-rounded-md tw-bg-gray-100 tw-text-gray-700 tw-font-mono tw-text-[11px] tw-font-semibold">
                                                                        {loteNum}
                                                                    </span>
                                                                    {fecVen && (
                                                                        <div className="tw-text-[10px] tw-text-gray-400 tw-mt-0.5">
                                                                            Vence: {fecVen}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className="tw-py-3 tw-px-3 tw-text-center">
                                                                    <span className="tw-inline-block tw-px-2.5 tw-py-1 tw-rounded-lg tw-bg-primario-50 tw-text-primario-900 tw-font-bold tw-text-xs">
                                                                        {cantSolicitadaTexto}
                                                                    </span>
                                                                </td>
                                                                {solicitudSeleccionada.ultimoEstado?.toLowerCase() !== 'solicitado' && (
                                                                    <td className="tw-py-3 tw-px-3 tw-text-center">
                                                                        {tieneEntrega ? (
                                                                            <span className={`tw-inline-block tw-px-2.5 tw-py-1 tw-rounded-lg tw-font-bold tw-text-xs ${
                                                                                valorEntregado < item.cantidad_solicitada
                                                                                    ? "tw-bg-amber-100 tw-text-amber-800"
                                                                                    : "tw-bg-green-100 tw-text-green-800"
                                                                            }`}>
                                                                                {cantEntregadaTexto}
                                                                            </span>
                                                                        ) : (
                                                                            <span className="tw-inline-block tw-px-2 tw-py-0.5 tw-rounded-md tw-bg-gray-100 tw-text-gray-500 tw-text-[11px] tw-font-medium">
                                                                                Pendiente
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                )}
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Observaciones generales si las tiene */}
                            {solicitudSeleccionada.Observaciones && (
                                <div className="tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-xl tw-p-3.5">
                                    <span className="tw-text-[11px] tw-font-bold tw-text-gray-500 tw-uppercase tw-tracking-wide tw-block tw-mb-1">
                                        Observaciones de la solicitud
                                    </span>
                                    <p className="tw-text-xs tw-text-gray-700 tw-m-0">
                                        {solicitudSeleccionada.Observaciones}
                                    </p>
                                </div>
                            )}

                            {/* Novedad de entrega */}
                            {solicitudSeleccionada.novedad && (
                                <div className="tw-bg-amber-50 tw-border tw-border-amber-200 tw-rounded-xl tw-p-3.5 tw-flex tw-items-start tw-gap-2.5">
                                    <AlertTriangle className="tw-w-4 tw-h-4 tw-text-amber-600 tw-mt-0.5 tw-shrink-0" />
                                    <div>
                                        <span className="tw-text-[11px] tw-font-bold tw-text-amber-800 tw-uppercase tw-tracking-wide tw-block tw-mb-0.5">
                                            Novedad en la entrega
                                        </span>
                                        <p className="tw-text-xs tw-text-amber-900 tw-m-0">
                                            {solicitudSeleccionada.novedad}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Motivo de cancelación */}
                            {solicitudSeleccionada.motivo_cancelacion && (
                                <div className="tw-bg-red-50 tw-border tw-border-red-200 tw-rounded-xl tw-p-3.5 tw-flex tw-items-start tw-gap-2.5">
                                    <XCircle className="tw-w-4 tw-h-4 tw-text-red-600 tw-mt-0.5 tw-shrink-0" />
                                    <div>
                                        <span className="tw-text-[11px] tw-font-bold tw-text-red-800 tw-uppercase tw-tracking-wide tw-block tw-mb-0.5">
                                            Motivo de cancelación
                                        </span>
                                        <p className="tw-text-xs tw-text-red-900 tw-m-0">
                                            {solicitudSeleccionada.motivo_cancelacion}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer del Modal */}
                        <div className="tw-px-6 tw-py-3.5 tw-bg-gray-50 tw-border-t tw-border-gray-200 tw-flex tw-justify-end">
                            <button
                                type="button"
                                onClick={() => setSolicitudSeleccionada(null)}
                                className="tw-px-5 tw-py-2 tw-rounded-xl tw-bg-primario-900 hover:tw-bg-primario-800 tw-text-white tw-text-xs tw-font-bold tw-transition-colors tw-shadow-sm cursor-pointer"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SolicitudConLotes;