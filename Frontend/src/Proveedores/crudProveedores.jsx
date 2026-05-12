import { useState, useEffect } from "react"
import apiAxios from '../api/axiosConfig.js'
import DataTable from "react-data-table-component"
import ProveedoresForm from "./ProveedoresForm.jsx"

const CrudProveedores = () => {

    const [proveedores, setProveedores] = useState([])
    const [filterText, setFilterText] = useState("")
    const [loading, setLoading] = useState(false)
    const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null)

    const columnsTable = [
        { 
            name: "Nombre", 
            selector: row => row.Nom_Proveedor,
            sortable: true,
            grow: 2,
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-3">
                    <div className="tw-w-8 tw-h-8 tw-bg-gradient-to-br tw-from-blue-100 tw-to-amber-100 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                        <i className="fa-solid fa-building tw-text-blue-600 tw-text-sm"></i>
                    </div>
                    <span className="tw-font-medium tw-text-slate-700">{row.Nom_Proveedor}</span>
                </div>
            )
        },
        { 
            name: "Razón Social", 
            selector: row => row.Raz_Social || "—",
            sortable: true,
            cell: row => (
                <span className="tw-text-slate-500">{row.Raz_Social || "—"}</span>
            )
        },
        { 
            name: "NIT", 
            selector: row => row.Nit_Proveedor || "—",
            sortable: true,
            cell: row => (
                <span className="tw-font-mono tw-text-slate-500">{row.Nit_Proveedor || "—"}</span>
            )
        },
        { 
            name: "Teléfono", 
            selector: row => row.Tel_Proveedor,
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-2">
                    <i className="fa-solid fa-phone tw-text-blue-400 tw-text-xs"></i>
                    <span className="tw-text-slate-600">{row.Tel_Proveedor}</span>
                </div>
            )
        },
        { 
            name: "Correo", 
            selector: row => row.Cor_Proveedor,
            grow: 2,
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-2">
                    <i className="fa-regular fa-envelope tw-text-amber-500"></i>
                    <span className="tw-text-slate-600">{row.Cor_Proveedor}</span>
                </div>
            )
        },
        { 
            name: "Dirección", 
            selector: row => row.Dir_Proveedor || "—",
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-2">
                    <i className="fa-solid fa-location-dot tw-text-blue-400 tw-text-xs"></i>
                    <span className="tw-text-slate-500">{row.Dir_Proveedor || "—"}</span>
                </div>
            )
        },
        {
            name: "Acciones",
            right: true,
            width: "80px",
            cell: row => (
                <button
                    className="tw-p-2 tw-rounded-lg tw-bg-gradient-to-r tw-from-blue-500 tw-to-blue-600 hover:tw-from-blue-600 hover:tw-to-blue-700 tw-text-white tw-transition-all tw-duration-200 tw-shadow-md hover:tw-shadow-lg"
                    data-bs-toggle="modal"
                    data-bs-target="#modalProveedores"
                    onClick={() => setProveedorSeleccionado(row)}
                >
                    <i className="fa-solid fa-pen tw-text-xs"></i>
                </button>
            )
        }
    ]

    useEffect(() => {
        getAllProveedores()
    }, [])

    const getAllProveedores = async () => {
        setLoading(true)
        try {
            const response = await apiAxios.get('/api/proveedores/')
            setProveedores(response.data)
        } catch (error) {
            console.error("Error al cargar proveedores:", error)
        } finally {
            setLoading(false)
        }
    }

    const newListProveedores = proveedores.filter(proveedor => {
        const textToSearch = filterText.toLowerCase()
        const nombre = proveedor.Nom_Proveedor?.toLowerCase() || ''
        const razonSocial = proveedor.Raz_Social?.toLowerCase() || ''
        const nit = proveedor.Nit_Proveedor?.toString() || ''
        const correo = proveedor.Cor_Proveedor?.toLowerCase() || ''
        return nombre.includes(textToSearch) || 
               razonSocial.includes(textToSearch) || 
               nit.includes(textToSearch) ||
               correo.includes(textToSearch)
    })

    const hideModal = () => {
        document.getElementById('closeModalProveedor')?.click()
        setProveedorSeleccionado(null)
        getAllProveedores()
    }

    // Estilos personalizados para DataTable
    const customStyles = {
        headRow: {
            style: {
                backgroundColor: '#1e3a5f',
                borderRadius: '12px 12px 0 0',
                minHeight: '48px',
            },
        },
        headCells: {
            style: {
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                paddingTop: '12px',
                paddingBottom: '12px',
            },
        },
        rows: {
            style: {
                minHeight: '48px',
                borderRadius: '6px',
                marginTop: '2px',
                marginBottom: '2px',
                '&:hover': {
                    backgroundColor: '#fef3c7',
                },
            },
        },
        pagination: {
            style: {
                borderTop: '1px solid #e2e8f0',
                paddingTop: '10px',
                paddingBottom: '10px',
                minHeight: '52px',
            },
        },
    }

    return (
        <div className="tw-h-screen tw-flex tw-flex-col tw-bg-gradient-to-br tw-from-slate-50 tw-to-blue-50 tw-overflow-hidden">
            <div className="tw-flex-1 tw-flex tw-flex-col tw-overflow-hidden tw-p-6">
                
                {/* Header */}
                <div className="tw-flex-shrink-0 tw-mb-4">
                    <div className="tw-flex tw-items-center tw-gap-3 tw-mb-1">
                        <div className="tw-w-9 tw-h-9 tw-bg-gradient-to-br tw-from-blue-600 tw-to-indigo-600 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-shadow-lg">
                            <i className="fa-solid fa-truck tw-text-white tw-text-base"></i>
                        </div>
                        <h1 className="tw-text-xl tw-font-bold tw-text-slate-800">Gestión de Proveedores</h1>
                    </div>
                    <p className="tw-text-slate-500 tw-text-sm tw-ml-12">Administra los proveedores que suministran insumos al inventario</p>
                </div>

                {/* Barra de herramientas */}
                <div className="tw-flex-shrink-0 tw-bg-white tw-rounded-xl tw-shadow-sm tw-p-3 tw-mb-4">
                    <div className="tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-center tw-gap-3">
                        <div className="tw-relative tw-w-full md:tw-w-80">
                            <i className="fa-solid fa-magnifying-glass tw-absolute tw-left-3 tw-top-1/2 -tw-translate-y-1/2 tw-text-slate-400 tw-text-sm"></i>
                            <input
                                type="text"
                                className="tw-w-full tw-pl-9 tw-pr-3 tw-py-2 tw-border tw-border-slate-200 tw-rounded-lg tw-bg-slate-50 tw-text-slate-700 tw-text-sm tw-placeholder-slate-400 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-amber-400 focus:tw-border-transparent tw-transition-all"
                                placeholder="Buscar por nombre, razón social, NIT o correo..."
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            className="tw-px-4 tw-py-2 tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-700 hover:tw-from-blue-700 hover:tw-to-blue-800 tw-text-white tw-font-medium tw-rounded-lg tw-shadow-md hover:tw-shadow-lg tw-transition-all tw-duration-200 tw-flex tw-items-center tw-gap-2 tw-text-sm"
                            data-bs-toggle="modal"
                            data-bs-target="#modalProveedores"
                            id="closeModalProveedor"
                            onClick={() => setProveedorSeleccionado(null)}
                        >
                            <i className="fa-solid fa-plus tw-text-xs"></i>
                            <span>Nuevo Proveedor</span>
                        </button>
                    </div>
                </div>

                {/* Tabla de datos */}
                <div className="tw-flex-1 tw-bg-white tw-rounded-xl tw-shadow-lg tw-overflow-hidden tw-flex tw-flex-col">
                    <div className="tw-flex-1">
                        <DataTable
                            title="Proveedores"
                            columns={columnsTable}
                            data={newListProveedores}
                            keyField="Id_Proveedor"
                            pagination
                            paginationPerPage={15}
                            paginationRowsPerPageOptions={[10, 15, 20, 25, 30]}
                            highlightOnHover
                            pointerOnHover
                            responsive
                            customStyles={customStyles}
                            progressPending={loading}
                            progressComponent={
                                <div className="tw-py-8 tw-text-center">
                                    <div className="tw-inline-block tw-w-6 tw-h-6 tw-border-3 tw-border-blue-200 tw-border-t-blue-600 tw-rounded-full tw-animate-spin"></div>
                                    <p className="tw-mt-2 tw-text-slate-500 tw-text-sm">Cargando proveedores...</p>
                                </div>
                            }
                            noDataComponent={
                                <div className="tw-py-8 tw-text-center">
                                    <i className="fa-solid fa-inbox tw-text-4xl tw-text-slate-300 tw-mb-2"></i>
                                    <p className="tw-text-slate-400">No se encontraron proveedores</p>
                                </div>
                            }
                            fixedHeader
                            fixedHeaderScrollHeight="calc(100vh - 300px)"
                        />
                    </div>
                </div>

                {/* Información de registros */}
                <div className="tw-flex-shrink-0 tw-mt-2 tw-text-right">
                    <p className="tw-text-xs tw-text-slate-400">
                        Mostrando {newListProveedores.length} de {proveedores.length} proveedores
                    </p>
                </div>

                {/* Modal */}
                <div className="modal fade" id="modalProveedores" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content tw-rounded-xl tw-overflow-hidden">
                            <div className="tw-bg-gradient-to-r tw-from-blue-600 tw-to-indigo-600 tw-px-5 tw-py-3">
                                <div className="tw-flex tw-justify-between tw-items-center">
                                    <div className="tw-flex tw-items-center tw-gap-2">
                                        <div className="tw-w-7 tw-h-7 tw-bg-white/20 tw-rounded-lg tw-flex tw-items-center tw-justify-center">
                                            <i className="fa-solid fa-truck tw-text-white tw-text-sm"></i>
                                        </div>
                                        <h5 className="tw-text-white tw-font-semibold tw-text-base tw-m-0">
                                            {proveedorSeleccionado ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                                        </h5>
                                    </div>
                                    <button type="button" className="tw-text-white/70 hover:tw-text-white tw-text-xl tw-leading-none" data-bs-dismiss="modal">
                                        ×
                                    </button>
                                </div>
                            </div>
                            <div className="tw-p-5">
                                <ProveedoresForm
                                    hideModal={hideModal}
                                    proveedorSeleccionado={proveedorSeleccionado}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CrudProveedores