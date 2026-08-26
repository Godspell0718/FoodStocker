import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContadores } from '../Hooks/useContadores';
import apiAxios from "../api/axiosConfig.js";
import Swal from "sweetalert2";
import {
    Sunrise,
    Sun,
    Moon,
    MoonStar,
    Loader,
    Wheat,
    ArchiveRestore,
    ClipboardClock,
    UserRound,
    ClipboardPaste,
    Plus,
    CloudSun,
    CloudMoon,
    Cloud,
    CloudFog,
    CloudDrizzle,
    CloudRain,
    CloudRainWind,
    CloudSnow,
    CloudLightning,
    CloudHail,
    Thermometer,
    TriangleAlert,
    ClipboardList,
    CheckCircle,
    XCircle,
    Truck,
    Package,
    RefreshCw,
    Loader2,
    Eye,
    ChevronLeft,
    ChevronRight,
    Boxes,
    Building2,
    ArrowDownRight,
    X,
    Clock,
} from 'lucide-react';

const ESTADO_CONFIG = {
    solicitado: { label: "Solicitado", bg: "tw-bg-amber-100 tw-text-amber-800", dot: "tw-bg-amber-500" },
    proceso: { label: "En Proceso", bg: "tw-bg-blue-100 tw-text-blue-800", dot: "tw-bg-blue-500" },
    despachado: { label: "Despachado", bg: "tw-bg-green-100 tw-text-green-800", dot: "tw-bg-green-500" },
    cancelado: { label: "Cancelado", bg: "tw-bg-red-100 tw-text-red-700", dot: "tw-bg-red-500" },
};

const EstadoBadge = ({ estado }) => {
    const key = estado?.toLowerCase();
    const config = ESTADO_CONFIG[key] || { label: estado ?? "Sin estado", bg: "tw-bg-gray-100 tw-text-gray-600", dot: "tw-bg-gray-400" };
    return (
        <span className={`tw-inline-flex tw-items-center tw-gap-1.5 tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-semibold ${config.bg}`}>
            <span className={`tw-w-1.5 tw-h-1.5 tw-rounded-full ${config.dot}`} />
            {config.label}
        </span>
    );
};

const Inicio = () => {
    const navigate = useNavigate();
    const [greeting, setGreeting] = useState({
        text: '',
        SvgLucide: null,
        color: '',
        message: ''
    });

    // ESTADOS PARA MODALES Y PAGINACIÓN
    const [modalVencimientos, setModalVencimientos] = useState(false);
    const [modalCriticos, setModalCriticos] = useState(false);
    const [modalVerMas, setModalVerMas] = useState(false);

    const [solicitudes, setSolicitudes] = useState([]);
    const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);

    // ESTADOS PARA PAGINACIÓN DEL MODAL "VER MÁS"
    const [paginaActual, setPaginaActual] = useState(1);
    const itemsPorPagina = 10;

    const {
        totalInsumos,
        totalSolicitudes,
        totalProveedores,
        entradasHoy,
        proximosAVencer,
        stockCritico,
        cargando
    } = useContadores();

    const cargarSolicitudes = async () => {
        try {
            setLoadingSolicitudes(true);
            const res = await apiAxios.get("/api/solicitudes/pendientes");
            setSolicitudes(res.data);
        } catch (error) {
            console.error("Error cargando solicitudes en Inicio:", error);
        } finally {
            setLoadingSolicitudes(false);
        }
    };

    useEffect(() => {
        cargarSolicitudes();
        const handleNuevaSolicitud = () => cargarSolicitudes();
        window.addEventListener("nuevaSolicitud", handleNuevaSolicitud);
        return () => window.removeEventListener("nuevaSolicitud", handleNuevaSolicitud);
    }, []);

    const cambiarEstado = async (Id_solicitud, Id_estado, nombreEstado) => {
        if (Id_estado === 4) {
            const { value: motivo_cancelacion, isConfirmed } = await Swal.fire({
                title: '¿Cancelar esta solicitud?',
                html: '<p style="margin-bottom:8px;color:#6b7280;font-size:14px">Escribe el motivo de la cancelación <strong>(obligatorio)</strong></p>',
                input: 'textarea',
                inputPlaceholder: 'Escribe el motivo de cancelación...',
                inputAttributes: { 'aria-label': 'Motivo de cancelación', style: 'min-height:80px' },
                showCancelButton: true,
                confirmButtonText: 'Sí, cancelar solicitud',
                cancelButtonText: 'Volver',
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280',
                inputValidator: (value) => {
                    if (!value || !value.trim()) return '¡Debes escribir un motivo de cancelación!';
                },
            });
            if (!isConfirmed) return;
            try {
                await apiAxios.post("/api/solicitudes/cambiar-estado", { Id_solicitud, Id_estado, motivo_cancelacion });
                Swal.fire({ icon: "success", title: "Solicitud cancelada", timer: 1200, showConfirmButton: false });
                cargarSolicitudes();
                window.dispatchEvent(new Event("nuevaSolicitud"));
            } catch (error) {
                Swal.fire("Error", error.response?.data?.message || "No se pudo cancelar la solicitud", "error");
            }
            return;
        }

        const confirm = await Swal.fire({
            title: `¿Cambiar a "${nombreEstado}"?`,
            text: "Esta acción quedará registrada",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, confirmar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#153753",
            cancelButtonColor: "#6b7280",
        });
        if (!confirm.isConfirmed) return;
        try {
            await apiAxios.post("/api/solicitudes/cambiar-estado", { Id_solicitud, Id_estado });
            Swal.fire({ icon: "success", title: "Estado actualizado", timer: 1200, showConfirmButton: false });
            cargarSolicitudes();
            window.dispatchEvent(new Event("nuevaSolicitud"));
        } catch (error) {
            Swal.fire("Error", error.response?.data?.message || "No se pudo cambiar el estado", "error");
        }
    };

    useEffect(() => {
        const getGreeting = () => {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 12) {
                setGreeting({ text: 'Buenos días', SvgLucide: Sunrise, color: '#FFA500', message: 'Que tengas un excelente día' });
            } else if (hour >= 12 && hour < 19) {
                setGreeting({ text: 'Buenas tardes', SvgLucide: Sun, color: '#FF6347', message: 'Que tengas una excelente tarde' });
            } else {
                setGreeting({ text: 'Buenas noches', SvgLucide: MoonStar, color: '#4A90E2', message: 'Que tengas una excelente noche' });
            }
        };
        getGreeting();
        const interval = setInterval(getGreeting, 60000);
        return () => clearInterval(interval);
    }, []);

    const getUserName = () => {
        try {
            const userData = localStorage.getItem('userFoodStocker');
            if (userData) { return JSON.parse(userData).nombre || 'Usuario'; }
        } catch (error) { console.error('Error al leer datos del usuario:', error); }
        return 'Usuario';
    };

    const GreetingIcon = greeting.SvgLucide;

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const [clima, setClima] = useState({ temperatura: null, ciudad: '', codigo: null, esDeDia: true, cargando: true, error: false });

    useEffect(() => {
        const obtenerClima = async (lat, lon) => {
            let temperatura = null, codigo = null, esDeDia = true, ciudad = 'Tu ubicación';
            try {
                const resClima = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day`);
                const dataClima = await resClima.json();
                temperatura = Math.round(dataClima.current.temperature_2m);
                codigo = dataClima.current.weather_code;
                esDeDia = dataClima.current.is_day === 1;
            } catch (error) {
                setClima(prev => ({ ...prev, cargando: false, error: true }));
                return;
            }
            try {
                const resCiudad = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=es`);
                const dataCiudad = await resCiudad.json();
                ciudad = dataCiudad.city || dataCiudad.locality || 'Tu ubicación';
            } catch (error) { console.warn('Ciudad no obtenida'); }

            setClima({ temperatura, ciudad, codigo, esDeDia, cargando: false, error: false });
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => obtenerClima(pos.coords.latitude, pos.coords.longitude),
                () => setClima(prev => ({ ...prev, cargando: false, error: true }))
            );
        } else {
            setClima(prev => ({ ...prev, cargando: false, error: true }));
        }
    }, []);

    const getDescripcionClima = (codigo, esDeDia) => {
        if (codigo === 0) return esDeDia ? { texto: 'Soleado', icono: <Sun size={32} className="tw-text-yellow-500" /> } : { texto: 'Despejado', icono: <Moon size={32} className="tw-text-indigo-300" /> };
        if (codigo === 1) return esDeDia ? { texto: 'Mayormente soleado', icono: <Sun size={32} className="tw-text-yellow-400" /> } : { texto: 'Mayormente despejado', icono: <Moon size={32} className="tw-text-indigo-300" /> };
        if (codigo === 2) return esDeDia ? { texto: 'Soleado con nubes', icono: <CloudSun size={32} className="tw-text-yellow-500" /> } : { texto: 'Parcialmente nublado', icono: <CloudMoon size={32} className="tw-text-indigo-300" /> };
        if (codigo === 3) return { texto: 'Nublado', icono: <Cloud size={32} className="tw-text-slate-400" /> };
        if ([45, 48].includes(codigo)) return { texto: 'Niebla', icono: <CloudFog size={32} className="tw-text-slate-400" /> };
        if ([51, 53, 55].includes(codigo)) return { texto: 'Llovizna', icono: <CloudDrizzle size={32} className="tw-text-blue-400" /> };
        if ([61, 63, 65].includes(codigo)) return { texto: 'Lluvia', icono: <CloudRain size={32} className="tw-text-blue-500" /> };
        if ([71, 73, 75, 77, 85, 86].includes(codigo)) return { texto: 'Nieve', icono: <CloudSnow size={32} className="tw-text-blue-300" /> };
        if (codigo === 95) return { texto: 'Tormenta eléctrica', icono: <CloudLightning size={32} className="tw-text-purple-500" /> };
        return { texto: 'Clima', icono: <Thermometer size={32} className="tw-text-slate-500" /> };
    };

    // Filtrar solicitudes activas ("solicitado" o "proceso")
    const solicitudesPendientesActivas = solicitudes.filter(
        sol => sol.ultimoEstado?.toLowerCase() === "solicitado" || sol.ultimoEstado?.toLowerCase() === "proceso"
    );

    // Paginación para el modal "Ver más"
    const totalPaginas = Math.ceil(solicitudesPendientesActivas.length / itemsPorPagina);
    const solicitudesPaginadas = solicitudesPendientesActivas.slice(
        (paginaActual - 1) * itemsPorPagina,
        paginaActual * itemsPorPagina
    );

    return (
        <div className="tw-container tw-mx-auto tw-p-4">
            <div className="tw-mb-8 tw-flex tw-flex-col md:tw-flex-row md:tw-items-center md:tw-justify-between tw-gap-4">
                <div>
                    <div className="tw-flex tw-items-center tw-gap-3 tw-mb-2">
                        {GreetingIcon && <GreetingIcon size={32} style={{ color: greeting.color }} />}
                        <h1 className="tw-text-3xl tw-font-bold tw-text-slate-800">
                            {greeting.text}, {getUserName()}!
                        </h1>
                    </div>
                    <p className="tw-text-slate-600 tw-mt-2">{greeting.message}</p>
                </div>

                {/* Apartado de Clima */}
                <div className="tw-bg-white tw-rounded-2xl tw-shadow-[15px_15px_30px_#bebebe,_-15px_-15px_30px_#ffffff] tw-border tw-border-slate-200 tw-p-4 tw-flex tw-items-center tw-gap-4 tw-w-fit">
                    {clima.cargando ? (
                        <div className="tw-flex tw-items-center tw-gap-2 tw-text-slate-500">
                            <Loader size={20} className="tw-animate-spin" />
                            <span className="tw-text-sm">Obteniendo clima...</span>
                        </div>
                    ) : clima.error ? (
                        <span className="tw-text-sm tw-text-slate-400">No se pudo obtener el clima</span>
                    ) : (
                        <>
                            <span>{getDescripcionClima(clima.codigo, clima.esDeDia).icono}</span>
                            <div>
                                <p className="tw-text-sm tw-text-slate-500">{clima.ciudad}</p>
                                <p className="tw-text-xl tw-font-bold tw-text-slate-800">
                                    {clima.temperatura}°C
                                    <span className="tw-text-sm tw-font-normal tw-text-slate-500 tw-ml-2">
                                        {getDescripcionClima(clima.codigo, clima.esDeDia).texto}
                                    </span>
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* SECCIÓN PRINCIPAL: Izquierda (Alertas + Resumen) / Derecha (Solicitudes Pendientes - Máx 2) */}
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6 tw-mb-8">

                {/* LADO IZQUIERDO: Alertas de Inventario + Métricas Generales */}
                <div className="tw-flex tw-flex-col tw-gap-6">
                    {/* Alertas de Vencimiento y Stock Crítico */}
                    <div className="tw-bg-white tw-rounded-2xl tw-shadow-[15px_15px_30px_#bebebe,_-15px_-15px_30px_#ffffff] tw-border tw-border-slate-200 tw-p-6">
                        <div className="tw-flex tw-items-center tw-gap-2 tw-mb-4">
                            <TriangleAlert className="tw-text-amber-500 tw-text-lg tw-mt-0" />
                            <h3 className="tw-text-lg tw-font-semibold tw-text-slate-800">Alertas de Inventario</h3>
                        </div>
                        <div className="tw-space-y-3">
                            <div
                                className="tw-flex tw-items-center tw-gap-3 tw-p-3 tw-bg-amber-50 tw-rounded-lg tw-border tw-border-amber-200 tw-cursor-pointer hover:tw-bg-amber-100 tw-transition-all"
                                onClick={() => setModalVencimientos(true)}
                            >
                                <div className="tw-w-2 tw-h-2 tw-bg-amber-500 tw-rounded-full"></div>
                                <span className="tw-text-sm tw-text-slate-700">
                                    {proximosAVencer.length} insumos vencen en los próximos 2 meses
                                </span>
                                <i className="fa-solid fa-chevron-right tw-text-amber-400 tw-ml-auto tw-text-xs"></i>
                            </div>
                            <div
                                className="tw-flex tw-items-center tw-gap-3 tw-p-3 tw-bg-red-50 tw-rounded-lg tw-border tw-border-red-200 tw-cursor-pointer hover:tw-bg-red-100 tw-transition-all"
                                onClick={() => setModalCriticos(true)}
                            >
                                <div className="tw-w-2 tw-h-2 tw-bg-red-500 tw-rounded-full"></div>
                                <span className="tw-text-sm tw-text-slate-700">
                                    {stockCritico.length} insumos con stock crítico
                                </span>
                                <i className="fa-solid fa-chevron-right tw-text-red-400 tw-ml-auto tw-text-xs"></i>
                            </div>
                        </div>
                    </div>

                    {/* NUEVO BLOQUE IZQUIERDO: Resumen Rápido del Almacén SENA (Rellena el espacio perfectamente) */}
                    <div className="tw-bg-white tw-rounded-2xl tw-shadow-[15px_15px_30px_#bebebe,_-15px_-15px_30px_#ffffff] tw-border tw-border-slate-200 tw-p-6">
                        <div className="tw-flex tw-items-center tw-gap-2 tw-mb-4">
                            <Boxes className="tw-text-primario-900 tw-w-5 tw-h-5" />
                            <h3 className="tw-text-lg tw-font-semibold tw-text-slate-800">Resumen de Unidad Agroindustrial</h3>
                        </div>
                        <div className="tw-grid tw-grid-cols-3 tw-gap-3">
                            <div className="tw-p-3 tw-bg-slate-50 tw-rounded-xl tw-border tw-border-slate-100 tw-text-center">
                                <span className="tw-block tw-text-xs tw-text-slate-500 tw-font-medium tw-mb-1">Insumos</span>
                                <span className="tw-text-lg tw-font-bold tw-text-slate-800">{cargando ? '...' : (totalInsumos || 0)}</span>
                            </div>
                            <div className="tw-p-3 tw-bg-slate-50 tw-rounded-xl tw-border tw-border-slate-100 tw-text-center">
                                <span className="tw-block tw-text-xs tw-text-slate-500 tw-font-medium tw-mb-1">Entradas Hoy</span>
                                <span className="tw-text-lg tw-font-bold tw-text-emerald-600">{cargando ? '...' : (entradasHoy || 0)}</span>
                            </div>
                            <div className="tw-p-3 tw-bg-slate-50 tw-rounded-xl tw-border tw-border-slate-100 tw-text-center">
                                <span className="tw-block tw-text-xs tw-text-slate-500 tw-font-medium tw-mb-1">Proveedores</span>
                                <span className="tw-text-lg tw-font-bold tw-text-slate-800">{cargando ? '...' : (totalProveedores || 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LADO DERECHO: Solicitudes Pendientes (Máx 2 visibles, sin scroll) */}
                <div className="tw-bg-white tw-rounded-2xl tw-shadow-[15px_15px_30px_#bebebe,_-15px_-15px_30px_#ffffff] tw-border tw-border-slate-200 tw-p-6 tw-flex tw-flex-col tw-justify-between">
                    <div>
                        <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
                            <div className="tw-flex tw-items-center tw-gap-2">
                                <ClipboardList className="tw-text-primario-900 tw-w-5 tw-h-5" />
                                <h3 className="tw-text-lg tw-font-semibold tw-text-slate-800">Solicitudes Pendientes</h3>
                            </div>
                            <button
                                onClick={cargarSolicitudes}
                                className="tw-p-1 tw-rounded-lg tw-text-primario-900 hover:tw-text-primario-950 tw-transition-all tw-bg-transparent hover:tw-bg-secundario-200 tw-border-none tw-h-8 tw-w-8 tw-flex tw-items-center tw-justify-center"
                                title="Actualizar solicitudes"
                            >
                                <RefreshCw className={`tw-w-4 tw-h-4 ${loadingSolicitudes ? 'tw-animate-spin' : ''}`} />
                            </button>
                        </div>

                        {loadingSolicitudes ? (
                            <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-8 tw-gap-2">
                                <Loader2 className="tw-w-6 tw-h-6 tw-text-primario-500 tw-animate-spin" />
                                <span className="tw-text-xs tw-text-slate-400">Cargando solicitudes...</span>
                            </div>
                        ) : solicitudesPendientesActivas.length === 0 ? (
                            <div className="tw-text-center tw-py-8">
                                <i className="fa-solid fa-circle-check tw-text-green-500 tw-text-3xl tw-mb-2"></i>
                                <p className="tw-text-sm tw-text-slate-600">No hay solicitudes pendientes de despacho</p>
                            </div>
                        ) : (
                            <div className="tw-space-y-3">
                                {solicitudesPendientesActivas.slice(0, 2).map((sol) => (
                                    <div
                                        key={sol.Id_solicitud}
                                        className="tw-p-3.5 tw-bg-slate-50 tw-rounded-xl tw-border tw-border-slate-200"
                                    >
                                        <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
                                            <div className="tw-flex tw-items-center tw-gap-1.5">
                                                <span className="tw-font-bold tw-text-xs tw-text-primario-900">Nombre:</span>
                                                <span className="tw-text-xs tw-text-slate-600 tw-font-medium truncate tw-max-w-[130px]">
                                                    {sol.responsable?.Nom_Responsable ?? "Sin resp."}
                                                </span>
                                            </div>
                                            <EstadoBadge estado={sol.ultimoEstado} />
                                        </div>

                                        <div className="tw-text-xs tw-text-slate-600 tw-mb-3">
                                            <span className="tw-font-bold tw-text-primario-900">Motivo:</span> {sol.motivo}
                                            {sol.Ficha && <span className="tw-ml-2 tw-text-primario-900">| Ficha: {sol.Ficha}</span>}
                                        </div>

                                        {/* Botones de acción rápida */}
                                        <div className="tw-flex tw-gap-2 tw-justify-end">
                                            {sol.ultimoEstado?.toLowerCase() === "solicitado" && (
                                                <>
                                                    <button
                                                        onClick={() => cambiarEstado(sol.Id_solicitud, 2, "proceso")}
                                                        className="tw-flex tw-items-center tw-gap-1 tw-px-2.5 tw-py-1 tw-rounded-lg tw-bg-primario-900 tw-text-white tw-text-xs tw-font-medium hover:tw-bg-primario-700 tw-transition-all tw-border-none"
                                                    >
                                                        <CheckCircle className="tw-w-3.5 tw-h-3.5" /> Aceptar
                                                    </button>
                                                    <button
                                                        onClick={() => cambiarEstado(sol.Id_solicitud, 4, "cancelado")}
                                                        className="tw-flex tw-items-center tw-gap-1 tw-px-2.5 tw-py-1 tw-rounded-lg tw-bg-red-500 tw-text-white tw-text-xs tw-font-medium hover:tw-bg-red-600 tw-transition-all tw-border-none"
                                                    >
                                                        <XCircle className="tw-w-3.5 tw-h-3.5" /> Cancelar
                                                    </button>
                                                </>
                                            )}
                                            {sol.ultimoEstado?.toLowerCase() === "proceso" && (
                                                <>
                                                    <button
                                                        onClick={() => cambiarEstado(sol.Id_solicitud, 3, "despachado")}
                                                        className="tw-flex tw-items-center tw-gap-1 tw-px-2.5 tw-py-1 tw-rounded-lg tw-bg-green-600 tw-text-white tw-text-xs tw-font-medium hover:tw-bg-green-700 tw-transition-all tw-border-none"
                                                    >
                                                        <Truck className="tw-w-3.5 tw-h-3.5" /> Despachar
                                                    </button>
                                                    <button
                                                        onClick={() => cambiarEstado(sol.Id_solicitud, 4, "cancelado")}
                                                        className="tw-flex tw-items-center tw-gap-1 tw-px-2.5 tw-py-1 tw-rounded-lg tw-bg-red-500 tw-text-white tw-text-xs tw-font-medium hover:tw-bg-red-600 tw-transition-all tw-border-none"
                                                    >
                                                        <XCircle className="tw-w-3.5 tw-h-3.5" /> Cancelar
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* BOTÓN "VER MÁS" SI HAY MÁS DE 2 SOLICITUDES */}
                    {solicitudesPendientesActivas.length > 2 && (
                        <div className="tw-mt-4 tw-pt-3 tw-border-t tw-border-slate-100 tw-text-right">
                            <button
                                onClick={() => setModalVerMas(true)}
                                className="tw-inline-flex tw-items-center tw-gap-1.5 tw-text-xs tw-font-bold tw-text-primario-900 hover:tw-text-primario-700 tw-bg-transparent tw-border-none tw-cursor-pointer"
                            >
                                <Eye className="tw-w-4 tw-h-4" /> Ver más solicitudes ({solicitudesPendientesActivas.length})
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="tw-bg-white tw-rounded-2xl tw-shadow-[15px_15px_30px_#bebebe,_-15px_-15px_30px_#ffffff] tw-border tw-border-slate-200 tw-p-6">
                <h3 className="tw-text-lg tw-font-semibold tw-text-slate-800 tw-mb-4">Acciones Rápidas</h3>
                <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-4">
                    <button
                        onClick={() => navigate('/Entradas')}
                        className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-4 hover:tw-bg-secundario-200 tw-text-white tw-rounded-xl hover:tw-shadow-lg tw-transition-all hover:-translate-y-1 tw-border-none tw-cursor-pointer"
                    >
                        <ArchiveRestore color="#153753" className="tw-text-2xl tw-mb-2" />
                        <span className="tw-text-sm tw-font-medium tw-text-primario-950">Registrar Entrada</span>
                    </button>

                    <button
                        onClick={() => navigate('/solicitudes-pendientes')}
                        className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-4 hover:tw-bg-secundario-200 tw-text-white tw-rounded-xl hover:tw-shadow-lg tw-transition-all hover:-translate-y-1 tw-border-none tw-cursor-pointer"
                    >
                        <ClipboardPaste color="#153753" className="tw-text-2xl tw-mb-2" />
                        <span className="tw-text-sm tw-font-medium tw-text-primario-950">Registrar Salida</span>
                    </button>

                    <button
                        onClick={() => navigate('/Insumos')}
                        className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-4 hover:tw-bg-secundario-200 tw-text-white tw-rounded-xl hover:tw-shadow-lg tw-transition-all hover:-translate-y-1 tw-border-none tw-cursor-pointer"
                    >
                        <Plus color="#153753" className="tw-text-2xl tw-mb-2" />
                        <span className="tw-text-sm tw-font-medium tw-text-primario-950">Nuevo Insumo</span>
                    </button>

                    <button
                        onClick={() => navigate('/Insumos')}
                        className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-4 hover:tw-bg-secundario-200 tw-text-white tw-rounded-xl hover:tw-shadow-lg tw-transition-all hover:-translate-y-1 tw-border-none tw-cursor-pointer"
                    >
                        <Wheat color="#153753" className="tw-text-2xl tw-mb-2" />
                        <span className="tw-text-sm tw-font-medium tw-text-primario-950">Ver Inventario</span>
                    </button>
                </div>
            </div>

            {/* MODAL: VER MÁS SOLICITUDES CON PAGINACIÓN (10 por página) */}
            {modalVerMas && (
                <div className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-flex tw-items-center tw-justify-center tw-z-50" onClick={() => setModalVerMas(false)}>
                    <div className="tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-3xl tw-max-h-[85vh] tw-overflow-hidden tw-flex tw-flex-col" onClick={e => e.stopPropagation()}>
                        <div className="tw-bg-secundario-400  tw-px-6 tw-py-4 tw-flex tw-justify-between tw-items-center">
                            <div className="tw-flex tw-items-center tw-gap-3">
                                <ClipboardList className="tw-text-primario-900 tw-w-6 tw-h-6" />
                                <h3 className="tw-text-primario-900 tw-font-semibold tw-text-lg">Todas las Solicitudes Pendientes ({solicitudesPendientesActivas.length})</h3>
                            </div>
                            <button onClick={() => setModalVerMas(false)} className="tw-text-primario-900 tw-rounded-lg tw-p-1 tw-transition-all tw-bg-transparent tw-border-none">
                                <X className="tw-p-1 tw-rounded-lg tw-text-primario-900 hover:tw-text-primario-950 tw-transition-all tw-bg-transparent hover:tw-bg-secundario-200 tw-border-none tw-h-8 tw-w-8 tw-flex tw-items-center tw-justify-center" />
                            </button>
                        </div>
                        <div className="tw-p-6 tw-overflow-y-auto tw-flex-1 tw-space-y-3">
                            {solicitudesPaginadas.map((sol) => (
                                <div key={sol.Id_solicitud} className="tw-p-4 tw-bg-slate-50 tw-rounded-xl tw-border tw-border-slate-200 tw-flex tw-items-center tw-justify-between">
                                    <div>
                                        <div className="tw-flex tw-items-center tw-gap-2 tw-mb-1">
                                            <span className="tw-font-bold tw-text-sm tw-text-primario-900">#{sol.Id_solicitud}</span>
                                            <span className="tw-text-xs tw-text-slate-600 tw-font-medium">— {sol.responsable?.Nom_Responsable ?? "Sin resp."}</span>
                                            <EstadoBadge estado={sol.ultimoEstado} />
                                        </div>
                                        <p className="tw-text-xs tw-text-slate-600 tw-m-0"><strong>Motivo:</strong> {sol.motivo} {sol.Ficha && `| Ficha: ${sol.Ficha}`}</p>
                                    </div>
                                    <div className="tw-flex tw-gap-2">
                                        {sol.ultimoEstado?.toLowerCase() === "solicitado" && (
                                            <>
                                                <button onClick={() => cambiarEstado(sol.Id_solicitud, 2, "proceso")} className="tw-px-3 tw-py-1.5 tw-rounded-lg tw-bg-primario-900 tw-text-white tw-text-xs tw-font-medium hover:tw-bg-primario-700 tw-border-none">Aceptar</button>
                                                <button onClick={() => cambiarEstado(sol.Id_solicitud, 4, "cancelado")} className="tw-px-3 tw-py-1.5 tw-rounded-lg tw-bg-red-500 tw-text-white tw-text-xs tw-font-medium hover:tw-bg-red-600 tw-border-none">Cancelar</button>
                                            </>
                                        )}
                                        {sol.ultimoEstado?.toLowerCase() === "proceso" && (
                                            <>
                                                <button onClick={() => cambiarEstado(sol.Id_solicitud, 3, "despachado")} className="tw-px-3 tw-py-1.5 tw-rounded-lg tw-bg-green-600 tw-text-white tw-text-xs tw-font-medium hover:tw-bg-green-700 tw-border-none">Despachar</button>
                                                <button onClick={() => cambiarEstado(sol.Id_solicitud, 4, "cancelado")} className="tw-px-3 tw-py-1.5 tw-rounded-lg tw-bg-red-500 tw-text-white tw-text-xs tw-font-medium hover:tw-bg-red-600 tw-border-none">Cancelar</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CONTROLES DE PAGINACIÓN */}
                        {totalPaginas > 1 && (
                            <div className="tw-px-6 tw-py-3 tw-bg-slate-100 tw-border-t tw-border-slate-200 tw-flex tw-items-center tw-justify-between">
                                <span className="tw-text-xs tw-text-slate-600">Página {paginaActual} de {totalPaginas}</span>
                                <div className="tw-flex tw-gap-2">
                                    <button
                                        disabled={paginaActual === 1}
                                        onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                                        className="tw-px-3 tw-py-1.5 tw-rounded-lg tw-bg-white tw-border tw-border-slate-300 tw-text-xs tw-font-medium tw-disabled:opacity-40"
                                    >
                                        <ChevronLeft className="tw-w-4 tw-h-4" /> Anterior
                                    </button>
                                    <button
                                        disabled={paginaActual === totalPaginas}
                                        onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
                                        className="tw-px-3 tw-py-1.5 tw-rounded-lg tw-bg-white tw-border tw-border-slate-300 tw-text-xs tw-font-medium tw-disabled:opacity-40"
                                    >
                                        Siguiente <ChevronRight className="tw-w-4 tw-h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL DE VENCIMIENTOS */}
            {modalVencimientos && (
                <div className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-flex tw-items-center tw-justify-center tw-z-50" onClick={() => setModalVencimientos(false)}>
                    <div className="tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-3xl tw-max-h-[85vh] tw-overflow-hidden tw-flex tw-flex-col" onClick={e => e.stopPropagation()}>
                        <div className="tw-bg-secundario-400 tw-px-6 tw-py-4 tw-flex tw-justify-between tw-items-center">
                            <div className="tw-flex tw-items-center tw-gap-3">
                                <Clock className="tw-text-primario-900 tw-w-6 tw-h-6" />
                                <h3 className="tw-text-primario-900 tw-font-semibold tw-text-lg">Insumos Próximos a Vencer</h3>
                            </div>
                            <button onClick={() => setModalVencimientos(false)} className="tw-text-primario-900 tw-rounded-lg tw-p-1 tw-transition-all tw-bg-transparent tw-border-none">
                                <X className="tw-p-1 tw-rounded-lg tw-text-primario-900 hover:tw-text-primario-950 tw-transition-all tw-bg-transparent hover:tw-bg-secundario-200 tw-border-none tw-h-8 tw-w-8 tw-flex tw-items-center tw-justify-center" />
                            </button>
                        </div>
                        <div className="tw-p-6 tw-overflow-y-auto tw-flex-1">
                            {proximosAVencer.length > 0 ? (
                                <table className="tw-w-full">
                                    <thead>
                                        <tr className="tw-border-b tw-border-slate-200">
                                            <th className="tw-text-left tw-pb-3 tw-text-slate-600 tw-font-medium">Insumo</th>
                                            <th className="tw-text-left tw-pb-3 tw-text-slate-600 tw-font-medium">Lote</th>
                                            <th className="tw-text-left tw-pb-3 tw-text-slate-600 tw-font-medium">Disponible</th>
                                            <th className="tw-text-left tw-pb-3 tw-text-slate-600 tw-font-medium">Vencimiento</th>
                                            <th className="tw-text-left tw-pb-3 tw-text-slate-600 tw-font-medium">Días Rest.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {proximosAVencer.map((item, index) => (
                                            <tr key={index} className="tw-border-b tw-border-slate-100 hover:tw-bg-amber-50">
                                                <td className="tw-py-3 tw-text-slate-800">{item.nombreInsumo}</td>
                                                <td className="tw-py-3 tw-text-slate-600">{item.lote}</td>
                                                <td className="tw-py-3 tw-text-slate-600">{item.cantidadDisponible}</td>
                                                <td className="tw-py-3 tw-text-slate-600">{formatearFecha(item.fechaVencimiento)}</td>
                                                <td className="tw-py-3">
                                                    <span className={`tw-px-2 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium ${item.diasRestantes <= 15 ? 'tw-bg-red-100 tw-text-red-700' : 'tw-bg-amber-100 tw-text-amber-700'}`}>
                                                        {item.diasRestantes} días
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="tw-text-center tw-py-8">
                                    <CheckCircle className="tw-text-green-500 tw-w-10 tw-h-10 tw-mx-auto tw-mb-3" />
                                    <p className="tw-text-slate-600">No hay insumos próximos a vencer</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE STOCK CRÍTICO */}
            {modalCriticos && (
                <div className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-flex tw-items-center tw-justify-center tw-z-50" onClick={() => setModalCriticos(false)}>
                    <div className="tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-3xl tw-max-h-[85vh] tw-overflow-hidden tw-flex tw-flex-col" onClick={e => e.stopPropagation()}>
                        <div className="tw-bg-secundario-400 tw-px-6 tw-py-4 tw-flex tw-justify-between tw-items-center">
                            <div className="tw-flex tw-items-center tw-gap-3">
                                <TriangleAlert className="tw-text-primario-900 tw-w-6 tw-h-6" />
                                <h3 className="tw-text-primario-900 tw-font-semibold tw-text-lg">Insumos con Stock Crítico</h3>
                            </div>
                            <button onClick={() => setModalCriticos(false)} className="tw-text-primario-900 tw-rounded-lg tw-p-1 tw-transition-all tw-bg-transparent tw-border-none">
                                <X className="tw-p-1 tw-rounded-lg tw-text-primario-900 hover:tw-text-primario-950 tw-transition-all tw-bg-transparent hover:tw-bg-secundario-200 tw-border-none tw-h-8 tw-w-8 tw-flex tw-items-center tw-justify-center" />
                            </button>
                        </div>
                        <div className="tw-p-6 tw-overflow-y-auto tw-flex-1">
                            {stockCritico.length > 0 ? (
                                <table className="tw-w-full">
                                    <thead>
                                        <tr className="tw-border-b tw-border-slate-200">
                                            <th className="tw-text-left tw-pb-3 tw-text-slate-600 tw-font-medium">Insumo</th>
                                            <th className="tw-text-left tw-pb-3 tw-text-slate-600 tw-font-medium">Total Disponible</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stockCritico.map((item, index) => (
                                            <tr key={index} className="tw-border-b tw-border-slate-100 hover:tw-bg-red-50">
                                                <td className="tw-py-3 tw-text-slate-800">{item.nombreInsumo}</td>
                                                <td className="tw-py-3 tw-text-red-600 tw-font-bold tw-text-lg">{item.cantidadDisponibleTotal}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="tw-text-center tw-py-8">
                                    <CheckCircle className="tw-text-green-500 tw-w-10 tw-h-10 tw-mx-auto tw-mb-3" />
                                    <p className="tw-text-slate-600">No hay insumos con stock crítico</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inicio;
