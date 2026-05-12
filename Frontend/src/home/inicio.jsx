import { useState, useEffect } from 'react';
import { useContadores } from '../Hooks/useContadores';
import {
    Sunrise,
    Sun,
    MoonStar,
    Loader,
    Wheat,
    ArchiveRestore,
    ClipboardClock,
    UserRound,
} from 'lucide-react'

const Inicio = () => {
    const [greeting, setGreeting] = useState({
        text: '',
        SvgLucide: null,
        color: '',
        message: ''
    });

    // 👈 ESTADOS PARA LOS MODALES
    const [modalVencimientos, setModalVencimientos] = useState(false);
    const [modalCriticos, setModalCriticos] = useState(false);

    const {
        totalInsumos,
        totalSolicitudes,
        totalProveedores,
        entradasHoy,
        proximosAVencer,  // 👈 NUEVO
        stockCritico,      // 👈 NUEVO
        cargando
    } = useContadores();

    useEffect(() => {
        const getGreeting = () => {
            const hour = new Date().getHours();

            if (hour >= 5 && hour < 12) {
                setGreeting({
                    text: 'Buenos días',
                    SvgLucide: Sunrise,
                    color: '#FFA500',
                    message: 'Que tengas un excelente día'
                });
            } else if (hour >= 12 && hour < 19) {
                setGreeting({
                    text: 'Buenas tardes',
                    SvgLucide: Sun,
                    color: '#FF6347',
                    message: 'Que tengas una excelente tarde'
                });
            } else {
                setGreeting({
                    text: 'Buenas noches',
                    SvgLucide: MoonStar,
                    color: '#4A90E2',
                    message: 'Que tengas una excelente noche'
                });
            }
        };

        getGreeting();
        const interval = setInterval(getGreeting, 60000);
        return () => clearInterval(interval);
    }, []);

    const getUserName = () => {
        try {
            const userData = localStorage.getItem('userFoodStocker');
            if (userData) {
                return JSON.parse(userData).nombre || 'Usuario';
            }
        } catch (error) {
            console.error('Error al leer datos del usuario:', error);
        }
        return 'Usuario';
    };

    const GreetingIcon = greeting.SvgLucide;

    // 👈 FUNCIÓN PARA FORMATEAR FECHA
    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="tw-container tw-mx-auto tw-p-4">

            {/* Encabezado con saludo */}
            <div className="tw-mb-8">
                <div className="tw-flex tw-items-center tw-gap-3 tw-mb-2">
                    {GreetingIcon && (
                        <GreetingIcon
                            size={32}
                            style={{ color: greeting.color }}
                        />
                    )}
                    <h1 className="tw-text-3xl tw-font-bold tw-text-slate-800">
                        {greeting.text}, {getUserName()}!
                    </h1>
                </div>
                <p className="tw-text-slate-600 tw-mt-2">
                    {greeting.message}
                </p>
            </div>

            {/* Métricas Principales */}
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-6 tw-mb-8">

                {/* Insumos Totales */}
                <div className="tw-bg-white tw-rounded-2xl tw-shadow-[15px_15px_30px_#bebebe,_-15px_-15px_30px_#ffffff] tw-border tw-border-slate-200 tw-p-6 hover:tw-shadow-md tw-transition-all">
                    <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
                        <div className="tw-w-12 tw-h-12 tw-bg-gradient-to-br tw-from-cyan-500 tw-to-blue-500 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-shadow-lg">
                            <Wheat size={24} color="white" />
                        </div>
                        <span className="tw-text-xs tw-font-medium tw-text-slate-500 tw-uppercase tw-tracking-wider">Total</span>
                    </div>
                    <h2 className="tw-text-3xl tw-font-bold tw-text-slate-800 tw-mb-2">{cargando ? <Loader /> : totalInsumos}</h2>
                    <p className="tw-text-slate-500 tw-text-sm">Insumos registrados</p>
                </div>

                {/* Entradas Hoy */}
                <div className="tw-bg-white tw-rounded-2xl tw-shadow-[15px_15px_30px_#bebebe,_-15px_-15px_30px_#ffffff] tw-border tw-border-slate-200 tw-p-6 hover:tw-shadow-md tw-transition-all">
                    <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
                        <div className="tw-w-12 tw-h-12 tw-bg-gradient-to-br tw-from-emerald-500 tw-to-teal-500 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-shadow-lg">
                            <ArchiveRestore size={24} color="white" />
                        </div>
                        <span className="tw-text-xs tw-font-medium tw-text-slate-500 tw-uppercase tw-tracking-wider">Hoy</span>
                    </div>
                    <h2 className="tw-text-3xl tw-font-bold tw-text-slate-800 tw-mb-2">{cargando ? <Loader /> : entradasHoy}</h2>
                    <p className="tw-text-slate-500 tw-text-sm">Entradas hoy</p>
                </div>

                {/* Solicitudes Pendientes */}
                <div className="tw-bg-white tw-rounded-2xl tw-shadow-[15px_15px_30px_#bebebe,_-15px_-15px_30px_#ffffff] tw-border tw-border-slate-200 tw-p-6 hover:tw-shadow-md tw-transition-all">
                    <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
                        <div className="tw-w-12 tw-h-12 tw-bg-gradient-to-br tw-from-amber-500 tw-to-yellow-500 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-shadow-lg">
                            <ClipboardClock size={24} color="white" />
                        </div>
                        <span className="tw-text-xs tw-font-medium tw-text-slate-500 tw-uppercase tw-tracking-wider">Pendientes</span>
                    </div>
                    <h2 className="tw-text-3xl tw-font-bold tw-text-slate-800 tw-mb-2">{cargando ? <Loader /> : totalSolicitudes}</h2>
                    <p className="tw-text-slate-500 tw-text-sm">Solicitudes</p>
                </div>

                {/* Proveedores Activos */}
                <div className="tw-bg-white tw-rounded-2xl tw-shadow-[15px_15px_30px_#bebebe,_-15px_-15px_30px_#ffffff] tw-border tw-border-slate-200 tw-p-6 hover:tw-shadow-md tw-transition-all">
                    <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
                        <div className="tw-w-12 tw-h-12 tw-bg-gradient-to-br tw-from-purple-500 tw-to-pink-500 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-shadow-lg">
                            <UserRound size={24} color="white" />
                        </div>
                        <span className="tw-text-xs tw-font-medium tw-text-slate-500 tw-uppercase tw-tracking-wider">Proveedores</span>
                    </div>
                    <h2 className="tw-text-3xl tw-font-bold tw-text-slate-800 tw-mb-2">{cargando ? <Loader /> : totalProveedores}</h2>
                    <p className="tw-text-slate-500 tw-text-sm">Proveedores</p>
                </div>

            </div>

            {/* Alertas y Notificaciones */}
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6 tw-mb-8">
                {/* 👈 SECCIÓN DE VENCIMIENTOS - AHORA CON CLICK */}
                <div className="tw-bg-white tw-rounded-2xl tw-shadow-[15px_15px_30px_#bebebe,_-15px_-15px_30px_#ffffff] tw-border tw-border-slate-200 tw-p-6">
                    <div className="tw-flex tw-items-center tw-gap-2 tw-mb-4">
                        <i className="fa-solid fa-triangle-exclamation tw-text-amber-500 tw-text-lg"></i>
                        <h3 className="tw-text-lg tw-font-semibold tw-text-slate-800">Alertas de Vencimiento</h3>
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

                <div className="tw-bg-white tw-rounded-2xl tw-shadow-[15px_15px_30px_#bebebe,_-15px_-15px_30px_#ffffff] tw-border tw-border-slate-200 tw-p-6">
                    <div className="tw-flex tw-items-center tw-gap-2 tw-mb-4">
                        <i className="fa-solid fa-chart-line tw-text-blue-500 tw-text-lg"></i>
                        <h3 className="tw-text-lg tw-font-semibold tw-text-slate-800">Rendimiento Reciente</h3>
                    </div>
                    <div className="tw-space-y-3">
                        <div className="tw-flex tw-items-center tw-gap-3 tw-p-3 tw-bg-blue-50 tw-rounded-lg tw-border tw-border-blue-200">
                            <div className="tw-w-2 tw-h-2 tw-bg-blue-500 tw-rounded-full"></div>
                            <span className="tw-text-sm tw-text-slate-700">Promedio de uso: 85%</span>
                        </div>
                        <div className="tw-flex tw-items-center tw-gap-3 tw-p-3 tw-bg-blue-50 tw-rounded-lg tw-border tw-border-blue-200">
                            <div className="tw-w-2 tw-h-2 tw-bg-blue-500 tw-rounded-full"></div>
                            <span className="tw-text-sm tw-text-slate-700">Rotación de inventario: 3.2 veces/mes</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="tw-bg-white tw-rounded-2xl tw-shadow-[15px_15px_30px_#bebebe,_-15px_-15px_30px_#ffffff] tw-border tw-border-slate-200 tw-p-6">
                <h3 className="tw-text-lg tw-font-semibold tw-text-slate-800 tw-mb-4">Acciones Rápidas</h3>
                <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-4">
                    <button className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-4 tw-bg-gradient-to-br tw-from-emerald-500 tw-to-teal-500 tw-text-white tw-rounded-xl hover:tw-shadow-lg tw-transition-all hover:-translate-y-1">
                        <i className="fa-solid fa-truck-ramp-box tw-text-2xl tw-mb-2"></i>
                        <span className="tw-text-sm tw-font-medium">Registrar Entrada</span>
                    </button>
                    <button className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-4 tw-bg-gradient-to-br tw-from-blue-500 tw-to-indigo-500 tw-text-white tw-rounded-xl hover:tw-shadow-lg tw-transition-all hover:-translate-y-1">
                        <i className="fa-solid fa-right-from-bracket tw-text-2xl tw-mb-2"></i>
                        <span className="tw-text-sm tw-font-medium">Registrar Salida</span>
                    </button>
                    <button className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-4 tw-bg-gradient-to-br tw-from-amber-500 tw-to-orange-500 tw-text-white tw-rounded-xl hover:tw-shadow-lg tw-transition-all hover:-translate-y-1">
                        <i className="fa-solid fa-plus tw-text-2xl tw-mb-2"></i>
                        <span className="tw-text-sm tw-font-medium">Nuevo Insumo</span>
                    </button>
                    <button className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-4 tw-bg-gradient-to-br tw-from-purple-500 tw-to-pink-500 tw-text-white tw-rounded-xl hover:tw-shadow-lg tw-transition-all hover:-translate-y-1">
                        <i className="fa-solid fa-box-open tw-text-2xl tw-mb-2"></i>
                        <span className="tw-text-sm tw-font-medium">Ver Inventario</span>
                    </button>
                </div>
            </div>

            {/* Gráfico de Tendencia de Entradas (Placeholder) */}
            <div className="tw-mt-8 tw-bg-white tw-rounded-2xl tw-shadow-[15px_15px_30px_#bebebe,_-15px_-15px_30px_#ffffff] tw-border tw-border-slate-200 tw-p-6">
                <h3 className="tw-text-lg tw-font-semibold tw-text-slate-800 tw-mb-4">Tendencia de Entradas (Últimos 6 meses)</h3>
                <div className="tw-h-64 tw-bg-slate-50 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-border tw-border-dashed tw-border-slate-300">
                    <span className="tw-text-slate-400 tw-text-sm">Gráfico de tendencias próximamente</span>
                </div>
            </div>

            {/* 👈 MODAL DE VENCIMIENTOS */}
            {modalVencimientos && (
                <div className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-flex tw-items-center tw-justify-center tw-z-50" onClick={() => setModalVencimientos(false)}>
                    <div className="tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-2xl tw-max-h-[80vh] tw-overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="tw-bg-gradient-to-r tw-from-amber-500 tw-to-orange-500 tw-px-6 tw-py-4 tw-flex tw-justify-between tw-items-center">
                            <div className="tw-flex tw-items-center tw-gap-3">
                                <i className="fa-solid fa-clock tw-text-white tw-text-xl"></i>
                                <h3 className="tw-text-white tw-font-semibold tw-text-lg">Insumos Próximos a Vencer</h3>
                            </div>
                            <button
                                onClick={() => setModalVencimientos(false)}
                                className="tw-text-white hover:tw-bg-white/20 tw-rounded-lg tw-p-1 tw-transition-all"
                            >
                                <i className="fa-solid fa-xmark tw-text-xl"></i>
                            </button>
                        </div>
                        <div className="tw-p-6 tw-overflow-y-auto tw-max-h-[60vh]">
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
                                                    <span className={`tw-px-2 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium ${item.diasRestantes <= 15 ? 'tw-bg-red-100 tw-text-red-700' : 'tw-bg-amber-100 tw-text-amber-700'
                                                        }`}>
                                                        {item.diasRestantes} días
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="tw-text-center tw-py-8">
                                    <i className="fa-solid fa-check-circle tw-text-green-500 tw-text-4xl tw-mb-3"></i>
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
                    <div className="tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-2xl tw-max-h-[80vh] tw-overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="tw-bg-gradient-to-r tw-from-red-500 tw-to-pink-500 tw-px-6 tw-py-4 tw-flex tw-justify-between tw-items-center">
                            <div className="tw-flex tw-items-center tw-gap-3">
                                <i className="fa-solid fa-triangle-exclamation tw-text-white tw-text-xl"></i>
                                <h3 className="tw-text-white tw-font-semibold tw-text-lg">Insumos con Stock Crítico</h3>
                            </div>
                            <button
                                onClick={() => setModalCriticos(false)}
                                className="tw-text-white hover:tw-bg-white/20 tw-rounded-lg tw-p-1 tw-transition-all"
                            >
                                <i className="fa-solid fa-xmark tw-text-xl"></i>
                            </button>
                        </div>
                        <div className="tw-p-6 tw-overflow-y-auto tw-max-h-[60vh]">
                            {stockCritico.length > 0 ? (
                                <table className="tw-w-full">
                                    <thead>
                                        <tr className="tw-border-b tw-border-slate-200">
                                            <th className="tw-text-left tw-pb-3 tw-text-slate-600 tw-font-medium">Insumo</th>
                                            <th className="tw-text-left tw-pb-3 tw-text-slate-600 tw-font-medium">Lote</th>
                                            <th className="tw-text-left tw-pb-3 tw-text-slate-600 tw-font-medium">Disponible</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stockCritico.map((item, index) => (
                                            <tr key={index} className="tw-border-b tw-border-slate-100 hover:tw-bg-red-50">
                                                <td className="tw-py-3 tw-text-slate-800">{item.nombreInsumo}</td>
                                                <td className="tw-py-3 tw-text-slate-600">{item.lote}</td>
                                                <td className="tw-py-3 tw-text-slate-600">{item.cantidadDisponible}</td>
                                                <td className="tw-py-3">
                                                    <div className="tw-flex tw-items-center tw-gap-2">


                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="tw-text-center tw-py-8">
                                    <i className="fa-solid fa-check-circle tw-text-green-500 tw-text-4xl tw-mb-3"></i>
                                    <p className="tw-text-slate-600">No hay insumos con stock crítico</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default Inicio