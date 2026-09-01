import { useState, useEffect } from "react"
import apiAxios from '../api/axiosConfig.js'
import DataTable from "react-data-table-component"
import ResponsablesForm from "./ResponsablesForm.jsx"
import {
    Mail,
    Phone,
    Pencil,
    Users,
    CircleUser,
    User,
    Trash2,
    X,
    Inbox,
} from 'lucide-react'
import Swal from "sweetalert2"


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
                    <div className="tw-w-8 tw-h-8 tw-bg-gradient-to-br tw-from-primario-100 tw-to-secundario-100 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                        <CircleUser color="#17353f" size={24} />
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
                    <Mail size={15} color="#fbbf24" />
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
                    row.Tip_Responsable === 'ADMIN' 
                        ? 'tw-bg-blue-100 tw-text-blue-700' 
                        : row.Tip_Responsable === 'Instructor de agroindustria'
                        ? 'tw-bg-purple-100 tw-text-purple-700'
                        : row.Tip_Responsable === 'Pasante de agroindustria'
                        ? 'tw-bg-emerald-100 tw-text-emerald-700'
                        : 'tw-bg-amber-100 tw-text-amber-700'
                }`}>
                    {row.Tip_Responsable}
                </span>
            )
        },
        { 
            name: "Estado", 
            selector: row => row.Estado || 'ACTIVO',
            sortable: true,
            cell: row => (
                <span className={`tw-px-2.5 tw-py-1 tw-rounded-full tw-text-xs tw-font-bold ${
                    (row.Estado || 'ACTIVO') === 'ACTIVO'
                        ? 'tw-bg-emerald-100 tw-text-emerald-800' 
                        : 'tw-bg-rose-100 tw-text-rose-800'
                }`}>
                    {row.Estado || 'ACTIVO'}
                </span>
            )
        },
        {
            name: "Acciones",
            right: true,
            width: "120px",
            cell: row => {
                const isActivo = (row.Estado || 'ACTIVO') === 'ACTIVO';
                return (
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
                            title={isActivo ? "Inactivar Usuario" : "Activar Usuario"}
                            className={`tw-p-1.5 tw-rounded-lg tw-transition-all tw-duration-200 tw-shadow-sm ${
                                isActivo 
                                    ? "tw-bg-amber-50 tw-text-amber-600 hover:tw-bg-amber-600 hover:tw-text-white" 
                                    : "tw-bg-emerald-50 tw-text-emerald-600 hover:tw-bg-emerald-600 hover:tw-text-white"
                            }`}
                            onClick={() => toggleEstadoResponsable(row)}
                        >
                            <Trash2 className="tw-w-3.5 tw-h-3.5" />
                        </button>
                    </div>
                );
            }
        }
    ]

    useEffect(() => {
        getAllResponsables()
    }, [])

    const toggleEstadoResponsable = async (row) => {
        const isActivo = (row.Estado || 'ACTIVO') === 'ACTIVO';
        const accion = isActivo ? "Inactivar" : "Activar";
        const confirm = await Swal.fire({
            title: `¿${accion} usuario?`,
            text: isActivo 
                ? "El usuario pasará a estado INACTIVO (no se eliminarán sus registros históricos)"
                : "El usuario pasará a estado ACTIVO",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: `Sí, ${accion.toLowerCase()}`,
            cancelButtonText: "Cancelar",
            confirmButtonColor: isActivo ? "#f59e0b" : "#10b981",
            cancelButtonColor: "#153753",
        })

        if (confirm.isConfirmed) {
            try {
                await apiAxios.delete(`/api/responsables/${row.Id_Responsable}`)
                Swal.fire({
                    title: "Completado",
                    text: `El usuario ahora está ${isActivo ? 'INACTIVO' : 'ACTIVO'}`,
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                })
                getAllResponsables()
            } catch (error) {
                Swal.fire("Error", error.response?.data?.message || "No se pudo cambiar el estado del responsable", "error")
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
                <div className="tw-bg-white tw-rounded-2xl tw-shadow-[15px_15px_30px_#bebebe,_-15px_-15px_30px_#ffffff] tw-p-4 tw-mb-6">
                    <div className="tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-center tw-gap-4 ">
                        <div className="tw-relative tw-w-full md:tw-w-96 ">
                            <i className="fa-solid fa-magnifying-glass tw-absolute tw-left-3 tw-top-1/2 -tw-translate-y-1/2 tw-text-slate-400"></i>
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
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"></path>
                                <path d="M8 12H16"></path>
                                <path d="M12 16V8"></path>
                            </svg>
                            <span>Nuevo Responsable</span>
                        </button>

                    </div>
                </div>

                {/* Tabla de datos */}
                <div className="tw-bg-white tw-rounded-2xl tw-shadow-[15px_15px_30px_#bebebe,_-15px_-15px_30px_#ffffff] tw-overflow-hidden">
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