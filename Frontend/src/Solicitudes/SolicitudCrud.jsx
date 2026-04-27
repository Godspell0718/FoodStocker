import apiAxios from "../api/axiosConfig.js"
import { useEffect, useState } from "react"
import DataTable from "react-data-table-component"
import SolicitudFormNuevo from "./SolicitudFormN.jsx"
import SolicitudForm from "./SolicitudForm.jsx"
import Swal from 'sweetalert2'
import { ClipboardList, Plus, Pencil, Trash2, Utensils, X, Search, Hash, User, Calendar, FileText, Tag, Clock, Info } from "lucide-react"

const customTableStyles = {
    table: { style: { backgroundColor: 'transparent', borderRadius: '0.75rem', overflow: 'hidden' } },
    headRow: { style: { backgroundColor: '#153753', color: '#f2f8fd', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: 'none', minHeight: '40px' } },
    headCells: { style: { color: '#f2f8fd', paddingLeft: '12px', paddingRight: '12px' } },
    rows: { style: { backgroundColor: '#ffffff', fontSize: '13px', color: '#1f2937', borderBottom: '1px solid #f3f4f6', minHeight: '44px', transition: 'background-color 0.15s' }, highlightOnHoverStyle: { backgroundColor: '#f0f7ff', borderBottomColor: '#e0eeff', outline: 'none' } },
    cells: { style: { paddingLeft: '12px', paddingRight: '12px' } },
    pagination: { style: { backgroundColor: '#ffffff', borderTop: '1px solid #f3f4f6', color: '#374151', minHeight: '40px' } },
}

const SolicitudCrud = () => {
    const [solicitudes, setSolicitudes] = useState([])
    const [selectedSolicitud, setSelectedSolicitud] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [refresh, setRefresh] = useState(false)
    const [filterText, setFilterText] = useState("")

    const columnsTable = [
        { 
            name: 'ID', 
            selector: row => row.Id_solicitud, 
            sortable: true, 
            width: '80px',
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-1.5 tw-font-mono tw-text-gray-500">
                    <Hash className="tw-w-3 tw-h-3" />
                    <span>{row.Id_solicitud}</span>
                </div>
            )
        },
        { 
            name: 'Responsable', 
            selector: row => row.responsable?.Nom_Responsable ?? "Sin responsable", 
            sortable: true,
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-2">
                    <div className="tw-w-7 tw-h-7 tw-rounded-full tw-bg-primario-50 tw-flex tw-items-center tw-justify-center">
                        <User className="tw-w-3.5 tw-h-3.5 tw-text-primario-600" />
                    </div>
                    <span className="tw-font-medium">{row.responsable?.Nom_Responsable ?? "Sin responsable"}</span>
                </div>
            )
        },
        { 
            name: 'Entrega', 
            selector: row => row.Fec_entrega, 
            sortable: true,
            width: '120px',
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-1.5 tw-text-gray-600">
                    <Calendar className="tw-w-3.5 tw-h-3.5 tw-text-blue-500" />
                    <span>{row.Fec_entrega}</span>
                </div>
            )
        },
        { 
            name: 'Motivo', 
            selector: row => row.motivo, 
            sortable: true,
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-1.5">
                    <FileText className="tw-w-3.5 tw-h-3.5 tw-text-amber-500" />
                    <span className="tw-truncate tw-max-w-[150px]">{row.motivo}</span>
                </div>
            )
        },
        { 
            name: 'Descripción', 
            selector: row => row.Descripcion ?? "Sin descripción",
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-1.5 tw-text-gray-500">
                    <Info className="tw-w-3.5 tw-h-3.5 tw-shrink-0" />
                    <span className="tw-truncate tw-max-w-[180px]">{row.Descripcion ?? "—"}</span>
                </div>
            )
        },
        { 
            name: 'Ficha', 
            selector: row => row.Ficha ?? "-",
            width: '100px',
            cell: row => (
                <span className="tw-px-2 tw-py-0.5 tw-bg-gray-100 tw-text-gray-600 tw-rounded-md tw-text-[11px] tw-font-bold tw-flex tw-items-center tw-gap-1 tw-w-fit">
                    <Tag className="tw-w-2.5 tw-h-2.5" />
                    {row.Ficha ?? "-"}
                </span>
            )
        },
        { 
            name: 'Solicitud', 
            selector: row => row.createdat?.slice(0, 10), 
            sortable: true,
            width: '120px',
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-1.5 tw-text-gray-400">
                    <Clock className="tw-w-3.5 tw-h-3.5" />
                    <span>{row.createdat?.slice(0, 10)}</span>
                </div>
            )
        },
        {
            name: 'Acciones',
            width: '100px',
            right: true,
            cell: (row) => (
                <div className="tw-flex tw-gap-1.5">
                    <button
                        title="Editar"
                        className="tw-flex tw-items-center tw-justify-center tw-w-7 tw-h-7 tw-rounded-lg tw-bg-primario-900 tw-text-primario-50 hover:tw-bg-primario-700 tw-transition-all tw-duration-150"
                        onClick={() => updateSolicitud(row.Id_solicitud)}
                    >
                        <Utensils className="tw-w-3 tw-h-3" />
                    </button>
                    <button
                        title="Eliminar"
                        className="tw-flex tw-items-center tw-justify-center tw-w-7 tw-h-7 tw-rounded-lg tw-bg-red-50 tw-text-red-500 hover:tw-bg-red-500 hover:tw-text-white tw-transition-all tw-duration-150"
                        onClick={() => deleteSolicitud(row.Id_solicitud)}
                    >
                        <Trash2 className="tw-w-3 tw-h-3" />
                    </button>
                </div>
            )
        }
    ]

    useEffect(() => {
        getAllSolicitudes()
    }, [refresh])

    const getAllSolicitudes = async () => {
        try {
            const response = await apiAxios.get('/api/solicitudes/')
            setSolicitudes(response.data)
        } catch (error) {
            console.error("Error al obtener solicitudes:", error)
        }
    }

    const updateSolicitud = (Id_solicitud) => {
        const solicitudToUpdate = solicitudes.find(s => s.Id_solicitud === Id_solicitud)
        setSelectedSolicitud(solicitudToUpdate)
        setIsEditing(true)
        setShowModal(true)
    }

    const createSolicitud = () => {
        setSelectedSolicitud(null)
        setIsEditing(false)
        setShowModal(true)
    }

    const hideModal = () => {
        setShowModal(false)
        setRefresh(!refresh)
    }

    const deleteSolicitud = async (Id_solicitud) => {
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
            await apiAxios.delete(`/api/solicitudes/${Id_solicitud}`)
            Swal.fire({ title: 'Eliminado', text: 'La solicitud fue eliminada', icon: 'success', timer: 1500, showConfirmButton: false })
            setRefresh(!refresh)
        }
    }

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) setShowModal(false)
    }

    const newListSolicitudes = solicitudes.filter(sol => {
        const text = filterText.toLowerCase()
        const responsable = sol.responsable?.Nom_Responsable?.toLowerCase() ?? ""
        const motivo = sol.motivo?.toLowerCase() ?? ""
        return responsable.includes(text) || motivo.includes(text)
    })

    return (
        <div className="tw-p-6">
            <div className="tw-max-w-7xl tw-mx-auto">
                {/* Header */}
                <div className="tw-flex tw-items-center tw-justify-between tw-mb-8">
                    <div className="tw-flex tw-items-center tw-gap-3">
                        <div className="tw-w-10 tw-h-10 tw-rounded-xl tw-bg-primario-900 tw-flex tw-items-center tw-justify-center tw-shadow-md">
                            <ClipboardList className="tw-w-5 tw-h-5 tw-text-secundario-400" />
                        </div>
                        <div>
                            <h1 className="tw-text-xl tw-font-bold tw-text-gray-800 tw-m-0">Gestión de Solicitudes</h1>
                            <p className="tw-text-sm tw-text-gray-500 tw-m-0">Administra el historial de solicitudes</p>
                        </div>
                    </div>

                    <button
                        onClick={createSolicitud}
                        className="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2.5 tw-rounded-xl tw-bg-primario-900 tw-text-primario-50 hover:tw-bg-primario-700 tw-transition-all tw-duration-200 tw-shadow-md tw-font-medium tw-text-sm"
                    >
                        <Plus className="tw-w-4 tw-h-4" />
                        Nueva Solicitud
                    </button>
                </div>

                {/* Buscador */}
                <div className="tw-relative tw-w-72 tw-mb-6">
                    <Search className="tw-absolute tw-left-3 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por responsable o motivo..."
                        className="tw-w-full tw-pl-9 tw-pr-4 tw-py-2.5 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-white tw-text-sm tw-text-gray-700 focus:tw-outline-none focus:tw-border-primario-500 focus:tw-ring-2 focus:tw-ring-primario-100 tw-transition-all tw-shadow-sm"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                    />
                </div>

                {/* Tabla */}
                <div className="tw-bg-white tw-rounded-2xl tw-shadow-lg tw-border tw-border-gray-100 tw-overflow-hidden">
                    <DataTable
                        columns={columnsTable}
                        data={newListSolicitudes}
                        keyField="Id_solicitud"
                        pagination
                        highlightOnHover
                        customStyles={customTableStyles}
                        noDataComponent={
                            <div className="tw-py-12 tw-text-center tw-text-gray-400 tw-text-sm">
                                No hay solicitudes para mostrar
                            </div>
                        }
                    />
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div
                    className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                    onClick={handleBackdropClick}
                >
                    <div className="tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-2xl tw-overflow-hidden tw-animate-none">

                        {/* Modal header */}
                        <div className="tw-flex tw-items-center tw-justify-between tw-px-6 tw-py-4 tw-bg-primario-900">
                            <div className="tw-flex tw-items-center tw-gap-2">
                                <ClipboardList className="tw-w-5 tw-h-5 tw-text-secundario-400" />
                                <h2 className="tw-text-white tw-font-semibold tw-text-base tw-m-0">
                                    {isEditing ? 'Editar Solicitud' : 'Nueva Solicitud'}
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="tw-w-8 tw-h-8 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-text-primario-200 hover:tw-bg-primario-800 hover:tw-text-white tw-transition-all"
                            >
                                <X className="tw-w-4 tw-h-4" />
                            </button>
                        </div>

                        {/* Modal body */}
                        <div className="tw-px-6 tw-py-5">
                            {isEditing ? (
                                <SolicitudForm
                                    hideModal={hideModal}
                                    isEditing={isEditing}
                                    selectedSolicitud={selectedSolicitud}
                                    setRefresh={setRefresh}
                                    refresh={refresh}
                                />
                            ) : (
                                <SolicitudFormNuevo hideModal={hideModal} />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SolicitudCrud