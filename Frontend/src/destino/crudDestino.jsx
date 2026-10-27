import { useState, useEffect } from "react"
import apiAxios from '../api/axiosConfig.js'
import DataTable from 'react-data-table-component'
import DestinoForm from "./destinoForm.jsx"
import Swal from "sweetalert2"
import {
    MapPin, Utensils, Hash, Type,
    Plus, Search, Pencil, ToggleLeft, ToggleRight, X, Inbox
} from "lucide-react"

const CrudDestino = () => {
    //Crear una prop para guardar los datos de la consulta
    const [destino, setdestino] = useState([])
    const [filterText, setFilterText] = useState("")
    const [destinoSeleccionado, setDestinoSeleccionado] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)


    const columnsTable = [
        {
            name: 'ID',
            selector: row => row.Id_Destino,
            width: "80px",
            cell: row => <span className="tw-font-mono tw-text-slate-500">#{row.Id_Destino}</span>
        },
        {
            name: 'Nombre Destino',
            selector: row => row.Nom_Destino,
            sortable: true,
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-3">
                    <div className="tw-w-8 tw-h-8 tw-bg-blue-100 tw-rounded-lg tw-flex tw-items-center tw-justify-center">
                        <MapPin className="tw-w-4 tw-h-4 tw-text-blue-600" />
                    </div>
                    <span className="tw-font-medium tw-text-slate-700">{row.Nom_Destino}</span>
                </div>
            )
        },
        {
            name: 'Tipo Destino',
            selector: row => row.Tip_Destino,
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-2">
                    <Type className="tw-w-3.5 tw-h-3.5 tw-text-slate-400" />
                    <span className="tw-text-slate-600">{row.Tip_Destino}</span>
                </div>
            )
        },
        {
            name: "Estado",
            selector: row => row.Estado || 'ACTIVO',
            sortable: true,
            cell: row => (
                <span className={`tw-px-2.5 tw-py-1 tw-rounded-full tw-text-xs tw-font-bold ${(row.Estado || 'ACTIVO') === 'ACTIVO'
                        ? 'tw-bg-emerald-100 tw-text-emerald-800'
                        : 'tw-bg-rose-100 tw-text-rose-800'
                    }`}>
                    {row.Estado || 'ACTIVO'}
                </span>
            )
        },
        {
            name: 'Acciones',
            right: true,
            width: "120px",
            cell: row => {
                const isActivo = (row.Estado || 'ACTIVO') === 'ACTIVO';
                return (
                    <div className="tw-flex tw-gap-2">
                        <button
                            title={isActivo ? "Editar" : "No se puede editar un registro inactivo"}
                            className={`tw-p-1.5 tw-rounded-lg tw-transition-all tw-duration-200 tw-shadow-sm ${isActivo
                                    ? "tw-bg-primario-900 tw-text-white hover:tw-bg-primario-700"
                                    : "tw-bg-slate-200 tw-text-slate-400 tw-cursor-not-allowed"
                                }`}
                            onClick={() => {
                                if (!isActivo) {
                                    Swal.fire("Edición Bloqueada", "No se puede editar un destino que se encuentra INACTIVO. Actívelo primero para poder editarlo.", "info");
                                    return;
                                }
                                setDestinoSeleccionado(row)
                                setShowModal(true)
                            }}
                        >
                            <Pencil className="tw-w-3.5 tw-h-3.5" />
                        </button>
                        <button
                            title={isActivo ? "Inactivar Destino" : "Activar Destino"}
                            className={`tw-p-1.5 tw-rounded-lg tw-transition-all tw-duration-200 tw-shadow-sm ${isActivo
                                    ? "tw-bg-amber-50 tw-text-amber-600 hover:tw-bg-amber-600 hover:tw-text-white"
                                    : "tw-bg-emerald-50 tw-text-emerald-600 hover:tw-bg-emerald-600 hover:tw-text-white"
                                }`}
                            onClick={() => toggleEstadoDestino(row)}
                        >
                            {isActivo ? <ToggleRight className="tw-w-4 tw-h-4" /> : <ToggleLeft className="tw-w-4 tw-h-4" />}
                        </button>
                    </div>
                );
            }
        }
    ]

    useEffect(() => {
        getAlldestino()
    }, [])

    //Crear una función para la consulta
    const toggleEstadoDestino = async (row) => {
        const isActivo = (row.Estado || 'ACTIVO') === 'ACTIVO';
        const accion = isActivo ? "Inactivar" : "Activar";
        const confirm = await Swal.fire({
            title: `¿${accion} destino?`,
            text: isActivo
                ? "El destino pasará a estado INACTIVO (no se mostrará para nuevas solicitudes de insumos)"
                : "El destino pasará a estado ACTIVO",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: `Sí, ${accion.toLowerCase()}`,
            cancelButtonText: "Cancelar",
            confirmButtonColor: isActivo ? "#f59e0b" : "#10b981",
            cancelButtonColor: "#153753",
        })

        if (confirm.isConfirmed) {
            try {
                await apiAxios.delete(`/api/destino/${row.Id_Destino}`)
                Swal.fire({
                    title: "Completado",
                    text: `El destino ahora está ${isActivo ? 'INACTIVO' : 'ACTIVO'}`,
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                })
                getAlldestino()
            } catch (error) {
                Swal.fire("Error", error.response?.data?.message || "No se pudo cambiar el estado del destino", "error")
            }
        }
    }

    const getAlldestino = async () => {
        setLoading(true)
        try {
            const response = await apiAxios.get('/api/destino/')
            setdestino(Array.isArray(response.data) ? response.data : [])
        } catch (error) {
            console.error("Error al cargar destinos:", error)
        } finally {
            setLoading(false)
        }
    }

    const newListdestino = destino.filter(item => {
        const textToSearch = filterText.toLowerCase()
        const nombre = item.Nom_Destino?.toLowerCase() || ""
        const tipo = item.Tip_Destino?.toLowerCase() || ""
        const id = item.Id_Destino?.toString() || ""
        return nombre.includes(textToSearch) || tipo.includes(textToSearch) || id.includes(textToSearch)
    })

    const hideModal = () => {
        setShowModal(false)
        setDestinoSeleccionado(null)
        getAlldestino()
    }

    // Estilos personalizados para DataTable
    const customStyles = {
        headRow: {
            style: {
                backgroundColor: '#153753',
                borderRadius: '12px 12px 0 0',
                minHeight: '48px',
            },
        },
        headCells: {
            style: {
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                paddingTop: '12px',
                paddingBottom: '12px',
            },
        },
        rows: {
            style: {
                minHeight: '52px',
                borderBottom: '1px solid #f1f5f9',
                fontSize: '13px',
                transition: 'background-color 0.15s ease',
            },
            highlightOnHoverStyle: {
                backgroundColor: '#f0f7ff',
                borderBottomColor: '#dbeafe',
                outline: 'none',
            },
        },
        pagination: {
            style: {
                borderTop: '1px solid #e2e8f0',
                paddingTop: '12px',
                paddingBottom: '12px',
                fontSize: '13px',
            },
        },
    }

    const totalActivos = destino.filter(d => (d.Estado || 'ACTIVO') === 'ACTIVO').length;
    const totalInactivos = destino.filter(d => d.Estado === 'INACTIVO').length;

    return (
        <div className="tw-min-h-screen tw-bg-slate-50/50 tw-p-6">
            <div className="tw-max-w-7xl tw-mx-auto">
                {/* Header */}
                <div className="tw-mb-6">
                    <div className="tw-flex tw-items-center tw-gap-3 tw-mb-2">
                        <div className="tw-w-10 tw-h-10 tw-bg-primario-900 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-shadow-md">
                            <MapPin className="tw-w-5 tw-h-5 tw-text-secundario-400" />
                        </div>
                        <div>
                            <h1 className="tw-text-2xl tw-font-bold tw-text-slate-800 tw-m-0">Gestión de Destinos</h1>
                            <p className="tw-text-slate-500 tw-text-sm tw-m-0">Administra los lugares de destino, talleres y áreas de producción</p>
                        </div>
                    </div>
                </div>

                {/* Métricas / KPIs rápidos */}
                <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-3 tw-gap-4 tw-mb-6">
                    <div className="tw-bg-white tw-rounded-2xl tw-p-4 tw-border tw-border-slate-200/80 tw-shadow-sm tw-flex tw-items-center tw-justify-between">
                        <div>
                            <p className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-wider tw-m-0">Total Destinos</p>
                            <h3 className="tw-text-2xl tw-font-bold tw-text-slate-800 tw-mt-1 tw-m-0">{destino.length}</h3>
                        </div>
                        <div className="tw-w-10 tw-h-10 tw-rounded-xl tw-bg-primario-50 tw-flex tw-items-center tw-justify-center">
                            <MapPin className="tw-w-5 tw-h-5 tw-text-primario-900" />
                        </div>
                    </div>
                    <div className="tw-bg-white tw-rounded-2xl tw-p-4 tw-border tw-border-slate-200/80 tw-shadow-sm tw-flex tw-items-center tw-justify-between">
                        <div>
                            <p className="tw-text-xs tw-font-semibold tw-text-emerald-600 tw-uppercase tw-tracking-wider tw-m-0">Destinos Activos</p>
                            <h3 className="tw-text-2xl tw-font-bold tw-text-emerald-700 tw-mt-1 tw-m-0">{totalActivos}</h3>
                        </div>
                        <div className="tw-w-10 tw-h-10 tw-rounded-xl tw-bg-emerald-50 tw-flex tw-items-center tw-justify-center">
                            <MapPin className="tw-w-5 tw-h-5 tw-text-emerald-600" />
                        </div>
                    </div>
                    <div className="tw-bg-white tw-rounded-2xl tw-p-4 tw-border tw-border-slate-200/80 tw-shadow-sm tw-flex tw-items-center tw-justify-between">
                        <div>
                            <p className="tw-text-xs tw-font-semibold tw-text-rose-500 tw-uppercase tw-tracking-wider tw-m-0">Destinos Inactivos</p>
                            <h3 className="tw-text-2xl tw-font-bold tw-text-rose-700 tw-mt-1 tw-m-0">{totalInactivos}</h3>
                        </div>
                        <div className="tw-w-10 tw-h-10 tw-rounded-xl tw-bg-rose-50 tw-flex tw-items-center tw-justify-center">
                            <ToggleLeft className="tw-w-5 tw-h-5 tw-text-rose-600" />
                        </div>
                    </div>
                </div>

                {/* Barra de herramientas */}
                <div className="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200/80 tw-shadow-sm tw-p-4 tw-mb-6">
                    <div className="tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-center tw-gap-4">
                        <div className="tw-relative tw-w-full md:tw-w-96">
                            <Search className="tw-absolute tw-left-3 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-slate-400" />
                            <input
                                type="text"
                                className="tw-w-full tw-pl-10 tw-pr-9 tw-py-2.5 tw-border tw-border-slate-200 tw-rounded-xl tw-bg-slate-50 tw-text-slate-700 tw-placeholder-slate-400 focus:tw-bg-white focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-primario-500/20 focus:tw-border-primario-500 tw-transition-all"
                                placeholder="Buscar por nombre, tipo o código..."
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                            />
                            {filterText && (
                                <button
                                    type="button"
                                    onClick={() => setFilterText('')}
                                    className="tw-absolute tw-right-2.5 tw-top-1/2 -tw-translate-y-1/2 tw-text-slate-400 hover:tw-text-slate-600 tw-p-1 tw-rounded-full hover:tw-bg-slate-200/50 tw-transition-colors"
                                    title="Limpiar búsqueda"
                                >
                                    <X className="tw-w-4 tw-h-4" />
                                </button>
                            )}
                        </div>
                        <button
                            type="button"
                            className="tw-px-5 tw-py-2.5 tw-bg-primario-900 hover:tw-bg-primario-700 tw-text-white tw-font-semibold tw-rounded-xl tw-shadow-sm hover:tw-shadow tw-transition-all tw-duration-200 tw-flex tw-items-center tw-gap-2"
                            onClick={() => {
                                setDestinoSeleccionado(null)
                                setShowModal(true)
                            }}
                        >
                            <Plus className="tw-w-4 tw-h-4" />
                            <span>Nuevo Destino</span>
                        </button>
                    </div>
                </div>

                {/* Tabla de datos */}
                <div className="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200/80 tw-shadow-sm tw-overflow-hidden">
                    <DataTable
                        columns={columnsTable}
                        data={newListdestino}
                        keyField="Id_Destino"
                        pagination
                        paginationPerPage={10}
                        paginationRowsPerPageOptions={[5, 10, 15, 25]}
                        highlightOnHover
                        responsive
                        customStyles={customStyles}
                        progressPending={loading}
                        progressComponent={
                            <div className="tw-py-12 tw-text-center">
                                <div className="tw-inline-block tw-w-8 tw-h-8 tw-border-4 tw-border-primario-200 tw-border-t-primario-900 tw-rounded-full tw-animate-spin"></div>
                                <p className="tw-mt-3 tw-text-slate-500">Cargando destinos...</p>
                            </div>
                        }
                        noDataComponent={
                            <div className="tw-py-12 tw-text-center">
                                <Inbox className="tw-w-12 tw-h-12 tw-text-slate-300 tw-mx-auto tw-mb-3" />
                                <p className="tw-text-slate-400">No se encontraron destinos</p>
                            </div>
                        }
                    />
                </div>

                {/* Información de registros */}
                <div className="tw-mt-3 tw-text-right">
                    <p className="tw-text-xs tw-text-slate-400">
                        Mostrando {newListdestino.length} de {destino.length} destinos
                    </p>
                </div>

                {/* Modal Custom Tailwind */}
                {showModal && (
                    <div
                        className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-4 tw-bg-black/50 tw-backdrop-blur-sm"
                        onClick={(e) => e.target === e.currentTarget && hideModal()}
                    >
                        <div className="tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-md tw-overflow-hidden tw-animate-in tw-fade-in tw-zoom-in-95 tw-duration-200">
                            {/* Modal Header */}
                            <div className="tw-bg-primario-900 tw-px-6 tw-py-4">
                                <div className="tw-flex tw-justify-between tw-items-center">
                                    <div className="tw-flex tw-items-center tw-gap-3">
                                        <div className="tw-w-8 tw-h-8 tw-bg-white/20 tw-rounded-lg tw-flex tw-items-center tw-justify-center">
                                            <MapPin className="tw-w-5 tw-h-5 tw-text-secundario-400" />
                                        </div>
                                        <h5 className="tw-text-white tw-font-semibold tw-text-lg tw-m-0">
                                            {destinoSeleccionado ? 'Editar Destino' : 'Nuevo Destino'}
                                        </h5>
                                    </div>
                                    <button
                                        type="button"
                                        className="tw-text-white/70 hover:tw-text-white tw-transition-colors"
                                        onClick={hideModal}
                                    >
                                        <X className="tw-w-6 tw-h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="tw-p-6">
                                <DestinoForm
                                    hideModal={hideModal}
                                    destinoSeleccionado={destinoSeleccionado}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CrudDestino
