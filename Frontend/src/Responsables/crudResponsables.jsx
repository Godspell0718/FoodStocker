import { useState, useEffect } from "react"
import apiAxios from '../api/axiosConfig.js'
import DataTable from "react-data-table-component"
import ResponsablesForm from "./ResponsablesForm.jsx"
import {
    Mail,
    Phone,
    Pencil,
    Users,
    User,
    UserCheck,
    UserX,
    X,
    Inbox,
    Plus,
    Search,
    Shield,
    GraduationCap,
    Warehouse,
    IdCard,
    Filter,
} from 'lucide-react'
import Swal from "sweetalert2"
import { obtenerNombreRol, normalizarRol } from "../utils/roles.js"

const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
};

const CrudResponsables = () => {

    const [responsables, setResponsables] = useState([])
    const [filterText, setFilterText] = useState("")
    const [filtroEstado, setFiltroEstado] = useState("TODOS") // 'TODOS' | 'ACTIVO' | 'INACTIVO'
    const [filtroRol, setFiltroRol] = useState("TODOS")
    const [loading, setLoading] = useState(false)
    const [responsableSeleccionado, setResponsableSeleccionado] = useState(null)
    const [showModal, setShowModal] = useState(false)

    const columnsTable = [
        {
            name: "Usuario",
            selector: row => row.Nom_Responsable,
            sortable: true,
            minWidth: "220px",
            grow: 2,
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-3 tw-py-1.5">
                    <div className="tw-w-9 tw-h-9 tw-rounded-xl tw-bg-gradient-to-br tw-from-primario-900 tw-to-primario-700 tw-text-secundario-400 tw-font-bold tw-text-xs tw-flex tw-items-center tw-justify-center tw-shadow-sm tw-shrink-0 tw-border tw-border-primario-800">
                        {getInitials(row.Nom_Responsable)}
                    </div>
                    <div className="tw-min-w-0">
                        <span className="tw-font-semibold tw-text-slate-800 tw-text-sm tw-block tw-truncate">
                            {row.Nom_Responsable}
                        </span>
                        <span className="tw-text-xs tw-text-slate-400 tw-font-mono md:tw-hidden tw-block">
                            Doc: {row.Doc_Responsable || "—"}
                        </span>
                    </div>
                </div>
            )
        },
        {
            name: "Documento",
            selector: row => row.Doc_Responsable,
            sortable: true,
            width: "140px",
            cell: row => (
                <div className="tw-inline-flex tw-items-center tw-gap-1.5 tw-font-mono tw-text-slate-700 tw-bg-slate-100 tw-px-2.5 tw-py-1 tw-rounded-lg tw-text-xs tw-border tw-border-slate-200/60">
                    <IdCard className="tw-w-3.5 tw-h-3.5 tw-text-slate-400" />
                    <span>{row.Doc_Responsable || "—"}</span>
                </div>
            )
        },
        {
            name: "Correo Electrónico",
            selector: row => row.Cor_Responsable,
            sortable: true,
            minWidth: "220px",
            grow: 2,
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-2 tw-text-slate-600">
                    <div className="tw-w-7 tw-h-7 tw-rounded-lg tw-bg-slate-100 tw-flex tw-items-center tw-justify-center tw-shrink-0 tw-border tw-border-slate-200/50">
                        <Mail className="tw-w-3.5 tw-h-3.5 tw-text-slate-500" />
                    </div>
                    <span className="tw-text-xs tw-font-medium tw-text-slate-700 tw-truncate" title={row.Cor_Responsable}>
                        {row.Cor_Responsable || "—"}
                    </span>
                </div>
            )
        },
        {
            name: "Teléfono",
            selector: row => row.Tel_Responsable,
            sortable: true,
            width: "150px",
            cell: row => (
                <div className="tw-flex tw-items-center tw-gap-2 tw-text-slate-600">
                    <div className="tw-w-7 tw-h-7 tw-rounded-lg tw-bg-slate-100 tw-flex tw-items-center tw-justify-center tw-shrink-0 tw-border tw-border-slate-200/50">
                        <Phone className="tw-w-3.5 tw-h-3.5 tw-text-slate-500" />
                    </div>
                    <span className="tw-text-xs tw-font-medium tw-text-slate-700">
                        {row.Tel_Responsable || "—"}
                    </span>
                </div>
            )
        },
        {
            name: "Tipo / Rol",
            selector: row => obtenerNombreRol(row.Tip_Responsable),
            sortable: true,
            minWidth: "200px",
            cell: row => {
                const code = normalizarRol(row.Tip_Responsable);
                const roleStyles = {
                    ADMIN: { label: "Administrador", icon: Shield, style: "tw-bg-blue-50 tw-text-blue-700 tw-border-blue-200" },
                    GA: { label: "Gestor de almacén", icon: Warehouse, style: "tw-bg-emerald-50 tw-text-emerald-700 tw-border-emerald-200" },
                    IEU: { label: "Instructor encargado", icon: GraduationCap, style: "tw-bg-purple-50 tw-text-purple-700 tw-border-purple-200" },
                    SOL: { label: "Solicitante", icon: UserCheck, style: "tw-bg-amber-50 tw-text-amber-700 tw-border-amber-200" },
                };
                const config = roleStyles[code] || { label: obtenerNombreRol(row.Tip_Responsable), icon: User, style: "tw-bg-slate-50 tw-text-slate-700 tw-border-slate-200" };
                const RoleIcon = config.icon;
                return (
                    <span className={`tw-inline-flex tw-items-center tw-gap-1.5 tw-px-2.5 tw-py-1 tw-rounded-full tw-text-xs tw-font-semibold tw-border tw-whitespace-nowrap ${config.style}`}>
                        <RoleIcon className="tw-w-3.5 tw-h-3.5 tw-shrink-0" />
                        <span>{config.label}</span>
                    </span>
                );
            }
        },
        {
            name: "Estado",
            selector: row => row.Estado || 'ACTIVO',
            sortable: true,
            width: "120px",
            cell: row => {
                const isActivo = (row.Estado || 'ACTIVO') === 'ACTIVO';
                return (
                    <span className={`tw-inline-flex tw-items-center tw-gap-1.5 tw-px-2.5 tw-py-1 tw-rounded-full tw-text-xs tw-font-bold tw-border ${isActivo
                        ? 'tw-bg-emerald-50 tw-text-emerald-700 tw-border-emerald-200'
                        : 'tw-bg-rose-50 tw-text-rose-700 tw-border-rose-200'
                        }`}>
                        <span className={`tw-w-1.5 tw-h-1.5 tw-rounded-full ${isActivo ? 'tw-bg-emerald-500 tw-animate-pulse' : 'tw-bg-rose-500'}`} />
                        {isActivo ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                );
            }
        },
        {
            name: "Acciones",
            right: true,
            width: "110px",
            cell: row => {
                const isActivo = (row.Estado || 'ACTIVO') === 'ACTIVO';
                return (
                    <div className="tw-flex tw-items-center tw-gap-1.5">
                        <button
                            title={isActivo ? "Editar datos del usuario" : "No se puede editar un usuario inactivo"}
                            className={`tw-p-2 tw-rounded-lg tw-transition-all tw-duration-200 ${isActivo
                                ? "tw-bg-primario-900 tw-text-white hover:tw-bg-primario-700 hover:tw-shadow"
                                : "tw-bg-slate-100 tw-text-slate-300 tw-cursor-not-allowed"
                                }`}
                            onClick={() => {
                                if (!isActivo) {
                                    Swal.fire("Edición Bloqueada", "No se puede editar un usuario que se encuentra INACTIVO. Actívelo primero para poder editarlo.", "info");
                                    return;
                                }
                                setResponsableSeleccionado(row);
                                setShowModal(true);
                            }}
                        >
                            <Pencil className="tw-w-4 tw-h-4" />
                        </button>
                        <button
                            title={isActivo ? "Desactivar usuario" : "Activar usuario"}
                            className={`tw-p-2 tw-rounded-lg tw-transition-all tw-duration-200 ${isActivo
                                ? "tw-bg-rose-50 tw-text-rose-600 hover:tw-bg-rose-600 hover:tw-text-white hover:tw-shadow"
                                : "tw-bg-emerald-50 tw-text-emerald-600 hover:tw-bg-emerald-600 hover:tw-text-white hover:tw-shadow"
                                }`}
                            onClick={() => toggleEstadoResponsable(row)}
                        >
                            {isActivo ? <UserX className="tw-w-4 tw-h-4" /> : <UserCheck className="tw-w-4 tw-h-4" />}
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
        const textToSearch = filterText.toLowerCase();
        const nombre = responsable.Nom_Responsable?.toLowerCase() || '';
        const correo = responsable.Cor_Responsable?.toLowerCase() || '';
        const documento = responsable.Doc_Responsable?.toString() || '';
        const estado = (responsable.Estado || 'ACTIVO').toUpperCase();
        const rolNormalizado = normalizarRol(responsable.Tip_Responsable);

        const matchSearch = nombre.includes(textToSearch) ||
            correo.includes(textToSearch) ||
            documento.includes(textToSearch);
        const matchEstado = filtroEstado === "TODOS" || estado === filtroEstado;
        const matchRol = filtroRol === "TODOS" || rolNormalizado === filtroRol;

        return matchSearch && matchEstado && matchRol;
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
                minHeight: '56px',
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

    const paginationComponentOptions = {
        rowsPerPageText: 'Filas por página:',
        rangeSeparatorText: 'de',
        selectAllRowsItem: false,
    };

    const totalActivos = responsables.filter(r => (r.Estado || 'ACTIVO') === 'ACTIVO').length;
    const totalInactivos = responsables.filter(r => r.Estado === 'INACTIVO').length;

    return (
        <div className="tw-min-h-screen tw-bg-slate-50/50 tw-p-6">
            <div className="tw-max-w-7xl tw-mx-auto">
                {/* Header */}
                <div className="tw-mb-6">
                    <div className="tw-flex tw-items-center tw-gap-3 tw-mb-2">
                        <div className="tw-w-10 tw-h-10 tw-bg-primario-900 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-shadow-md">
                            <Users className="tw-w-5 tw-h-5 tw-text-secundario-400" />
                        </div>
                        <div>
                            <h1 className="tw-text-2xl tw-font-bold tw-text-slate-800 tw-m-0">Gestión de Usuarios</h1>
                            <p className="tw-text-slate-500 tw-text-sm tw-m-0">Administra los usuarios y sus roles en el sistema</p>
                        </div>
                    </div>
                </div>

                {/* Métricas / KPIs interactivos */}
                <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-3 tw-gap-4 tw-mb-6">
                    <button
                        type="button"
                        onClick={() => { setFiltroEstado("TODOS"); setFiltroRol("TODOS"); }}
                        className={`tw-bg-white tw-rounded-2xl tw-p-4 tw-border tw-shadow-sm tw-flex tw-items-center tw-justify-between tw-text-left tw-transition-all hover:tw-shadow-md ${filtroEstado === "TODOS" && filtroRol === "TODOS"
                            ? "tw-border-primario-500 tw-ring-2 tw-ring-primario-500/20"
                            : "tw-border-slate-200/80"
                            }`}
                    >
                        <div>
                            <p className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-wider tw-m-0">Total Registrados</p>
                            <h3 className="tw-text-2xl tw-font-bold tw-text-slate-800 tw-mt-1 tw-m-0">{responsables.length}</h3>
                        </div>
                        <div className="tw-w-10 tw-h-10 tw-rounded-xl tw-bg-primario-50 tw-flex tw-items-center tw-justify-center">
                            <Users className="tw-w-5 tw-h-5 tw-text-primario-900" />
                        </div>
                    </button>
                    <button
                        type="button"
                        onClick={() => setFiltroEstado("ACTIVO")}
                        className={`tw-bg-white tw-rounded-2xl tw-p-4 tw-border tw-shadow-sm tw-flex tw-items-center tw-justify-between tw-text-left tw-transition-all hover:tw-shadow-md ${filtroEstado === "ACTIVO"
                            ? "tw-border-emerald-500 tw-ring-2 tw-ring-emerald-500/20"
                            : "tw-border-slate-200/80"
                            }`}
                    >
                        <div>
                            <p className="tw-text-xs tw-font-semibold tw-text-emerald-600 tw-uppercase tw-tracking-wider tw-m-0">Usuarios Activos</p>
                            <h3 className="tw-text-2xl tw-font-bold tw-text-emerald-700 tw-mt-1 tw-m-0">{totalActivos}</h3>
                        </div>
                        <div className="tw-w-10 tw-h-10 tw-rounded-xl tw-bg-emerald-50 tw-flex tw-items-center tw-justify-center">
                            <UserCheck className="tw-w-5 tw-h-5 tw-text-emerald-600" />
                        </div>
                    </button>
                    <button
                        type="button"
                        onClick={() => setFiltroEstado("INACTIVO")}
                        className={`tw-bg-white tw-rounded-2xl tw-p-4 tw-border tw-shadow-sm tw-flex tw-items-center tw-justify-between tw-text-left tw-transition-all hover:tw-shadow-md ${filtroEstado === "INACTIVO"
                            ? "tw-border-rose-500 tw-ring-2 tw-ring-rose-500/20"
                            : "tw-border-slate-200/80"
                            }`}
                    >
                        <div>
                            <p className="tw-text-xs tw-font-semibold tw-text-rose-500 tw-uppercase tw-tracking-wider tw-m-0">Usuarios Inactivos</p>
                            <h3 className="tw-text-2xl tw-font-bold tw-text-rose-700 tw-mt-1 tw-m-0">{totalInactivos}</h3>
                        </div>
                        <div className="tw-w-10 tw-h-10 tw-rounded-xl tw-bg-rose-50 tw-flex tw-items-center tw-justify-center">
                            <UserX className="tw-w-5 tw-h-5 tw-text-rose-600" />
                        </div>
                    </button>
                </div>

                {/* Barra de herramientas y filtros eficientes */}
                <div className="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200/80 tw-shadow-sm tw-p-4 tw-mb-6">
                    <div className="tw-flex tw-flex-col lg:tw-flex-row tw-justify-between tw-items-stretch lg:tw-items-center tw-gap-3">
                        {/* Búsqueda */}
                        <div className="tw-relative tw-w-full lg:tw-w-80">
                            <Search className="tw-absolute tw-left-3 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-slate-400" />
                            <input
                                type="text"
                                className="tw-w-full tw-pl-10 tw-pr-9 tw-py-2 tw-border tw-border-slate-200 tw-rounded-xl tw-bg-slate-50 tw-text-slate-700 tw-text-sm tw-placeholder-slate-400 focus:tw-bg-white focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-primario-500/20 focus:tw-border-primario-500 tw-transition-all"
                                placeholder="Buscar por nombre, correo, doc..."
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
                                    <X className="tw-w-3.5 tw-h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Filtros rápidos: Estado y Rol */}
                        <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-2">
                            {/* Filtro de Rol */}
                            <div className="tw-flex tw-items-center tw-gap-1.5 tw-bg-slate-50 tw-border tw-border-slate-200 tw-rounded-xl tw-px-2.5 tw-py-1.5">
                                <Filter className="tw-w-3.5 tw-h-3.5 tw-text-slate-400" />
                                <select
                                    value={filtroRol}
                                    onChange={(e) => setFiltroRol(e.target.value)}
                                    className="tw-bg-transparent tw-text-xs tw-font-semibold tw-text-slate-700 focus:tw-outline-none tw-cursor-pointer"
                                >
                                    <option value="TODOS">Todos los roles</option>
                                    <option value="ADMIN">Administrador</option>
                                    <option value="GA">Gestor de almacén</option>
                                    <option value="IEU">Instructor encargado</option>
                                    <option value="SOL">Solicitante</option>
                                </select>
                            </div>

                            {/* Filtro de Estado Tabs */}
                            <div className="tw-inline-flex tw-p-1 tw-bg-slate-100 tw-rounded-xl tw-gap-1">
                                <button
                                    type="button"
                                    onClick={() => setFiltroEstado('TODOS')}
                                    className={`tw-px-3 tw-py-1 tw-rounded-lg tw-text-xs tw-font-semibold tw-transition-all ${filtroEstado === 'TODOS' ? 'tw-bg-white tw-text-slate-800 tw-shadow-sm' : 'tw-text-slate-500 hover:tw-text-slate-800'}`}
                                >
                                    Todos
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFiltroEstado('ACTIVO')}
                                    className={`tw-px-3 tw-py-1 tw-rounded-lg tw-text-xs tw-font-semibold tw-transition-all ${filtroEstado === 'ACTIVO' ? 'tw-bg-white tw-text-emerald-700 tw-shadow-sm' : 'tw-text-slate-500 hover:tw-text-slate-800'}`}
                                >
                                    Activos
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFiltroEstado('INACTIVO')}
                                    className={`tw-px-3 tw-py-1 tw-rounded-lg tw-text-xs tw-font-semibold tw-transition-all ${filtroEstado === 'INACTIVO' ? 'tw-bg-white tw-text-rose-700 tw-shadow-sm' : 'tw-text-slate-500 hover:tw-text-slate-800'}`}
                                >
                                    Inactivos
                                </button>
                            </div>

                            {/* Botón Nuevo Responsable */}
                            <button
                                type="button"
                                className="tw-px-4 tw-py-2 tw-bg-primario-900 hover:tw-bg-primario-700 tw-text-white tw-font-semibold tw-rounded-xl tw-shadow-sm hover:tw-shadow tw-transition-all tw-duration-200 tw-flex tw-items-center tw-gap-2 tw-text-xs sm:tw-text-sm"
                                onClick={() => { setResponsableSeleccionado(null); setShowModal(true); }}
                            >
                                <Plus className="tw-w-4 tw-h-4" />
                                <span>Nuevo Responsable</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabla de datos */}
                <div className="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200/80 tw-shadow-sm tw-overflow-hidden">
                    <DataTable
                        columns={columnsTable}
                        data={newListResponsables}
                        keyField="Id_Responsable"
                        pagination
                        paginationPerPage={10}
                        paginationRowsPerPageOptions={[5, 10, 15, 25]}
                        paginationComponentOptions={paginationComponentOptions}
                        highlightOnHover
                        pointerOnHover
                        responsive
                        customStyles={customStyles}
                        progressPending={loading}
                        progressComponent={
                            <div className="tw-py-12 tw-text-center">
                                <div className="tw-inline-block tw-w-8 tw-h-8 tw-border-4 tw-border-primario-200 tw-border-t-primario-900 tw-rounded-full tw-animate-spin"></div>
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
                <div className="tw-mt-3 tw-flex tw-justify-between tw-items-center tw-text-xs tw-text-slate-400">
                    <div>
                        {(filtroEstado !== "TODOS" || filtroRol !== "TODOS" || filterText) && (
                            <button
                                onClick={() => { setFilterText(''); setFiltroEstado('TODOS'); setFiltroRol('TODOS'); }}
                                className="tw-text-primario-900 hover:tw-underline tw-font-semibold"
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                    <div>
                        Mostrando {newListResponsables.length} de {responsables.length} responsables
                    </div>
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