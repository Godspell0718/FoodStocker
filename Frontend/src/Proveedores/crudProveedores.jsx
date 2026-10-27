import { useState, useEffect } from "react"
import apiAxios from '../api/axiosConfig.js'
import DataTable from "react-data-table-component"
import ProveedoresForm from "./ProveedoresForm.jsx"
import Swal from "sweetalert2"
import { 
    Truck, Building2, Hash, Phone, Mail, MapPin,
    Plus, Search, Pencil, ToggleLeft, ToggleRight, X, Inbox 
} from "lucide-react"

const CrudProveedores = () => {

    const [proveedores, setProveedores] = useState([])
    const [filterText, setFilterText] = useState("")
    const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)

    const columnsTable = [
        { 
            name: "Nombre", 
            selector: row => row.Nom_Proveedor,
            sortable: true,
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-3">
                    <div className="tw-w-8 tw-h-8 tw-bg-blue-100 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                        <Truck className="tw-w-4 tw-h-4 tw-text-blue-600" />
                    </div>
                    <span className="tw-font-medium tw-text-slate-700">{row.Nom_Proveedor}</span>
                </div>
            )
        },
        { 
            name: "Razón Social", 
            selector: row => row.Raz_Social,
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-2">
                    <Building2 className="tw-w-3.5 tw-h-3.5 tw-text-slate-400" />
                    <span className="tw-text-slate-600">{row.Raz_Social}</span>
                </div>
            )
        },
        { 
            name: "NIT", 
            selector: row => row.Nit_Proveedor,
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-2">
                    <Hash className="tw-w-3.5 tw-h-3.5 tw-text-slate-400" />
                    <span className="tw-font-mono tw-text-slate-600">{row.Nit_Proveedor}</span>
                </div>
            )
        },
        { 
            name: "Teléfono", 
            selector: row => row.Tel_Proveedor,
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-2">
                    <Phone className="tw-w-3.5 tw-h-3.5 tw-text-slate-400" />
                    <span className="tw-text-slate-600">{row.Tel_Proveedor}</span>
                </div>
            )
        },
        { 
            name: "Correo", 
            selector: row => row.Cor_Proveedor,
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-2">
                    <Mail className="tw-w-3.5 tw-h-3.5 tw-text-slate-400" />
                    <span className="tw-text-slate-600">{row.Cor_Proveedor}</span>
                </div>
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
                            title={isActivo ? "Editar" : "No se puede editar un registro inactivo"}
                            className={`tw-p-1.5 tw-rounded-lg tw-transition-all tw-duration-200 tw-shadow-sm ${
                                isActivo
                                    ? "tw-bg-primario-900 tw-text-white hover:tw-bg-primario-700"
                                    : "tw-bg-slate-200 tw-text-slate-400 tw-cursor-not-allowed"
                            }`}
                            onClick={() => {
                                if (!isActivo) {
                                    Swal.fire("Edición Bloqueada", "No se puede editar un proveedor que se encuentra INACTIVO. Actívelo primero para poder editarlo.", "info");
                                    return;
                                }
                                setProveedorSeleccionado(row)
                                setShowModal(true)
                            }}
                        >
                            <Pencil className="tw-w-3.5 tw-h-3.5" />
                        </button>
                        <button
                            title={isActivo ? "Inactivar Proveedor" : "Activar Proveedor"}
                            className={`tw-p-1.5 tw-rounded-lg tw-transition-all tw-duration-200 tw-shadow-sm ${
                                isActivo 
                                    ? "tw-bg-amber-50 tw-text-amber-600 hover:tw-bg-amber-600 hover:tw-text-white" 
                                    : "tw-bg-emerald-50 tw-text-emerald-600 hover:tw-bg-emerald-600 hover:tw-text-white"
                            }`}
                            onClick={() => toggleEstadoProveedor(row)}
                        >
                            {isActivo ? <ToggleRight className="tw-w-4 tw-h-4" /> : <ToggleLeft className="tw-w-4 tw-h-4" />}
                        </button>
                    </div>
                );
            }
        }
    ];

    useEffect(() => {
        getAllProveedores()
    }, [])

    const toggleEstadoProveedor = async (row) => {
        const isActivo = (row.Estado || 'ACTIVO') === 'ACTIVO';
        const accion = isActivo ? "Inactivar" : "Activar";
        const confirm = await Swal.fire({
            title: `¿${accion} proveedor?`,
            text: isActivo 
                ? "El proveedor pasará a estado INACTIVO (no se mostrará para nuevas entradas de insumos)"
                : "El proveedor pasará a estado ACTIVO",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: `Sí, ${accion.toLowerCase()}`,
            cancelButtonText: "Cancelar",
            confirmButtonColor: isActivo ? "#f59e0b" : "#10b981",
            cancelButtonColor: "#153753",
        })

        if (confirm.isConfirmed) {
            try {
                await apiAxios.delete(`/api/proveedores/${row.Id_Proveedor}`)
                Swal.fire({
                    title: "Completado",
                    text: `El proveedor ahora está ${isActivo ? 'INACTIVO' : 'ACTIVO'}`,
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                })
                getAllProveedores()
            } catch (error) {
                Swal.fire("Error", error.response?.data?.message || "No se pudo cambiar el estado del proveedor", "error")
            }
        }
    }

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
        const nombre = proveedor.Nom_Proveedor?.toLowerCase() || ""
        const razon = proveedor.Raz_Social?.toLowerCase() || ""
        const nit = proveedor.Nit_Proveedor?.toString().toLowerCase() || ""
        const correo = proveedor.Cor_Proveedor?.toLowerCase() || ""
        return nombre.includes(textToSearch) || razon.includes(textToSearch) || nit.includes(textToSearch) || correo.includes(textToSearch)
    })

    const hideModal = () => {
        setShowModal(false)
        setProveedorSeleccionado(null)
        getAllProveedores()
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

    const totalActivos = proveedores.filter(p => (p.Estado || 'ACTIVO') === 'ACTIVO').length;
    const totalInactivos = proveedores.filter(p => p.Estado === 'INACTIVO').length;

    return (
        <div className="tw-min-h-screen tw-bg-slate-50/50 tw-p-6">
            <div className="tw-max-w-7xl tw-mx-auto">
                {/* Header */}
                <div className="tw-mb-6">
                    <div className="tw-flex tw-items-center tw-gap-3 tw-mb-2">
                        <div className="tw-w-10 tw-h-10 tw-bg-primario-900 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-shadow-md">
                            <Truck className="tw-w-5 tw-h-5 tw-text-secundario-400" />
                        </div>
                        <div>
                            <h1 className="tw-text-2xl tw-font-bold tw-text-slate-800 tw-m-0">Gestión de Proveedores</h1>
                            <p className="tw-text-slate-500 tw-text-sm tw-m-0">Administra los proveedores de insumos y productos alimenticios</p>
                        </div>
                    </div>
                </div>

                {/* Métricas / KPIs rápidos */}
                <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-3 tw-gap-4 tw-mb-6">
                    <div className="tw-bg-white tw-rounded-2xl tw-p-4 tw-border tw-border-slate-200/80 tw-shadow-sm tw-flex tw-items-center tw-justify-between">
                        <div>
                            <p className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-wider tw-m-0">Total Proveedores</p>
                            <h3 className="tw-text-2xl tw-font-bold tw-text-slate-800 tw-mt-1 tw-m-0">{proveedores.length}</h3>
                        </div>
                        <div className="tw-w-10 tw-h-10 tw-rounded-xl tw-bg-primario-50 tw-flex tw-items-center tw-justify-center">
                            <Truck className="tw-w-5 tw-h-5 tw-text-primario-900" />
                        </div>
                    </div>
                    <div className="tw-bg-white tw-rounded-2xl tw-p-4 tw-border tw-border-slate-200/80 tw-shadow-sm tw-flex tw-items-center tw-justify-between">
                        <div>
                            <p className="tw-text-xs tw-font-semibold tw-text-emerald-600 tw-uppercase tw-tracking-wider tw-m-0">Proveedores Activos</p>
                            <h3 className="tw-text-2xl tw-font-bold tw-text-emerald-700 tw-mt-1 tw-m-0">{totalActivos}</h3>
                        </div>
                        <div className="tw-w-10 tw-h-10 tw-rounded-xl tw-bg-emerald-50 tw-flex tw-items-center tw-justify-center">
                            <Building2 className="tw-w-5 tw-h-5 tw-text-emerald-600" />
                        </div>
                    </div>
                    <div className="tw-bg-white tw-rounded-2xl tw-p-4 tw-border tw-border-slate-200/80 tw-shadow-sm tw-flex tw-items-center tw-justify-between">
                        <div>
                            <p className="tw-text-xs tw-font-semibold tw-text-rose-500 tw-uppercase tw-tracking-wider tw-m-0">Proveedores Inactivos</p>
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
                                placeholder="Buscar por nombre, NIT, razón social..."
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
                                setProveedorSeleccionado(null)
                                setShowModal(true)
                            }}
                        >
                            <Plus className="tw-w-4 tw-h-4" />
                            <span>Nuevo Proveedor</span>
                        </button>
                    </div>
                </div>

                {/* Tabla de datos */}
                <div className="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200/80 tw-shadow-sm tw-overflow-hidden">
                    <DataTable
                        columns={columnsTable}
                        data={newListProveedores}
                        keyField="Id_Proveedor"
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
                                <p className="tw-mt-3 tw-text-slate-500">Cargando proveedores...</p>
                            </div>
                        }
                        noDataComponent={
                            <div className="tw-py-12 tw-text-center">
                                <Inbox className="tw-w-12 tw-h-12 tw-text-slate-300 tw-mx-auto tw-mb-3" />
                                <p className="tw-text-slate-400">No se encontraron proveedores</p>
                            </div>
                        }
                    />
                </div>

                {/* Información de registros */}
                <div className="tw-mt-3 tw-text-right">
                    <p className="tw-text-xs tw-text-slate-400">
                        Mostrando {newListProveedores.length} de {proveedores.length} proveedores
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
                                            <Truck className="tw-w-5 tw-h-5 tw-text-secundario-400" />
                                        </div>
                                        <h5 className="tw-text-white tw-font-semibold tw-text-lg tw-m-0">
                                            {proveedorSeleccionado ? 'Editar Proveedor' : 'Nuevo Proveedor'}
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
                                <ProveedoresForm
                                    hideModal={hideModal}
                                    proveedorSeleccionado={proveedorSeleccionado}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CrudProveedores