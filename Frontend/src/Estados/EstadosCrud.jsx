import apiAxios from "../api/axiosConfig.js"
import { useEffect, useState } from "react"
import DataTable from "react-data-table-component"
import EstadoForm from "./EstadosForm.jsx"
import Swal from "sweetalert2"
import { CircleDot, Plus, Pencil, X, Hash, Type, Trash2 } from "lucide-react"

const customTableStyles = {
    table: { style: { backgroundColor: 'transparent', borderRadius: '0.75rem', overflow: 'hidden' } },
    headRow: { style: { backgroundColor: '#153753', color: '#f2f8fd', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: 'none', minHeight: '40px' } },
    headCells: { style: { color: '#f2f8fd', paddingLeft: '12px', paddingRight: '12px' } },
    rows: { style: { backgroundColor: '#ffffff', fontSize: '13px', color: '#1f2937', borderBottom: '1px solid #f3f4f6', minHeight: '44px', transition: 'background-color 0.15s' }, highlightOnHoverStyle: { backgroundColor: '#f0f7ff', borderBottomColor: '#e0eeff', outline: 'none' } },
    cells: { style: { paddingLeft: '12px', paddingRight: '12px' } },
    pagination: { style: { backgroundColor: '#ffffff', borderTop: '1px solid #f3f4f6', color: '#374151', minHeight: '40px' } },
}

const EstadosCrud = () => {
    const [Estados, setEstados] = useState([])
    const [selectedEstado, setSelectedEstado] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [refresh, setRefresh] = useState(false)

    const columnsTable = [
        { 
            name: 'ID', 
            selector: row => row.Id_estado, 
            sortable: true, 
            width: '65px',
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
            width: '250px',
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
            name: 'Acción',
            width: '100px',
            right: true,
            cell: (row) => (
                <div className="tw-flex tw-gap-1.5">
                    <button
                        title="Editar"
                        className="tw-flex tw-items-center tw-justify-center tw-w-7 tw-h-7 tw-rounded-lg tw-bg-primario-900 tw-text-primario-50 hover:tw-bg-primario-700 tw-transition-all tw-duration-150"
                        onClick={() => updateEstado(row.Id_estado)}
                    >
                        <Pencil className="tw-w-3 tw-h-3" />
                    </button>
                    <button
                        title="Eliminar"
                        className="tw-flex tw-items-center tw-justify-center tw-w-7 tw-h-7 tw-rounded-lg tw-bg-red-50 tw-text-red-500 hover:tw-bg-red-500 hover:tw-text-white tw-transition-all tw-duration-150"
                        onClick={() => deleteEstado(row.Id_estado)}
                    >
                        <Trash2 className="tw-w-3 tw-h-3" />
                    </button>
                </div>
            )
        }
    ]

    useEffect(() => { getAllEstados() }, [refresh])

    const getAllEstados = async () => {
        try {
            const response = await apiAxios.get('/api/Estados/')
            setEstados(response.data)
        } catch (error) {
            console.error("Error al obtener Estados:", error)
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

    return (
        <div className="tw-p-6">
            <div className="tw-max-w-3xl tw-mx-auto">
                {/* Header */}
                <div className="tw-flex tw-items-center tw-justify-between tw-mb-8">
                    <div className="tw-flex tw-items-center tw-gap-3">
                        <div className="tw-w-10 tw-h-10 tw-rounded-xl tw-bg-primario-900 tw-flex tw-items-center tw-justify-center tw-shadow-md">
                            <CircleDot className="tw-w-5 tw-h-5 tw-text-secundario-400" />
                        </div>
                        <div>
                            <h1 className="tw-text-xl tw-font-bold tw-text-gray-800 tw-m-0">Estados</h1>
                            <p className="tw-text-sm tw-text-gray-500 tw-m-0">Gestiona los estados del sistema</p>
                        </div>
                    </div>

                    <button
                        onClick={createEstado}
                        className="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2.5 tw-rounded-xl tw-bg-primario-900 tw-text-primario-50 hover:tw-bg-primario-700 tw-transition-all tw-duration-200 tw-shadow-md tw-font-medium tw-text-sm"
                    >
                        <Plus className="tw-w-4 tw-h-4" />
                        Nuevo Estado
                    </button>
                </div>

                {/* Tabla */}
                <div className="tw-bg-white tw-rounded-2xl tw-shadow-lg tw-border tw-border-gray-100 tw-overflow-hidden">
                    <DataTable
                        columns={columnsTable}
                        data={Estados}
                        keyField="Id_estado"
                        pagination
                        highlightOnHover
                        customStyles={customTableStyles}
                        noDataComponent={
                            <div className="tw-py-12 tw-text-center tw-text-gray-400 tw-text-sm">
                                No hay estados registrados
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
                    <div className="tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-md tw-overflow-hidden">

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
                                <X className="tw-w-4 tw-h-4" />
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
    )
}

export default EstadosCrud
