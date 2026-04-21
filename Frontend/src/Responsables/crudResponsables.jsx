import { useState, useEffect } from "react"
import apiAxios from '../api/axiosConfig.js'
import DataTable from "react-data-table-component"
import ResponsablesForm from "./ResponsablesForm.jsx"

const CrudResponsables = () => {

    const [responsables, setResponsables] = useState([])
    const [filterText, setFilterText] = useState("")
    const [loading, setLoading] = useState(false)
    const [responsableSeleccionado, setResponsableSeleccionado] = useState(null)

    const columnsTable = [
        { 
            name: "Nombre", 
            selector: row => row.Nom_Responsable,
            sortable: true,
            grow: 2,
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-3">
                    <div className="tw-w-8 tw-h-8 tw-bg-gradient-to-br tw-from-blue-100 tw-to-amber-100 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                        <i className="fa-solid fa-user tw-text-blue-600 tw-text-sm"></i>
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
                    <i className="fa-regular fa-envelope tw-text-amber-500"></i>
                    <span className="tw-text-slate-600">{row.Cor_Responsable}</span>
                </div>
            )
        },
        { 
            name: "Teléfono", 
            selector: row => row.Tel_Responsable,
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-2">
                    <i className="fa-solid fa-phone tw-text-blue-400 tw-text-xs"></i>
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
            cell: row => (
                <button
                    className="tw-p-2 tw-rounded-lg tw-bg-gradient-to-r tw-from-blue-500 tw-to-blue-600 hover:tw-from-blue-600 hover:tw-to-blue-700 tw-text-white tw-transition-all tw-duration-200 tw-shadow-md hover:tw-shadow-lg"
                    data-bs-toggle="modal"
                    data-bs-target="#responsablesModal"
                    onClick={() => setResponsableSeleccionado(row)}
                >
                    <i className="fa-solid fa-pen tw-text-xs"></i>
                </button>
            )
        }
    ]

    useEffect(() => {
        getAllResponsables()
    }, [])

    const getAllResponsables = async () => {
        setLoading(true)
        try {
            const response = await apiAxios.get('/api/responsables/')
            setResponsables(response.data)
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
        document.getElementById('closeModal')?.click()
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
                        <div className="tw-w-10 tw-h-10 tw-bg-gradient-to-br tw-from-blue-600 tw-to-indigo-600 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-shadow-lg">
                            <i className="fa-solid fa-users tw-text-white tw-text-lg"></i>
                        </div>
                        <h1 className="tw-text-2xl tw-font-bold tw-text-slate-800">Gestión de Usuarios</h1>
                    </div>
                    <p className="tw-text-slate-500 tw-ml-12">Administra los usuarios que gestionan el inventario del sistema</p>
                </div>

                {/* Barra de herramientas */}
                <div className="tw-bg-white tw-rounded-2xl tw-shadow-sm tw-p-4 tw-mb-6">
                    <div className="tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-center tw-gap-4">
                        <div className="tw-relative tw-w-full md:tw-w-96">
                            <i className="fa-solid fa-magnifying-glass tw-absolute tw-left-3 tw-top-1/2 -tw-translate-y-1/2 tw-text-slate-400"></i>
                            <input
                                type="text"
                                className="tw-w-full tw-pl-10 tw-pr-4 tw-py-2.5 tw-border tw-border-slate-200 tw-rounded-xl tw-bg-slate-50 tw-text-slate-700 tw-placeholder-slate-400 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-amber-400 focus:tw-border-transparent tw-transition-all"
                                placeholder="Buscar por nombre, correo o documento..."
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            className="tw-px-5 tw-py-2.5 tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-700 hover:tw-from-blue-700 hover:tw-to-blue-800 tw-text-white tw-font-medium tw-rounded-xl tw-shadow-md hover:tw-shadow-lg tw-transition-all tw-duration-200 tw-flex tw-items-center tw-gap-2"
                            data-bs-toggle="modal"
                            data-bs-target="#responsablesModal"
                            id="closeModal"
                            onClick={() => setResponsableSeleccionado(null)} 
                        >
                            <i className="fa-solid fa-plus"></i>
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
                                <i className="fa-solid fa-inbox tw-text-5xl tw-text-slate-300 tw-mb-3"></i>
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

                {/* Modal */}
                <div className="modal fade" id="responsablesModal" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content tw-rounded-2xl tw-overflow-hidden">
                            <div className="tw-bg-gradient-to-r tw-from-blue-600 tw-to-indigo-600 tw-px-6 tw-py-4">
                                <div className="tw-flex tw-justify-between tw-items-center">
                                    <div className="tw-flex tw-items-center tw-gap-3">
                                        <div className="tw-w-8 tw-h-8 tw-bg-white/20 tw-rounded-lg tw-flex tw-items-center tw-justify-center">
                                            <i className="fa-solid fa-user-plus tw-text-white"></i>
                                        </div>
                                        <h5 className="tw-text-white tw-font-semibold tw-text-lg tw-m-0">
                                            {responsableSeleccionado ? 'Editar Responsable' : 'Nuevo Responsable'}
                                        </h5>
                                    </div>
                                    <button type="button" className="tw-text-white/70 hover:tw-text-white tw-text-2xl tw-leading-none" data-bs-dismiss="modal">
                                        X
                                    </button>
                                </div>
                            </div>
                            <div className="tw-p-6">
                                <ResponsablesForm
                                    hideModal={hideModal}
                                    responsableSeleccionado={responsableSeleccionado}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CrudResponsables