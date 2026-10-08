import { useState, useEffect } from 'react';
import apiAxios from '../api/axiosConfig.js';
import DataTable from 'react-data-table-component';
import PerdidasForm from './PerdidasForm.jsx';
import Swal from 'sweetalert2';
import {
    PackageX, Search, Plus, RefreshCw, Eye, Pen,
    Trash2, X, FileText, AlertCircle, Inbox, TrendingDown
} from 'lucide-react';

const PerdidasCrud = () => {
    const [perdidas, setPerdidas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterText, setFilterText] = useState('');
    const [error, setError] = useState(null);
    const [cargandoVencidos, setCargandoVencidos] = useState(false);
    const [selectedObservacion, setSelectedObservacion] = useState(null);
    const [showModalForm, setShowModalForm] = useState(false);
    const [perdidaSeleccionada, setPerdidaSeleccionada] = useState(null);

    useEffect(() => {
        fetchPerdidas();
    }, []);

    const fetchPerdidas = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiAxios.get('/api/perdidas');
            setPerdidas(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error('Error al cargar pérdidas:', err);
            setError('Error al cargar los reportes de pérdida');
        } finally {
            setLoading(false);
        }
    };

    const handleCargarVencidos = async () => {
        setCargandoVencidos(true);
        try {
            const currentUser = JSON.parse(localStorage.getItem('userFoodStocker') || '{}');
            const response = await apiAxios.post('/api/perdidas/cargar-vencidos', {
                Id_Responsable: currentUser.id
            });
            Swal.fire({
                icon: 'success',
                title: 'Insumos Vencidos Procesados',
                text: response.data.mensaje || 'Se han procesado los insumos vencidos correctamente.',
                confirmButtonColor: '#153753'
            });
            fetchPerdidas();
        } catch (err) {
            console.error('Error al cargar insumos vencidos:', err);
            Swal.fire({
                title: 'Error',
                text: err.response?.data?.mensaje || 'No se pudieron cargar los insumos vencidos.',
                icon: 'error',
                confirmButtonColor: '#153753'
            });
        } finally {
            setCargandoVencidos(false);
        }
    };

    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará el reporte de pérdida permanentemente y restituirá el stock en el inventario.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#153753'
        });

        if (confirm.isConfirmed) {
            try {
                await apiAxios.delete(`/api/perdidas/${id}`);
                Swal.fire({
                    title: 'Eliminado',
                    text: 'El reporte de pérdida ha sido eliminado correctamente.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                fetchPerdidas();
            } catch (err) {
                console.error('Error eliminando pérdida:', err);
                Swal.fire({
                    title: 'Error',
                    text: err.response?.data?.mensaje || 'No se pudo eliminar el reporte de pérdida.',
                    icon: 'error',
                    confirmButtonColor: '#153753'
                });
            }
        }
    };

    const hideModalForm = () => {
        setShowModalForm(false);
        setPerdidaSeleccionada(null);
        fetchPerdidas();
    };

    const columnsTable = [
        {
            name: "ID",
            selector: row => row.Id_Perdida,
            sortable: true,
            width: "75px",
            cell: row => (
                <span className="tw-font-mono tw-text-slate-500 tw-text-xs">
                    #{row.Id_Perdida}
                </span>
            )
        },
        {
            name: "Fecha",
            selector: row => row.createdAt,
            sortable: true,
            width: "120px",
            cell: row => {
                if (!row.createdAt) return <span className="tw-text-slate-400 tw-text-xs">N/A</span>;
                const fecha = new Date(row.createdAt);
                const fechaStr = fecha.toLocaleDateString("es-CO", {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
                return (
                    <span className="tw-text-slate-600 tw-text-xs tw-font-medium">
                        {fechaStr}
                    </span>
                );
            }
        },
        {
            name: "Insumo",
            selector: row => row.insumo?.Nom_Insumo || `ID ${row.Id_Insumo}`,
            sortable: true,
            cell: row => (
                <span className="tw-font-medium tw-text-slate-800">
                    {row.insumo?.Nom_Insumo || `Insumo #${row.Id_Insumo}`}
                </span>
            )
        },
        {
            name: "Lote",
            selector: row => row.entrada?.Lote || "—",
            sortable: true,
            width: "130px",
            cell: row => (
                row.entrada?.Lote ? (
                    <span className="tw-font-medium tw-text-slate-700 tw-bg-slate-100 tw-px-2.5 tw-py-1 tw-rounded-md tw-border tw-border-slate-200 tw-text-xs">
                        {row.entrada.Lote}
                    </span>
                ) : (
                    <span className="tw-text-slate-400 tw-text-xs italic">—</span>
                )
            )
        },
        {
            name: "Cantidad",
            selector: row => Number(row.Cantidad),
            sortable: true,
            width: "135px",
            cell: row => (
                <span className="tw-inline-flex tw-items-center tw-gap-1 tw-px-2.5 tw-py-1 tw-rounded-full tw-bg-red-50 tw-text-red-600 tw-font-semibold tw-text-xs tw-border tw-border-red-100">
                    <TrendingDown className="tw-w-3.5 tw-h-3.5" />
                    -{row.Cantidad} {row.insumo?.Uni_medida || ''}
                </span>
            )
        },
        {
            name: "Motivo",
            selector: row => row.Motivo,
            sortable: true,
            width: "145px",
            cell: row => {
                let badgeClass = "tw-bg-slate-100 tw-text-slate-700 tw-border-slate-200";
                let label = row.Motivo;
                if (row.Motivo === 'VENCIMIENTO') {
                    badgeClass = "tw-bg-amber-50 tw-text-amber-700 tw-border-amber-200";
                    label = "Vencimiento";
                } else if (row.Motivo === 'DAÑO_FISICO') {
                    badgeClass = "tw-bg-rose-50 tw-text-rose-700 tw-border-rose-200";
                    label = "Daño Físico";
                } else if (row.Motivo === 'CONTAMINACION') {
                    badgeClass = "tw-bg-purple-50 tw-text-purple-700 tw-border-purple-200";
                    label = "Contaminación";
                } else if (row.Motivo === 'OTROS') {
                    label = "Otros";
                }
                return (
                    <span className={`tw-px-2.5 tw-py-1 tw-rounded-full tw-text-xs tw-font-semibold tw-border ${badgeClass}`}>
                        {label}
                    </span>
                );
            }
        },
        {
            name: "Responsable",
            selector: row => row.responsable?.Nom_Responsable || 'N/A',
            sortable: true,
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-2">
                    <div className="tw-w-6 tw-h-6 tw-rounded-full tw-bg-primario-100 tw-text-primario-900 tw-flex tw-items-center tw-justify-center tw-text-xs tw-font-bold">
                        {row.responsable?.Nom_Responsable?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="tw-text-slate-600 tw-text-xs tw-font-medium">
                        {row.responsable?.Nom_Responsable || 'N/A'}
                    </span>
                </div>
            )
        },
        {
            name: "Acciones",
            right: true,
            width: "130px",
            cell: row => (
                <div className="tw-flex tw-gap-1.5">
                    <button
                        title="Ver Observaciones"
                        className="tw-p-1.5 tw-rounded-lg tw-bg-blue-50 tw-text-blue-600 hover:tw-bg-blue-600 hover:tw-text-white tw-transition-all tw-duration-200 tw-shadow-sm"
                        onClick={() => setSelectedObservacion(row)}
                    >
                        <Eye className="tw-w-3.5 tw-h-3.5" />
                    </button>
                    <button
                        title="Editar"
                        className="tw-p-1.5 tw-rounded-lg tw-bg-primario-900 tw-text-white hover:tw-bg-primario-700 tw-transition-all tw-duration-200 tw-shadow-sm"
                        onClick={() => {
                            setPerdidaSeleccionada(row);
                            setShowModalForm(true);
                        }}
                    >
                        <Pen className="tw-w-3.5 tw-h-3.5" />
                    </button>
                    <button
                        title="Eliminar"
                        className="tw-p-1.5 tw-rounded-lg tw-bg-red-50 tw-text-red-500 hover:tw-bg-red-500 hover:tw-text-white tw-transition-all tw-duration-200 tw-shadow-sm"
                        onClick={() => handleDelete(row.Id_Perdida)}
                    >
                        <Trash2 className="tw-w-3.5 tw-h-3.5" />
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            button: true
        }
    ];

    const filteredPerdidas = perdidas.filter(p => {
        const textToSearch = filterText.toLowerCase();
        const insumo = p.insumo?.Nom_Insumo?.toLowerCase() || '';
        const lote = p.entrada?.Lote?.toLowerCase() || '';
        const motivo = p.Motivo?.toLowerCase() || '';
        const observaciones = p.Observaciones?.toLowerCase() || '';
        const responsable = p.responsable?.Nom_Responsable?.toLowerCase() || '';
        const id = String(p.Id_Perdida);

        return (
            insumo.includes(textToSearch) ||
            lote.includes(textToSearch) ||
            motivo.includes(textToSearch) ||
            observaciones.includes(textToSearch) ||
            responsable.includes(textToSearch) ||
            id.includes(textToSearch)
        );
    });

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
    };

    return (
        <div className="tw-min-h-screen tw-bg-gradient-to-br tw-from-slate-50 tw-to-blue-50 tw-p-6">
            <div className="tw-max-w-7xl tw-mx-auto">
                {/* Encabezado */}
                <div className="tw-mb-8">
                    <div className="tw-flex tw-items-center tw-gap-3 tw-mb-2">
                        <div className="tw-w-10 tw-h-10 tw-bg-primario-900 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-shadow-lg">
                            <PackageX className="tw-w-5 tw-h-5 tw-text-secundario-400" />
                        </div>
                        <h1 className="tw-text-2xl tw-font-bold tw-text-slate-800">
                            Gestión de Pérdidas
                        </h1>
                    </div>
                    <p className="tw-text-slate-500 tw-ml-12">
                        Administra el registro y seguimiento de mermas, vencimientos y bajas de inventario
                    </p>
                </div>

                {/* Alerta de error si existe */}
                {error && (
                    <div className="tw-mb-4 tw-p-4 tw-bg-red-50 tw-border tw-border-red-200 tw-rounded-xl tw-flex tw-items-center tw-gap-3">
                        <AlertCircle className="tw-w-5 tw-h-5 tw-text-red-500" />
                        <span className="tw-text-red-700">{error}</span>
                    </div>
                )}

                {/* Barra de Búsqueda y Botones de Acción */}
                <div className="tw-bg-white tw-rounded-2xl tw-shadow-sm tw-p-4 tw-mb-6">
                    <div className="tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-center tw-gap-4">
                        <div className="tw-relative tw-w-full md:tw-w-96">
                            <Search className="tw-absolute tw-left-3 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-slate-400" />
                            <input
                                type="text"
                                className="tw-w-full tw-pl-10 tw-pr-4 tw-py-2.5 tw-border tw-border-slate-200 tw-rounded-xl tw-bg-slate-50 tw-text-slate-700 tw-placeholder-slate-400 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-primario-500/20 focus:tw-border-primario-500 tw-transition-all"
                                placeholder="Buscar por insumo, lote, motivo o responsable..."
                                value={filterText}
                                onChange={e => setFilterText(e.target.value)}
                            />
                        </div>

                        <div className="tw-flex tw-items-center tw-gap-3 tw-w-full md:tw-w-auto">
                            {/* Botón Cargar Vencidos */}
                            <button
                                type="button"
                                onClick={handleCargarVencidos}
                                disabled={cargandoVencidos}
                                className="tw-px-4 tw-py-2.5 tw-bg-primario-900 hover:tw-bg-primario-700 tw-text-white tw-font-medium tw-rounded-xl tw-shadow-md hover:tw-shadow-lg tw-transition-all tw-duration-200 tw-flex tw-items-center tw-gap-2 disabled:tw-opacity-50"
                                title="Detectar y registrar automáticamente entradas con fecha vencida"
                            >
                                <RefreshCw className={`tw-w-4 tw-h-4 ${cargandoVencidos ? 'tw-animate-spin' : ''}`} />
                                <span>Cargar Vencidos</span>
                            </button>

                            {/* Botón Registrar Pérdida */}
                            <button
                                type="button"
                                className="tw-px-5 tw-py-2.5 tw-bg-primario-900 hover:tw-bg-primario-700 tw-text-white tw-font-medium tw-rounded-xl tw-shadow-md hover:tw-shadow-lg tw-transition-all tw-duration-200 tw-flex tw-items-center tw-gap-2"
                                onClick={() => {
                                    setPerdidaSeleccionada(null);
                                    setShowModalForm(true);
                                }}
                            >
                                <Plus className="tw-w-4 tw-h-4" />
                                <span>Nueva Pérdida</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabla de Datos */}
                <div className="tw-bg-white tw-rounded-2xl tw-shadow-lg tw-overflow-hidden">
                    <DataTable
                        columns={columnsTable}
                        data={filteredPerdidas}
                        keyField="Id_Perdida"
                        pagination
                        paginationPerPage={10}
                        paginationRowsPerPageOptions={[5, 10, 15, 25]}
                        highlightOnHover
                        pointerOnHover
                        responsive
                        customStyles={customStyles}
                        progressPending={loading}
                        progressComponent={
                            <div className="tw-py-12 tw-text-center">
                                <div className="tw-inline-block tw-w-8 tw-h-8 tw-border-4 tw-border-slate-200 tw-border-t-primario-900 tw-rounded-full tw-animate-spin"></div>
                                <p className="tw-mt-3 tw-text-slate-500">Cargando reportes...</p>
                            </div>
                        }
                        noDataComponent={
                            <div className="tw-py-12 tw-text-center">
                                <Inbox className="tw-w-12 tw-h-12 tw-text-slate-300 tw-mx-auto tw-mb-3" />
                                <p className="tw-text-slate-400">No se encontraron reportes de pérdida</p>
                            </div>
                        }
                    />
                </div>

                {/* Contador de registros */}
                <div className="tw-mt-4 tw-text-right">
                    <p className="tw-text-sm tw-text-slate-400">
                        Mostrando {filteredPerdidas.length} de {perdidas.length} reportes
                    </p>
                </div>

                {/* Modal de Nueva/Editar Pérdida */}
                {showModalForm && (
                    <div
                        className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-4 tw-bg-black/50 tw-backdrop-blur-sm"
                        onClick={(e) => e.target === e.currentTarget && hideModalForm()}
                    >
                        <div className="tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-2xl tw-overflow-hidden tw-animate-in tw-fade-in tw-zoom-in-95 tw-duration-200">
                            <div className="tw-bg-primario-900 tw-px-6 tw-py-4">
                                <div className="tw-flex tw-justify-between tw-items-center">
                                    <div className="tw-flex tw-items-center tw-gap-3">
                                        <div className="tw-w-8 tw-h-8 tw-bg-white/20 tw-rounded-lg tw-flex tw-items-center tw-justify-center">
                                            <PackageX className="tw-w-5 tw-h-5 tw-text-secundario-400" />
                                        </div>
                                        <h5 className="tw-text-white tw-font-semibold tw-text-lg tw-m-0">
                                            {perdidaSeleccionada ? 'Editar Reporte de Pérdida' : 'Nuevo Reporte de Pérdida'}
                                        </h5>
                                    </div>
                                    <button
                                        type="button"
                                        className="tw-text-white/70 hover:tw-text-white tw-transition-colors"
                                        onClick={hideModalForm}
                                    >
                                        <X className="tw-w-6 tw-h-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="tw-p-6 tw-max-h-[85vh] tw-overflow-y-auto">
                                <PerdidasForm
                                    hideModal={hideModalForm}
                                    refreshTable={fetchPerdidas}
                                    perdidaSeleccionada={perdidaSeleccionada}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Observaciones */}
                {selectedObservacion && (
                    <div
                        className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-4 tw-bg-black/50 tw-backdrop-blur-sm"
                        onClick={(e) => e.target === e.currentTarget && setSelectedObservacion(null)}
                    >
                        <div className="tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-lg tw-overflow-hidden tw-animate-in tw-fade-in tw-zoom-in-95 tw-duration-200">
                            <div className="tw-bg-primario-900 tw-px-6 tw-py-4 tw-flex tw-justify-between tw-items-center">
                                <div className="tw-flex tw-items-center tw-gap-3">
                                    <div className="tw-w-8 tw-h-8 tw-bg-white/20 tw-rounded-lg tw-flex tw-items-center tw-justify-center">
                                        <FileText className="tw-w-5 tw-h-5 tw-text-secundario-400" />
                                    </div>
                                    <h5 className="tw-text-white tw-font-semibold tw-text-lg tw-m-0">
                                        Observaciones de la Pérdida #{selectedObservacion.Id_Perdida}
                                    </h5>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedObservacion(null)}
                                    className="tw-text-white/70 hover:tw-text-white tw-transition-colors"
                                >
                                    <X className="tw-w-6 tw-h-6" />
                                </button>
                            </div>

                            <div className="tw-p-6 tw-space-y-4">
                                <div className="tw-grid tw-grid-cols-2 tw-gap-4 tw-bg-slate-50 tw-border tw-border-slate-100 tw-p-4 tw-rounded-xl">
                                    <div>
                                        <span className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-wide">Insumo</span>
                                        <p className="tw-text-sm tw-font-bold tw-text-slate-800 tw-mt-0.5">
                                            {selectedObservacion.insumo?.Nom_Insumo || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-wide">Cantidad Pérdida</span>
                                        <p className="tw-text-sm tw-font-bold tw-text-red-600 tw-mt-0.5">
                                            -{selectedObservacion.Cantidad} {selectedObservacion.insumo?.Uni_medida || ''}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-wide">Motivo</span>
                                        <p className="tw-text-sm tw-font-medium tw-text-slate-700 tw-mt-0.5">
                                            {selectedObservacion.Motivo}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-wide">Lote Afectado</span>
                                        <p className="tw-text-sm tw-font-mono tw-text-slate-700 tw-mt-0.5">
                                            {selectedObservacion.entrada?.Lote || 'Sin lote'}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="tw-block tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-wide tw-mb-2">
                                        Detalle de Observaciones
                                    </label>
                                    <div className="tw-p-4 tw-bg-amber-50/60 tw-border tw-border-amber-200/60 tw-rounded-xl tw-text-sm tw-text-slate-700 tw-leading-relaxed tw-min-h-[90px]">
                                        {selectedObservacion.Observaciones || 'Sin observaciones especificadas para este registro.'}
                                    </div>
                                </div>

                                <div className="tw-flex tw-justify-end tw-pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedObservacion(null)}
                                        className="tw-px-5 tw-py-2.5 tw-bg-primario-900 hover:tw-bg-primario-700 tw-text-white tw-font-semibold tw-rounded-xl tw-shadow-md hover:tw-shadow-lg tw-transition-all"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PerdidasCrud;
