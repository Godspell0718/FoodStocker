import apiAxios from "../api/axiosConfig.js"
import { useEffect, useState } from "react"
import DataTable from "react-data-table-component"
import EstadoForm from "./EstadosForm.jsx"
import Swal from "sweetalert2"
import { CircleDot, Plus, Pencil, X, Hash, Type, Trash2, Search, Inbox } from "lucide-react"

const customTableStyles = {
    table: { 
        style: { 
            backgroundColor: 'transparent', 
            borderRadius: '0.75rem', 
            overflow: 'hidden',
            minWidth: '100%'
        } 
    },
    tableWrapper: {
        style: {
            display: 'block',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
        }
    },
    headRow: { 
        style: { 
            backgroundColor: '#1e3a5f', 
            color: '#ffffff', 
            fontWeight: '600', 
            fontSize: '13px', 
            textTransform: 'uppercase', 
            letterSpacing: '0.5px', 
            borderBottom: 'none', 
            minHeight: '40px',
            width: '100%'
        } 
    },
    headCells: { 
        style: { 
            color: '#ffffff', 
            paddingLeft: '12px', 
            paddingRight: '12px',
            fontSize: '13px',
            fontWeight: '600'
        } 
    },
    rows: { 
        style: { 
            backgroundColor: '#ffffff', 
            fontSize: '13px', 
            color: '#1f2937', 
            borderBottom: '1px solid #f3f4f6', 
            minHeight: '44px', 
            transition: 'background-color 0.15s',
            width: '100%'
        }, 
        highlightOnHoverStyle: { 
            backgroundColor: '#fef3c7', 
            borderBottomColor: '#e0eeff', 
            outline: 'none' 
        } 
    },
    cells: { 
        style: { 
            paddingLeft: '12px', 
            paddingRight: '12px' 
        } 
    },
    pagination: { 
        style: { 
            backgroundColor: '#ffffff', 
            borderTop: '1px solid #e2e8f0', 
            color: '#374151', 
            minHeight: '40px' 
        } 
    },
}

const EstadosCrud = () => {
    const [Estados, setEstados] = useState([])
    const [filterText, setFilterText] = useState("")
    const [selectedEstado, setSelectedEstado] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [refresh, setRefresh] = useState(false)
    const [loading, setLoading] = useState(false)

    const columnsTable = [
        { 
            name: 'ID', 
            selector: row => row.Id_estado, 
            sortable: true, 
            width: '80px',
            maxWidth: '80px',
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-1.5 tw-font-mono tw-text-gray-500">
                    <Hash className="tw-w-3 tw-h-3" />
                    <span>{row.Id_estado}</span>
                </div>
            )
        },
        {
            name: 'Nombre',
            selector: row => row.nom_estado,
            sortable: true,
            grow: 1,
            width: 'auto',
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-2">
                    <Type className="tw-w-3.5 tw-h-3.5 tw-text-primario-600" />
                    <span className="tw-inline-flex tw-items-center tw-gap-1.5 tw-px-2.5 tw-py-0.5 tw-rounded-full tw-bg-primario-50 tw-text-primario-800 tw-text-[11px] tw-font-bold">
                        <span className="tw-w-1 tw-h-1 tw-rounded-full tw-bg-primario-500" />
                        {row.nom_estado}
                    </span>
                </div>
            )
        },
        {
            name: 'Acciones',
            right: true,
            width: '100px',
            minWidth: '100px',
            maxWidth: '100px',
            cell: (row) => (
                <div className="tw-flex tw-gap-2">
                    <button
                        title="Editar"
                        className="tw-p-1.5 tw-rounded-lg tw-bg-primario-900 tw-text-white hover:tw-bg-primario-700 tw-transition-all tw-duration-200 tw-shadow-sm"
                        onClick={() => updateEstado(row.Id_estado)}
                    >
                        <Pencil className="tw-w-3.5 tw-h-3.5" />
                    </button>
                    <button
                        title="Eliminar"
                        className="tw-p-1.5 tw-rounded-lg tw-bg-red-50 tw-text-red-500 hover:tw-bg-red-500 hover:tw-text-white tw-transition-all tw-duration-200 tw-shadow-sm"
                        onClick={() => deleteEstado(row.Id_estado)}
                    >
                        <Trash2 className="tw-w-3.5 tw-h-3.5" />
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            button: true
        }
    ]

    useEffect(() => { getAllEstados() }, [refresh])

    const getAllEstados = async () => {
        try {
            setLoading(true)
            const response = await apiAxios.get('/api/Estados/')
            setEstados(response.data)
        } catch (error) {
            console.error("Error al obtener Estados:", error)
        } finally {
            setLoading(false)
        }
    }

    const deleteEstado = async (Id_estado) => {
        const confirm = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#153753',
        })
        if (confirm.isConfirmed) {
            try {
                await apiAxios.delete(`/api/Estados/${Id_estado}`)
                Swal.fire({ title: 'Eliminado', text: 'El estado fue eliminado', icon: 'success', timer: 1500, showConfirmButton: false })
                setRefresh(!refresh)
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'No se pudo eliminar el estado', 'error')
            }
        }
    }

    const updateEstado = (Id_estado) => {
        const estadoToUpdate = Estados.find(estado => estado.Id_estado === Id_estado)
        setSelectedEstado(estadoToUpdate)
        setIsEditing(true)
        setShowModal(true)
    }

    const createEstado = () => {
        setSelectedEstado(null)
        setIsEditing(false)
        setShowModal(true)
    }

    const hideModal = () => {
        setShowModal(false)
        setRefresh(!refresh)
    }

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) setShowModal(false)
    }

    // Filtrar estados por nombre
    const filteredEstados = Estados.filter(estado => {
        const searchTerm = filterText.toLowerCase()
        return estado.nom_estado?.toLowerCase().includes(searchTerm) ||
               estado.Id_estado?.toString().includes(searchTerm)
    })

    return (
        <div className="tw-min-h-screen tw-bg-gradient-to-br tw-from-slate-50 tw-to-blue-50 tw-p-6">
            <div className="tw-w-full tw-max-w-none">
                {/* Header */}
                <div className="tw-mb-8">
                    <div className="tw-flex tw-items-center tw-gap-3 tw-mb-2">
                        <div className="tw-w-10 tw-h-10 tw-bg-primario-900 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-shadow-lg">
                            <CircleDot className="tw-w-5 tw-h-5 tw-text-secundario-400" />
                        </div>
                        <div>
                            <h1 className="tw-text-2xl tw-font-bold tw-text-slate-800">Estados</h1>
                            <p className="tw-text-sm tw-text-slate-500">Gestiona los estados del sistema</p>
                        </div>
                    </div>
                </div>

                {/* Barra de herramientas */}
                <div className="tw-bg-white tw-rounded-2xl tw-shadow-sm tw-p-4 tw-mb-6">
                    <div className="tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-center tw-gap-4">
                        <div className="tw-relative tw-w-full md:tw-w-96">
                            <Search className="tw-absolute tw-left-3 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-slate-400" />
                            <input
                                type="text"
                                className="tw-w-full tw-pl-10 tw-pr-4 tw-py-2.5 tw-border tw-border-slate-200 tw-rounded-xl tw-bg-slate-50 tw-text-slate-700 tw-placeholder-slate-400 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-primario-500/20 focus:tw-border-primario-500 tw-transition-all"
                                placeholder="Buscar por ID o nombre de estado..."
                                value={filterText}
                                onChange={e => setFilterText(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={createEstado}
                            className="tw-px-5 tw-py-2.5 tw-bg-primario-900 hover:tw-bg-primario-700 tw-text-white tw-font-medium tw-rounded-xl tw-shadow-md hover:tw-shadow-lg tw-transition-all tw-duration-200 tw-flex tw-items-center tw-gap-2"
                        >
                            <Plus className="tw-w-4 tw-h-4" />
                            <span>Nuevo Estado</span>
                        </button>
                    </div>
                </div>

                {/* Tabla - Ahora ocupa todo el ancho disponible */}
                <div className="tw-bg-white tw-rounded-2xl tw-shadow-lg tw-overflow-hidden">
                    <DataTable
                        columns={columnsTable}
                        data={filteredEstados}
                        keyField="Id_estado"
                        pagination
                        paginationPerPage={10}
                        paginationRowsPerPageOptions={[5, 10, 15, 25]}
                        highlightOnHover
                        pointerOnHover
                        responsive
                        fixedHeader
                        fixedHeaderScrollHeight="calc(100vh - 300px)"
                        customStyles={customTableStyles}
                        progressPending={loading}
                        progressComponent={
                            <div className="tw-py-12 tw-text-center">
                                <div className="tw-inline-block tw-w-8 tw-h-8 tw-border-4 tw-border-slate-200 tw-border-t-primario-900 tw-rounded-full tw-animate-spin"></div>
                                <p className="tw-mt-3 tw-text-slate-500">Cargando estados...</p>
                            </div>
                        }
                        noDataComponent={
                            <div className="tw-py-12 tw-text-center">
                                <Inbox className="tw-w-12 tw-h-12 tw-text-slate-300 tw-mx-auto tw-mb-3" />
                                <p className="tw-text-slate-400">
                                    {filterText ? "No se encontraron estados coincidentes" : "No hay estados registrados"}
                                </p>
                            </div>
                        }
                    />
                </div>

                {/* Información de registros */}
                <div className="tw-mt-4 tw-text-right">
                    <p className="tw-text-sm tw-text-slate-400">
                        Mostrando {filteredEstados.length} de {Estados.length} estados
                    </p>
                </div>

                {/* Modal */}
                {showModal && (
                    <div
                        className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-4"
                        style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                        onClick={handleBackdropClick}
                    >
                        <div className="tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-md tw-overflow-hidden tw-animate-in tw-fade-in tw-zoom-in-95 tw-duration-200">
                            {/* Modal header */}
                            <div className="tw-flex tw-items-center tw-justify-between tw-px-6 tw-py-4 tw-bg-primario-900">
                                <div className="tw-flex tw-items-center tw-gap-2">
                                    <CircleDot className="tw-w-5 tw-h-5 tw-text-secundario-400" />
                                    <h2 className="tw-text-white tw-font-semibold tw-text-base tw-m-0">
                                        {isEditing ? "Editar Estado" : "Nuevo Estado"}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="tw-w-8 tw-h-8 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-text-primario-200 hover:tw-bg-primario-800 hover:tw-text-white tw-transition-all"
                                >
                                    <X className="tw-w-5 tw-h-5" />
                                </button>
                            </div>

                            {/* Modal body */}
                            <div className="tw-px-6 tw-py-5">
                                <EstadoForm
                                    hideModal={hideModal}
                                    isEditing={isEditing}
                                    selectedEstado={selectedEstado}
                                    setRefresh={setRefresh}
                                    refresh={refresh}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default EstadosCrud