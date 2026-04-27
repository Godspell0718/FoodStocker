import { useState, useEffect } from "react"
import apiAxios from '../api/axiosConfig.js';
import DataTable from 'react-data-table-component';
import InsumosForm from './insumosForm.jsx';
import Swal from "sweetalert2";
import { 
    Package, Tag, Layers, ClipboardList, Eye, 
    Pencil, Trash2, Plus, Search, X, Inbox, 
    AlertCircle, CheckCircle2, ArrowLeft, Boxes,
    History
} from "lucide-react"

const CrudInsumos = () => {

    const [insumos, setInsumos] = useState([]);
    const [filterText, setFilterText] = useState('');
    const [insumoEditando, setInsumoEditando] = useState(null);
    const [insumoDetalle, setInsumoDetalle] = useState(null);
    const [tipoDetalle, setTipoDetalle] = useState('disponible'); 
    const [vistaDetalle, setVistaDetalle] = useState(null);
    const [showModalForm, setShowModalForm] = useState(false);
    const [showModalSolicitudes, setShowModalSolicitudes] = useState(false);
    const [showModalLotes, setShowModalLotes] = useState(false);
    const [loading, setLoading] = useState(false);


    const [solicitudes, setSolicitudes] = useState([]);
    const [insumoSolicitudDetalle, setInsumoSolicitudDetalle] = useState(null);

    useEffect(() => {
        getAllInsumos();
        cargarSolicitudesInsumos(); // Nueva carga independiente
    }, []);

    const getAllInsumos = async () => {
        setLoading(true);
        try {
            const response = await apiAxios.get('/api/insumos/con-lotes');
            setInsumos(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error al obtener insumos:', error);
        } finally {
            setLoading(false);
        }
    };

    const cargarSolicitudesInsumos = async () => {
        try {
            const res = await apiAxios.get("/api/solicitudes/pendientes");
            const data = Array.isArray(res.data) ? res.data : [];
            const activas = data.filter(s => 
                s.ultimoEstado?.toLowerCase() === 'solicitado' || 
                s.ultimoEstado?.toLowerCase() === 'proceso'
            );
            setSolicitudes(activas);
        } catch (error) {
            console.error("Error al obtener solicitudes para conteo:", error);
        }
    };

    const obtenerConteoYLista = (idInsumo) => {
        const listaParaModal = [];
        let acumuladoSolicitado = 0;
        
        solicitudes.forEach(sol => {
            if (sol.insumos && Array.isArray(sol.insumos)) {
                sol.insumos.forEach(item => {
                    // Verificación por ambos posibles nombres de ID en el objeto
                    if (item.Id_insumos === idInsumo || item.id_insumo === idInsumo) {
                        acumuladoSolicitado += item.cantidad_solicitada;
                        listaParaModal.push({
                            id: sol.Id_solicitud,
                            cantidad: item.cantidad_solicitada,
                            estado: sol.ultimoEstado,
                            responsable: sol.responsable?.Nom_Responsable || 'N/A'
                        });
                    }
                });
            }
        });
        return { acumuladoSolicitado, listaParaModal };
    };

    const eliminarInsumo = async (id, nombre) => {
        const result = await Swal.fire({
            title: '¿Eliminar insumo?',
            text: `¿Estás seguro de eliminar "${nombre}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#153753',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await apiAxios.delete(`/api/insumos/${id}`);
                Swal.fire({
                    title: 'Eliminado',
                    text: 'Insumo eliminado correctamente',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                getAllInsumos();
            } catch (error) {
                let mensaje = 'Error al eliminar el insumo';
                if (error.response && error.response.status === 400) {
                    mensaje = error.response.data.error || 'No se puede eliminar el insumo porque tiene registros asociados.';
                }
                Swal.fire({ title: 'Error', text: mensaje, icon: 'error' });
            }
        }
    };

    const columns = [
        { 
            name: "ID", 
            selector: row => row.Id_Insumos, 
            sortable: true,
            width: "70px",
            cell: row => <span className="tw-font-mono tw-text-slate-500">#{row.Id_Insumos}</span>
        },
        { 
            name: "Nombre del insumo", 
            selector: row => row.Nom_Insumo, 
            sortable: true,
            grow: 2,
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-3">
                    <div className="tw-w-8 tw-h-8 tw-bg-primario-50 tw-rounded-lg tw-flex tw-items-center tw-justify-center">
                        <Package className="tw-w-4 tw-h-4 tw-text-primario-900" />
                    </div>
                    <span className="tw-font-medium tw-text-slate-700">{row.Nom_Insumo}</span>
                </div>
            )
        },
        { 
            name: "Tipo", 
            selector: row => row.Tip_Insumo, 
            sortable: true,
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-2">
                    <Tag className="tw-w-3.5 tw-h-3.5 tw-text-slate-400" />
                    <span className="tw-text-slate-600">{row.Tip_Insumo}</span>
                </div>
            )
        },
        {
            name: "Stock Disponible",
            selector: row => {
                return row.entradas
                    ?.filter(e => e.Estado === 'STOCK')
                    .reduce((acc, e) => acc + (e.Can_Inicial - e.Can_Salida), 0) || 0;
            },
            sortable: true,
            width: "140px",
            cell: row => {
                const totalFisico = row.entradas
                    ?.filter(e => e.Estado === 'STOCK')
                    .reduce((acc, e) => acc + (e.Can_Inicial - e.Can_Salida), 0) || 0;
                
                return (
                    <button
                        className="tw-px-3 tw-py-1 tw-bg-primario-900 tw-text-white tw-text-sm tw-font-bold tw-rounded-lg hover:tw-bg-primario-700 tw-transition-colors tw-shadow-sm"
                        onClick={() => { setTipoDetalle('disponible'); setInsumoDetalle(row); setShowModalLotes(true); }}
                    >
                        {totalFisico}
                    </button>
                );
            }
        },
        {
            name: "En Solicitud",
            width: "120px",
            cell: row => {
                const { acumuladoSolicitado, listaParaModal } = obtenerConteoYLista(row.Id_Insumos);
                return (
                    <button 
                        className="tw-px-3 tw-py-1 tw-bg-amber-100 tw-text-amber-700 tw-text-sm tw-font-bold tw-rounded-lg hover:tw-bg-amber-200 tw-transition-colors"
                        onClick={() => {
                            setInsumoSolicitudDetalle({ nombre: row.Nom_Insumo, datos: listaParaModal });
                            setShowModalSolicitudes(true);
                        }}
                    >
                        {acumuladoSolicitado}
                    </button>
                );
            }
        },
        {
            name: "Historial",
            width: "80px",
            center: true,
            cell: row => (
                <button
                    title="Ver lotes consumidos"
                    className="tw-p-2 tw-rounded-lg tw-text-slate-400 hover:tw-bg-slate-100 hover:tw-text-slate-600 tw-transition-all"
                    onClick={() => setVistaDetalle(row)}
                >
                    <History className="tw-w-4 tw-h-4" />
                </button>
            )
        },
        {
            name: "Acciones",
            right: true,
            width: "100px",
            cell: row => (
                <div className="tw-flex tw-gap-2">
                    <button
                        title="Editar"
                        className="tw-p-1.5 tw-rounded-lg tw-bg-primario-900 tw-text-white hover:tw-bg-primario-700 tw-transition-all tw-duration-200 tw-shadow-sm"
                        onClick={() => {
                            setInsumoEditando(row)
                            setShowModalForm(true)
                        }}
                    >
                        <Pencil className="tw-w-3.5 tw-h-3.5" />
                    </button>
                    <button
                        title="Eliminar"
                        className="tw-p-1.5 tw-rounded-lg tw-bg-red-50 tw-text-red-500 hover:tw-bg-red-500 hover:tw-text-white tw-transition-all tw-duration-200 tw-shadow-sm"
                        onClick={() => eliminarInsumo(row.Id_Insumos, row.Nom_Insumo)}
                    >
                        <Trash2 className="tw-w-3.5 tw-h-3.5" />
                    </button>
                </div>
            )
        }
    ];

    const filteredInsumos = insumos.filter(insumo => {
        const textToSearch = filterText.toLowerCase();
        return insumo.Nom_Insumo?.toLowerCase().includes(textToSearch) || insumo.Tip_Insumo?.toLowerCase().includes(textToSearch);
    });

    const hideModal = () => {
        setShowModalForm(false);
        setInsumoEditando(null);
        getAllInsumos();
    };

    // Estilos personalizados para DataTable
    const customStyles = {
        headRow: {
            style: {
                backgroundColor: '#1e3a5f',
                borderRadius: '12px 12px 0 0',
            },
        },
        headCells: {
            style: {
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                paddingTop: '16px',
                paddingBottom: '16px',
            },
        },
        rows: {
            style: {
                borderRadius: '8px',
                marginTop: '4px',
                marginBottom: '4px',
                '&:hover': {
                    backgroundColor: '#fef3c7',
                },
            },
        },
        pagination: {
            style: {
                borderTop: '1px solid #e2e8f0',
                paddingTop: '12px',
                paddingBottom: '12px',
            },
        },
    }

    return (
        <div className="tw-min-h-screen tw-bg-gradient-to-br tw-from-slate-50 tw-to-blue-50 tw-p-6">
            <div className="tw-max-w-7xl tw-mx-auto">
                {/* Header */}
                <div className="tw-mb-8">
                    <div className="tw-flex tw-items-center tw-justify-between">
                        <div className="tw-flex tw-items-center tw-gap-3">
                            <div className="tw-w-10 tw-h-10 tw-bg-primario-900 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-shadow-lg">
                                <Package className="tw-w-5 tw-h-5 tw-text-secundario-400" />
                            </div>
                            <div>
                                <h1 className="tw-text-2xl tw-font-bold tw-text-slate-800 tw-m-0">Gestión de Insumos</h1>
                                <p className="tw-text-slate-500 tw-text-sm tw-m-0">Control de stock, lotes y requerimientos activos</p>
                            </div>
                        </div>
                        
                        {!vistaDetalle && (
                            <button 
                                type="button" 
                                className="tw-px-5 tw-py-2.5 tw-bg-primario-900 hover:tw-bg-primario-700 tw-text-white tw-font-medium tw-rounded-xl tw-shadow-md hover:tw-shadow-lg tw-transition-all tw-duration-200 tw-flex tw-items-center tw-gap-2"
                                onClick={() => { setInsumoEditando(null); setShowModalForm(true); }}
                            >
                                <Plus className="tw-w-4 tw-h-4" />
                                <span>Nuevo Insumo</span>
                            </button>
                        )}
                    </div>
                </div>

                {!vistaDetalle ? (
                    <>
                        {/* Barra de búsqueda */}
                        <div className="tw-bg-white tw-rounded-2xl tw-shadow-sm tw-p-4 tw-mb-6">
                            <div className="tw-relative tw-w-full md:tw-w-96">
                                <Search className="tw-absolute tw-left-3 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-slate-400" />
                                <input 
                                    className="tw-w-full tw-pl-10 tw-pr-4 tw-py-2.5 tw-border tw-border-slate-200 tw-rounded-xl tw-bg-slate-50 tw-text-slate-700 tw-placeholder-slate-400 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-primario-500/20 focus:tw-border-primario-500 tw-transition-all" 
                                    placeholder="Buscar por nombre o tipo..." 
                                    value={filterText} 
                                    onChange={(e) => setFilterText(e.target.value)} 
                                />
                            </div>
                        </div>

                        {/* Tabla principal */}
                        <div className="tw-bg-white tw-rounded-2xl tw-shadow-lg tw-overflow-hidden">
                            <DataTable 
                                columns={columns} 
                                data={filteredInsumos} 
                                keyField="Id_Insumos" 
                                pagination 
                                highlightOnHover 
                                responsive 
                                customStyles={customStyles}
                                progressPending={loading}
                                progressComponent={
                                    <div className="tw-py-12 tw-text-center">
                                        <div className="tw-inline-block tw-w-8 tw-h-8 tw-border-4 tw-border-slate-200 tw-border-t-primario-900 tw-rounded-full tw-animate-spin"></div>
                                        <p className="tw-mt-3 tw-text-slate-500">Cargando insumos...</p>
                                    </div>
                                }
                                noDataComponent={
                                    <div className="tw-py-12 tw-text-center">
                                        <Inbox className="tw-w-12 tw-h-12 tw-text-slate-300 tw-mx-auto tw-mb-3" />
                                        <p className="tw-text-slate-400">No se encontraron insumos</p>
                                    </div>
                                }
                            />
                        </div>
                    </>
                ) : (
                    <div className="tw-bg-white tw-rounded-2xl tw-shadow-lg tw-border tw-border-slate-100 tw-overflow-hidden tw-animate-in tw-fade-in tw-slide-in-from-bottom-4">
                        <div className="tw-bg-slate-900 tw-px-6 tw-py-4 tw-flex tw-justify-between tw-items-center">
                            <div className="tw-flex tw-items-center tw-gap-3">
                                <div className="tw-w-8 tw-h-8 tw-bg-white/10 tw-rounded-lg tw-flex tw-items-center tw-justify-center">
                                    <History className="tw-text-secundario-400 tw-w-5 tw-h-5" />
                                </div>
                                <h2 className="tw-text-lg tw-font-semibold tw-text-white tw-m-0">
                                    Lotes consumidos: <span className="tw-text-secundario-400">{vistaDetalle.Nom_Insumo}</span>
                                </h2>
                            </div>
                            <button 
                                className="tw-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1.5 tw-bg-white/10 tw-text-white tw-text-sm tw-rounded-lg hover:tw-bg-white/20 tw-transition-colors"
                                onClick={() => setVistaDetalle(null)}
                            >
                                <ArrowLeft className="tw-w-4 tw-h-4" />
                                Volver
                            </button>
                        </div>
                        <div className="tw-p-6">
                            {vistaDetalle.entradas?.filter(e => e.Estado !== 'STOCK').length === 0 ? (
                                <div className="tw-py-12 tw-text-center tw-bg-slate-50 tw-rounded-xl tw-border tw-border-dashed tw-border-slate-200">
                                    <CheckCircle2 className="tw-w-12 tw-h-12 tw-text-slate-300 tw-mx-auto tw-mb-3" />
                                    <p className="tw-text-slate-500">No hay registros de lotes agotados o vencidos.</p>
                                </div>
                            ) : (
                                <div className="tw-overflow-x-auto">
                                    <table className="tw-w-full tw-text-sm tw-text-left">
                                        <thead className="tw-bg-slate-50 tw-text-slate-600 tw-uppercase tw-text-xs">
                                            <tr>
                                                <th className="tw-px-4 tw-py-3 tw-rounded-l-lg">ID</th>
                                                <th className="tw-px-4 tw-py-3">Lote</th>
                                                <th className="tw-px-4 tw-py-3">Cant. Restante</th>
                                                <th className="tw-px-4 tw-py-3">Vencimiento</th>
                                                <th className="tw-px-4 tw-py-3 tw-rounded-r-lg">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="tw-divide-y tw-divide-slate-100">
                                            {vistaDetalle.entradas.filter(e => e.Estado !== 'STOCK').map(l => (
                                                <tr key={l.Id_Entradas} className="hover:tw-bg-slate-50 tw-transition-colors">
                                                    <td className="tw-px-4 tw-py-3 tw-font-mono tw-text-slate-400">#{l.Id_Entradas}</td>
                                                    <td className="tw-px-4 tw-py-3 tw-font-medium">{l.Lote}</td>
                                                    <td className="tw-px-4 tw-py-3">{l.Can_Inicial - l.Can_Salida}</td>
                                                    <td className="tw-px-4 tw-py-3">{l.Fec_Ven_Entrada ? new Date(l.Fec_Ven_Entrada).toLocaleDateString() : 'N/A'}</td>
                                                    <td className="tw-px-4 tw-py-3">
                                                        <span className={`tw-px-2 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium ${
                                                            l.Estado === 'AGOTADO' ? 'tw-bg-red-100 tw-text-red-700' : 'tw-bg-amber-100 tw-text-amber-700'
                                                        }`}>
                                                            {l.Estado}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* MODAL FORMULARIO */}
                {showModalForm && (
                    <div className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-4 tw-bg-black/50 tw-backdrop-blur-sm">
                        <div className="tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-md tw-overflow-hidden tw-animate-in tw-fade-in tw-zoom-in-95">
                            <div className="tw-bg-primario-900 tw-px-6 tw-py-4 tw-flex tw-justify-between tw-items-center">
                                <div className="tw-flex tw-items-center tw-gap-3">
                                    <div className="tw-w-8 tw-h-8 tw-bg-white/20 tw-rounded-lg tw-flex tw-items-center tw-justify-center">
                                        <Plus className="tw-text-white tw-w-5 tw-h-5" />
                                    </div>
                                    <h5 className="tw-text-white tw-font-semibold tw-m-0">
                                        {insumoEditando ? 'Editar Insumo' : 'Nuevo Insumo'}
                                    </h5>
                                </div>
                                <button onClick={hideModal} className="tw-text-white/70 hover:tw-text-white"><X className="tw-w-6 tw-h-6" /></button>
                            </div>
                            <div className="tw-p-6">
                                <InsumosForm hideModal={hideModal} insumoParaEditar={insumoEditando} />
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL SOLICITUDES PENDIENTES */}
                {showModalSolicitudes && (
                    <div className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-4 tw-bg-black/50 tw-backdrop-blur-sm">
                        <div className="tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-2xl tw-overflow-hidden">
                            <div className="tw-bg-slate-900 tw-px-6 tw-py-4 tw-flex tw-justify-between tw-items-center">
                                <div className="tw-flex tw-items-center tw-gap-3">
                                    <ClipboardList className="tw-text-secundario-400 tw-w-5 tw-h-5" />
                                    <h5 className="tw-text-white tw-font-semibold tw-m-0">
                                        Pendientes: {insumoSolicitudDetalle?.nombre}
                                    </h5>
                                </div>
                                <button onClick={() => setShowModalSolicitudes(false)} className="tw-text-white/70 hover:tw-text-white"><X className="tw-w-6 tw-h-6" /></button>
                            </div>
                            <div className="tw-p-6">
                                {insumoSolicitudDetalle?.datos.length > 0 ? (
                                    <div className="tw-overflow-x-auto">
                                        <table className="tw-w-full tw-text-sm">
                                            <thead>
                                                <tr className="tw-bg-slate-50 tw-text-slate-500 tw-text-left">
                                                    <th className="tw-px-4 tw-py-2 tw-rounded-l-lg"># Solicitud</th>
                                                    <th className="tw-px-4 tw-py-2">Cantidad</th>
                                                    <th className="tw-px-4 tw-py-2">Responsable</th>
                                                    <th className="tw-px-4 tw-py-2 tw-rounded-r-lg">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="tw-divide-y tw-divide-slate-100">
                                                {insumoSolicitudDetalle.datos.map((s, i) => (
                                                    <tr key={i}>
                                                        <td className="tw-px-4 tw-py-3 tw-font-mono tw-text-slate-400">#{s.id}</td>
                                                        <td className="tw-px-4 tw-py-3 tw-font-bold tw-text-primario-900">{s.cantidad}</td>
                                                        <td className="tw-px-4 tw-py-3 tw-text-slate-600">{s.responsable}</td>
                                                        <td className="tw-px-4 tw-py-3">
                                                            <span className="tw-px-2 tw-py-0.5 tw-bg-blue-50 tw-text-blue-600 tw-rounded-full tw-text-xs tw-font-medium">
                                                                {s.estado}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="tw-p-8 tw-text-center tw-bg-slate-50 tw-rounded-xl tw-border tw-border-dashed tw-border-slate-200">
                                        <AlertCircle className="tw-w-10 tw-h-10 tw-text-slate-300 tw-mx-auto tw-mb-2" />
                                        <p className="tw-text-slate-500 tw-m-0">No hay solicitudes activas para este insumo.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL DETALLE LOTES (STOCK) */}
                {showModalLotes && (
                    <div className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-4 tw-bg-black/50 tw-backdrop-blur-sm">
                        <div className="tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-2xl tw-overflow-hidden">
                            <div className="tw-bg-primario-900 tw-px-6 tw-py-4 tw-flex tw-justify-between tw-items-center">
                                <div className="tw-flex tw-items-center tw-gap-3">
                                    <Boxes className="tw-text-secundario-400 tw-w-5 tw-h-5" />
                                    <h5 className="tw-text-white tw-font-semibold tw-m-0">
                                        Lotes en Stock: {insumoDetalle?.Nom_Insumo}
                                    </h5>
                                </div>
                                <button onClick={() => setShowModalLotes(false)} className="tw-text-white/70 hover:tw-text-white"><X className="tw-w-6 tw-h-6" /></button>
                            </div>
                            <div className="tw-p-6">
                                {insumoDetalle?.entradas?.filter(ent => ent.Estado === 'STOCK').length > 0 ? (
                                    <div className="tw-overflow-x-auto">
                                        <table className="tw-w-full tw-text-sm">
                                            <thead>
                                                <tr className="tw-bg-slate-50 tw-text-slate-500 tw-text-left">
                                                    <th className="tw-px-4 tw-py-2 tw-rounded-l-lg">ID</th>
                                                    <th className="tw-px-4 tw-py-2">Lote</th>
                                                    <th className="tw-px-4 tw-py-2">Disponible</th>
                                                    <th className="tw-px-4 tw-py-2">Vencimiento</th>
                                                    <th className="tw-px-4 tw-py-2 tw-rounded-r-lg">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="tw-divide-y tw-divide-slate-100">
                                                {insumoDetalle.entradas.filter(ent => ent.Estado === 'STOCK').map(ent => (
                                                    <tr key={ent.Id_Entradas}>
                                                        <td className="tw-px-4 tw-py-3 tw-font-mono tw-text-slate-400">#{ent.Id_Entradas}</td>
                                                        <td className="tw-px-4 tw-py-3 tw-font-medium">{ent.Lote}</td>
                                                        <td className="tw-px-4 tw-py-3 tw-font-bold tw-text-green-600">{ent.Can_Inicial - ent.Can_Salida}</td>
                                                        <td className="tw-px-4 tw-py-3">{ent.Fec_Ven_Entrada ? new Date(ent.Fec_Ven_Entrada).toLocaleDateString() : 'N/A'}</td>
                                                        <td className="tw-px-4 tw-py-3">
                                                            <span className="tw-px-2 tw-py-0.5 tw-bg-green-100 tw-text-green-700 tw-rounded-full tw-text-xs tw-font-medium">Stock</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="tw-p-8 tw-text-center tw-bg-slate-50 tw-rounded-xl tw-border tw-border-dashed tw-border-slate-200">
                                        <AlertCircle className="tw-w-10 tw-h-10 tw-text-slate-300 tw-mx-auto tw-mb-2" />
                                        <p className="tw-text-slate-500 tw-m-0">No hay lotes disponibles para este insumo.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CrudInsumos;