import apiAxios from "../api/axiosConfig.js"
import { useEffect, useState } from "react"
import DataTable from "react-data-table-component"
import EstadoForm from "./EstadosForm.jsx"
import { CircleDot, Plus, Pencil, X } from "lucide-react"

const customTableStyles = {
    table: { style: { backgroundColor: 'transparent', borderRadius: '0.75rem', overflow: 'hidden' } },
    headRow: { style: { backgroundColor: '#153753', color: '#f2f8fd', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: 'none', minHeight: '48px' } },
    headCells: { style: { color: '#f2f8fd', paddingLeft: '16px', paddingRight: '16px' } },
    rows: { style: { backgroundColor: '#ffffff', fontSize: '14px', color: '#1f2937', borderBottom: '1px solid #f3f4f6', minHeight: '52px', transition: 'background-color 0.15s' }, highlightOnHoverStyle: { backgroundColor: '#f0f7ff', borderBottomColor: '#e0eeff', outline: 'none' } },
    cells: { style: { paddingLeft: '16px', paddingRight: '16px' } },
    pagination: { style: { backgroundColor: '#ffffff', borderTop: '1px solid #f3f4f6', color: '#374151' } },
}

const EstadosCrud = () => {
    const [Estados, setEstados] = useState([])
    const [selectedEstado, setSelectedEstado] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [refresh, setRefresh] = useState(false)

    const columnsTable = [
        { name: 'ID', selector: row => row.Id_estado, sortable: true, width: '80px' },
        {
            name: 'Nombre',
            selector: row => row.nom_estado,
            sortable: true,
            cell: row => (
                <span className="tw-inline-flex tw-items-center tw-gap-1.5 tw-px-3 tw-py-1 tw-rounded-full tw-bg-primario-50 tw-text-primario-800 tw-text-xs tw-font-semibold">
                    <span className="tw-w-1.5 tw-h-1.5 tw-rounded-full tw-bg-primario-500" />
                    {row.nom_estado}
                </span>
            )
        },
        {
            name: 'Acción',
            cell: (row) => (
                <button
                    title="Editar"
                    className="tw-flex tw-items-center tw-justify-center tw-w-8 tw-h-8 tw-rounded-lg tw-bg-primario-900 tw-text-primario-50 hover:tw-bg-primario-700 tw-transition-all tw-duration-150"
                    onClick={() => updateEstado(row.Id_estado)}
                >
                    <Pencil className="tw-w-3.5 tw-h-3.5" />
                </button>
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
        <div className="tw-p-2">

            {/* Header */}
            <div className="tw-flex tw-items-center tw-justify-between tw-mb-6">
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
            <div className="tw-bg-white tw-rounded-2xl tw-shadow-sm tw-border tw-border-gray-100 tw-overflow-hidden">
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
