import { useState, useEffect } from "react"
import apiAxios from '../api/axiosConfig.js'
import DataTable from "react-data-table-component"
import ResponsablesForm from "./ResponsablesForm.jsx"
import Swal from "sweetalert2"
import { 
    Users, User, Mail, Phone, Shield, 
    Plus, Search, Pencil, Trash2, X, Inbox 
} from "lucide-react"

const CrudResponsables = () => {

    const [responsables, setResponsables] = useState([])
    const [filterText, setFilterText] = useState("")
    const [loading, setLoading] = useState(false)
    const [responsableSeleccionado, setResponsableSeleccionado] = useState(null)
    const [showModal, setShowModal] = useState(false)

    const columnsTable = [
        { 
            name: "Nombre", 
            selector: row => row.Nom_Responsable,
            sortable: true,
            grow: 2,
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-3">
                    <div className="tw-w-8 tw-h-8 tw-bg-gradient-to-br tw-from-blue-100 tw-to-amber-100 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                        <User className="tw-w-4 tw-h-4 tw-text-blue-600" />
                    </div>
                    <span className="tw-font-medium tw-text-slate-700">{row.Nom_Responsable}</span>
                </div>
            )
        },
        { 
            name: "Documento", 
            selector: row => row.Doc_Responsable,
            sortable: true,
            cell: row => (
                <span className="tw-font-mono tw-text-slate-600">{row.Doc_Responsable}</span>
            )
        },
        { 
            name: "Correo", 
            selector: row => row.Cor_Responsable,
            grow: 2,
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-2">
                    <Mail className="tw-w-3.5 tw-h-3.5 tw-text-amber-500" />
                    <span className="tw-text-slate-600">{row.Cor_Responsable}</span>
                </div>
            )
        },
        { 
            name: "Teléfono", 
            selector: row => row.Tel_Responsable,
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-2">
                    <Phone className="tw-w-3.5 tw-h-3.5 tw-text-blue-400" />
                    <span className="tw-text-slate-600">{row.Tel_Responsable}</span>
                </div>
            )
        },
        { 
            name: "Tipo", 
            selector: row => row.Tip_Responsable,
            cell: row => (
                <span className={`tw-px-2 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium ${
                    row.Tip_Responsable === 'Administrador' 
                        ? 'tw-bg-blue-100 tw-text-blue-700' 
                        : 'tw-bg-amber-100 tw-text-amber-700'
                }`}>
                    {row.Tip_Responsable}
                </span>
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
                            setResponsableSeleccionado(row)
                            setShowModal(true)
                        }}
                    >
                        <Pencil className="tw-w-3.5 tw-h-3.5" />
                    </button>
                    <button
                        title="Eliminar"
                        className="tw-p-1.5 tw-rounded-lg tw-bg-red-50 tw-text-red-500 hover:tw-bg-red-500 hover:tw-text-white tw-transition-all tw-duration-200 tw-shadow-sm"
                        onClick={() => deleteResponsable(row.Id_Responsable)}
                    >
                        <Trash2 className="tw-w-3.5 tw-h-3.5" />
                    </button>
                </div>
            )
        }
    ]

    useEffect(() => {
        getAllResponsables()
    }, [])

    const deleteResponsable = async (id) => {
        const confirm = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción eliminará al responsable permanentemente",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#153753",
        })

        if (confirm.isConfirmed) {
            try {
                await apiAxios.delete(`/api/responsables/${id}`)
                Swal.fire({
                    title: "Eliminado",
                    text: "El responsable ha sido eliminado correctamente",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                })
                getAllResponsables()
            } catch (error) {
                Swal.fire("Error", error.response?.data?.message || "No se pudo eliminar al responsable", "error")
            }
        }
    }

    const getAllResponsables = async () => {
        setLoading(true)
        try {
            const response = await apiAxios.get('/api/responsables/')
            setResponsables(Array.isArray(response.data) ? response.data : [])
        } catch (error) {
            console.error("Error al cargar responsables:", error)
        } finally {
            setLoading(false)
        }
    }

    const newListResponsables = responsables.filter(responsable => {
        const textToSearch = filterText.toLowerCase()
        const nombre = responsable.Nom_Responsable?.toLowerCase() || ''
        const correo = responsable.Cor_Responsable?.toLowerCase() || ''
        const documento = responsable.Doc_Responsable?.toString() || ''
        return nombre.includes(textToSearch) || 
               correo.includes(textToSearch) || 
               documento.includes(textToSearch)
    })

    const hideModal = () => {
        setShowModal(false)
        setResponsableSeleccionado(null) 
        getAllResponsables() 
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
                            <Users className="tw-w-5 tw-h-5 tw-text-secundario-400" />
                        </div>
                        <h1 className="tw-text-2xl tw-font-bold tw-text-slate-800">Gestión de Usuarios</h1>
                    </div>
                    <p className="tw-text-slate-500 tw-ml-12">Administra los usuarios que gestionan el inventario del sistema</p>
                </div>

                {/* Barra de herramientas */}
                <div className="tw-bg-white tw-rounded-2xl tw-shadow-sm tw-p-4 tw-mb-6">
                    <div className="tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-center tw-gap-4">
                        <div className="tw-relative tw-w-full md:tw-w-96">
                            <Search className="tw-absolute tw-left-3 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-slate-400" />
                            <input
                                type="text"
                                className="tw-w-full tw-pl-10 tw-pr-4 tw-py-2.5 tw-border tw-border-slate-200 tw-rounded-xl tw-bg-slate-50 tw-text-slate-700 tw-placeholder-slate-400 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-primario-500/20 focus:tw-border-primario-500 tw-transition-all"
                                placeholder="Buscar por nombre, correo o documento..."
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            className="tw-px-5 tw-py-2.5 tw-bg-primario-900 hover:tw-bg-primario-700 tw-text-white tw-font-medium tw-rounded-xl tw-shadow-md hover:tw-shadow-lg tw-transition-all tw-duration-200 tw-flex tw-items-center tw-gap-2"
                            onClick={() => {
                                setResponsableSeleccionado(null)
                                setShowModal(true)
                            }}
                        >
                            <Plus className="tw-w-4 tw-h-4" />
                            <span>Nuevo Usuario</span>
                        </button>
                    </div>
                </div>

                {/* Tabla de datos */}
                <div className="tw-bg-white tw-rounded-2xl tw-shadow-lg tw-overflow-hidden">
                    <DataTable
                        columns={columnsTable}
                        data={newListResponsables}
                        keyField="Id_Responsable"
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
                                <div className="tw-inline-block tw-w-8 tw-h-8 tw-border-4 tw-border-blue-200 tw-border-t-blue-600 tw-rounded-full tw-animate-spin"></div>
                                <p className="tw-mt-3 tw-text-slate-500">Cargando responsables...</p>
                            </div>
                        }
                        noDataComponent={
                            <div className="tw-py-12 tw-text-center">
                                <Inbox className="tw-w-12 tw-h-12 tw-text-slate-300 tw-mx-auto tw-mb-3" />
                                <p className="tw-text-slate-400">No se encontraron responsables</p>
                            </div>
                        }
                    />
                </div>

                {/* Información de registros */}
                <div className="tw-mt-4 tw-text-right">
                    <p className="tw-text-sm tw-text-slate-400">
                        Mostrando {newListResponsables.length} de {responsables.length} responsables
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
                                            <User className="tw-w-5 tw-h-5 tw-text-secundario-400" />
                                        </div>
                                        <h5 className="tw-text-white tw-font-semibold tw-text-lg tw-m-0">
                                            {responsableSeleccionado ? 'Editar Responsable' : 'Nuevo Responsable'}
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
                                <ResponsablesForm
                                    hideModal={hideModal}
                                    responsableSeleccionado={responsableSeleccionado}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CrudResponsables