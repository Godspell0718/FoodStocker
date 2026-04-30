import { useState, useEffect } from "react"
import apiNode from "../api/axiosConfig.js"
import DataTable from "react-data-table-component"
import { EntradasForm } from "./EntradasForm.jsx"
import { 
    Warehouse, Box, Calendar, Truck, UserRound, 
    GraduationCap, Presentation, Pen, Plus, Search, 
    Inbox, AlertCircle, X, Boxes, Trash2
} from "lucide-react"
import Swal from "sweetalert2"

export const CrudEntradas = () => {

    const [entradas, setEntradas] = useState([])
    const [filterText, setFilterText] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [entradaSeleccionada, setEntradaSeleccionada] = useState(null)
    const [showModal, setShowModal] = useState(false)

    const columnsTable = [
        {
            name: "ID",
            selector: row => row.Id_Entradas,
            sortable: true,
            width: "65px",
            cell: row => (
                <span className="tw-font-mono tw-text-slate-600">#{row.Id_Entradas}</span>
            )
        },
        {
            name: "Lote",
            selector: row => row.Lote,
            sortable: true,
            width: "150px",
            cell: row => (
                <span className="tw-font-medium tw-text-slate-700">{row.Lote}</span>
            )
        },
        {
            name: "Fecha Venc.",
            selector: row =>
                row.Fec_Ven_Entrada
                    ? new Date(row.Fec_Ven_Entrada).toLocaleDateString("es-CO")
                    : "—",
            sortable: true,
            width: "140px",
            cell: row => {
                const fechaVenc = row.Fec_Ven_Entrada ? new Date(row.Fec_Ven_Entrada) : null
                const hoy = new Date()
                const diasRestantes = fechaVenc ? Math.ceil((fechaVenc - hoy) / (1000 * 60 * 60 * 24)) : null

                let colorClase = "tw-text-slate-600"
                if (diasRestantes !== null) {
                    if (diasRestantes < 0) colorClase = "tw-text-red-600 tw-font-medium"
                    else if (diasRestantes <= 30) colorClase = "tw-text-amber-600 tw-font-medium"
                    else colorClase = "tw-text-green-600"
                }

                return (
                    <div className="tw-flex tw-items-center tw-gap-2">
                        <Calendar className={`tw-w-3.5 tw-h-3.5 ${diasRestantes !== null && diasRestantes < 0 ? 'tw-text-red-500' :
                            diasRestantes !== null && diasRestantes <= 30 ? 'tw-text-amber-500' :
                                'tw-text-slate-400'
                            }`} />
                        <span className={colorClase}>
                            {row.Fec_Ven_Entrada
                                ? new Date(row.Fec_Ven_Entrada).toLocaleDateString("es-CO")
                                : "—"}
                        </span>
                    </div>
                )
            }
        },
        {
            name: "Insumo",
            selector: row => row.insumo?.Nom_Insumo || `ID ${row.Id_Insumos}`,
            sortable: true,
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-3">
                    <div className="tw-w-8 tw-h-8 tw-bg-gradient-to-br tw-from-emerald-200 tw-to-teal-100 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                        <Box className="tw-w-4 tw-h-4 tw-text-emerald-700" />
                    </div>
                    <span className="tw-font-medium tw-text-slate-800">
                        {row.insumo?.Nom_Insumo || `Insumo #${row.Id_Insumos}`}
                    </span>
                </div>
            )
        },
        {
            name: "Unidad Med.",
            selector: row => row.Uni_medida || "—",
            sortable: true,
            width: "80px",
            cell: row => (
                <span className="tw-px-2 tw-py-1 tw-bg-slate-100 tw-rounded-lg tw-text-xs tw-font-medium tw-text-slate-600">
                    {row.Uni_medida || "—"}
                </span>
            )
        },
        {
            name: "Proveedor",
            selector: row => row.proveedor?.Nom_Proveedor || `ID ${row.Id_Proveedor}`,
            sortable: true,
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-2">
                    <Truck className="tw-w-3.5 tw-h-3.5 tw-text-blue-400" />
                    <span className="tw-text-slate-600">
                        {row.proveedor?.Nom_Proveedor || `Proveedor #${row.Id_Proveedor}`}
                    </span>
                </div>
            )
        },
        {
            name: "Cantidad",
            selector: row => `${row.Can_Inicial - row.Can_Salida} / ${row.Can_Inicial}`,
            sortable: true,
            width: "100px",
            cell: row => {
                const disponible = row.Can_Inicial - row.Can_Salida
                const porcentaje = (disponible / row.Can_Inicial) * 100

                let colorBarra = "tw-bg-green-500"
                if (porcentaje <= 25) colorBarra = "tw-bg-red-500"
                else if (porcentaje <= 50) colorBarra = "tw-bg-amber-500"

                return (
                    <div className="tw-w-full">
                        <div className="tw-flex tw-justify-between tw-text-xs tw-mb-1">
                            <span className="tw-font-medium tw-text-slate-700">{disponible}</span>
                            <span className="tw-text-slate-400">/ {row.Can_Inicial}</span>
                        </div>
                        <div className="tw-w-full tw-bg-slate-200 tw-rounded-full tw-h-1.5">
                            <div
                                className={`${colorBarra} tw-h-1.5 tw-rounded-full tw-transition-all`}
                                style={{ width: `${porcentaje}%` }}
                            ></div>
                        </div>
                    </div>
                )
            }
        },
        {
            name: "Vlr Unitario",
            selector: row => row.Vlr_Unitario ?? "—",
            sortable: true,
            width: "100px",
            cell: row => (
                <span className="tw-font-mono tw-text-slate-600">
                    ${row.Vlr_Unitario?.toLocaleString("es-CO") ?? "—"}
                </span>
            )
        },
        {
            name: "Vlr Total",
            selector: row => row.Vlr_Total ?? "—",
            sortable: true,
            width: "100px",
            cell: row => (
                <span className="tw-font-mono tw-font-medium tw-text-slate-700">
                    ${row.Vlr_Total?.toLocaleString("es-CO") ?? "—"}
                </span>
            )
        },
        {
            name: "Estado",
            sortable: true,
            width: "130px",
            cell: row => {
                const estadosConfig = {
                    STOCK: {
                        color: "tw-bg-green-100 tw-text-green-700",
                        icono: "fa-box",
                        label: "En Stock"
                    },
                    AGOTADO: {
                        color: "tw-bg-red-100 tw-text-red-700",
                        icono: "fa-box-open",
                        label: "Agotado"
                    },
                    VENCIDO: {
                        color: "tw-bg-amber-100 tw-text-amber-700",
                        icono: "fa-clock",
                        label: "Vencido"
                    }
                }
                const config = estadosConfig[row.Estado] || {
                    color: "tw-bg-slate-100 tw-text-slate-700",
                    icono: "fa-question",
                    label: row.Estado
                }

                return (
                    <span className={`tw-px-2 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium tw-flex tw-items-center tw-gap-1 tw-w-fit ${config.color}`}>
                        {row.Estado === 'VENCIDO' ? <AlertCircle className="tw-w-3 tw-h-3" /> : <Box className="tw-w-3 tw-h-3" />}
                        <span>{config.label}</span>
                    </span>
                )
            }
        },
        {
            name: "Pasante",
            selector: row => row.pasante?.Nom_Responsable || `ID ${row.Id_Pasante}`,
            sortable: true,
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-2">
                    <GraduationCap className="tw-w-3.5 tw-h-3.5 tw-text-purple-400" />
                    <span className="tw-text-slate-600">
                        {row.pasante?.Nom_Responsable || `Pasante #${row.Id_Pasante}`}
                    </span>
                </div>
            )
        },
        {
            name: "Instructor",
            selector: row => row.instructor?.Nom_Responsable || `ID ${row.Id_Instructor}`,
            sortable: true,
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-2">
                    <Presentation className="tw-w-3.5 tw-h-3.5 tw-text-indigo-400" />
                    <span className="tw-text-slate-600">
                        {row.instructor?.Nom_Responsable || `Instructor #${row.Id_Instructor}`}
                    </span>
                </div>
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
                            setEntradaSeleccionada(row)
                            setShowModal(true)
                        }}
                    >
                        <Pen className="tw-w-3.5 tw-h-3.5" />
                    </button>
                    <button
                        title="Eliminar"
                        className="tw-p-1.5 tw-rounded-lg tw-bg-red-50 tw-text-red-500 hover:tw-bg-red-500 hover:tw-text-white tw-transition-all tw-duration-200 tw-shadow-sm"
                        onClick={() => deleteEntrada(row.Id_Entradas)}
                    >
                        <Trash2 className="tw-w-3.5 tw-h-3.5" />
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            button: true
        }
    ]

    const getAllEntradas = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await apiNode.get("/api/entradas/")
            setEntradas(Array.isArray(response.data) ? response.data : [])
        } catch {
            setError("Error al cargar entradas")
        } finally {
            setLoading(false)
        }
    }

    const deleteEntrada = async (id) => {
        const confirm = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción eliminará la entrada permanentemente",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#153753",
        })

        if (confirm.isConfirmed) {
            try {
                await apiNode.delete(`/api/entradas/${id}`)
                Swal.fire({
                    title: "Eliminado",
                    text: "La entrada ha sido eliminada correctamente",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                })
                getAllEntradas()
            } catch (error) {
                Swal.fire("Error", error.response?.data?.message || "No se pudo eliminar la entrada", "error")
            }
        }
    }

    useEffect(() => {
        getAllEntradas()
    }, [])

    const filtered = entradas.filter(e => {
        const textToSearch = filterText.toLowerCase()
        const lote = e.Lote?.toLowerCase() || ''
        const insumo = e.insumo?.Nom_Insumo?.toLowerCase() || ''
        const proveedor = e.proveedor?.Nom_Proveedor?.toLowerCase() || ''
        const pasante = e.pasante?.Nom_Responsable?.toLowerCase() || ''
        const instructor = e.instructor?.Nom_Responsable?.toLowerCase() || ''

        return lote.includes(textToSearch) ||
            insumo.includes(textToSearch) ||
            proveedor.includes(textToSearch) ||
            pasante.includes(textToSearch) ||
            instructor.includes(textToSearch)
    })

    const hideModal = () => {
        setShowModal(false)
        setEntradaSeleccionada(null)
        getAllEntradas()
    }

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
                    <div className="tw-flex tw-items-center tw-gap-3 tw-mb-2">
                        <div className="tw-w-10 tw-h-10 tw-bg-primario-900 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-shadow-lg">
                            <Warehouse className="tw-w-5 tw-h-5 tw-text-secundario-400" />
                        </div>
                        <h1 className="tw-text-2xl tw-font-bold tw-text-slate-800">Gestión de Entradas</h1>
                    </div>
                    <p className="tw-text-slate-500 tw-ml-12">Administra las entradas de inventario, lotes y stock disponible</p>
                </div>

                {error && (
                    <div className="tw-mb-4 tw-p-4 tw-bg-red-50 tw-border tw-border-red-200 tw-rounded-xl tw-flex tw-items-center tw-gap-3">
                        <AlertCircle className="tw-w-5 tw-h-5 tw-text-red-500" />
                        <span className="tw-text-red-700">{error}</span>
                    </div>
                )}

                {/* Barra de herramientas */}
                <div className="tw-bg-white tw-rounded-2xl tw-shadow-sm tw-p-4 tw-mb-6">
                    <div className="tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-center tw-gap-4">
                        <div className="tw-relative tw-w-full md:tw-w-96">
                            <Search className="tw-absolute tw-left-3 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-slate-400" />
                            <input
                                type="text"
                                className="tw-w-full tw-pl-10 tw-pr-4 tw-py-2.5 tw-border tw-border-slate-200 tw-rounded-xl tw-bg-slate-50 tw-text-slate-700 tw-placeholder-slate-400 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-primario-500/20 focus:tw-border-primario-500 tw-transition-all"
                                placeholder="Buscar por lote, insumo, proveedor o responsable..."
                                value={filterText}
                                onChange={e => setFilterText(e.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            className="tw-px-5 tw-py-2.5 tw-bg-primario-900 hover:tw-bg-primario-700 tw-text-white tw-font-medium tw-rounded-xl tw-shadow-md hover:tw-shadow-lg tw-transition-all tw-duration-200 tw-flex tw-items-center tw-gap-2"
                            onClick={() => {
                                setEntradaSeleccionada(null)
                                setShowModal(true)
                            }}
                        >
                            <Plus className="tw-w-4 tw-h-4" />
                            <span>Nueva Entrada</span>
                        </button>
                    </div>
                </div>

                {/* Tabla de datos */}
                <div className="tw-bg-white tw-rounded-2xl tw-shadow-lg tw-overflow-hidden">
                    <DataTable
                        columns={columnsTable}
                        data={filtered}
                        keyField="Id_Entradas"
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
                                <p className="tw-mt-3 tw-text-slate-500">Cargando entradas...</p>
                            </div>
                        }
                        noDataComponent={
                            <div className="tw-py-12 tw-text-center">
                                <Inbox className="tw-w-12 tw-h-12 tw-text-slate-300 tw-mx-auto tw-mb-3" />
                                <p className="tw-text-slate-400">No se encontraron entradas</p>
                            </div>
                        }
                    />
                </div>

                {/* Información de registros */}
                <div className="tw-mt-4 tw-text-right">
                    <p className="tw-text-sm tw-text-slate-400">
                        Mostrando {filtered.length} de {entradas.length} entradas
                    </p>
                </div>

                {/* Modal Custom Tailwind */}
                {showModal && (
                    <div 
                        className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-4 tw-bg-black/50 tw-backdrop-blur-sm"
                        onClick={(e) => e.target === e.currentTarget && hideModal()}
                    >
                        <div className="tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-2xl tw-overflow-hidden tw-animate-in tw-fade-in tw-zoom-in-95 tw-duration-200">
                            {/* Modal Header */}
                            <div className="tw-bg-primario-900 tw-px-6 tw-py-4">
                                <div className="tw-flex tw-justify-between tw-items-center">
                                    <div className="tw-flex tw-items-center tw-gap-3">
                                        <div className="tw-w-8 tw-h-8 tw-bg-white/20 tw-rounded-lg tw-flex tw-items-center tw-justify-center">
                                            <Boxes className="tw-w-5 tw-h-5 tw-text-secundario-400" />
                                        </div>
                                        <h5 className="tw-text-white tw-font-semibold tw-text-lg tw-m-0">
                                            {entradaSeleccionada ? 'Editar Entrada' : 'Nueva Entrada'}
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
                                <EntradasForm
                                    hideModal={hideModal}
                                    refreshTable={getAllEntradas}
                                    entradaSeleccionada={entradaSeleccionada}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CrudEntradas
