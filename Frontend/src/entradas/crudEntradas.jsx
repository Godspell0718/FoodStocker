import { useState, useEffect } from "react"
import apiNode from "../api/axiosConfig.js"
import DataTable from "react-data-table-component"
import { EntradasForm } from "./entradasForm.jsx"
import { 
    Warehouse, Box, Pen, Plus, Search, 
    Inbox, AlertCircle, X, Boxes, Trash2
} from "lucide-react"
import Swal from "sweetalert2"
import { tienePresentacion } from "../utils/inventario.js"

export const CrudEntradas = () => {

    const [entradas, setEntradas] = useState([])
    const [filterText, setFilterText] = useState("")
    const [filtroEstado, setFiltroEstado] = useState("TODOS")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [entradaSeleccionada, setEntradaSeleccionada] = useState(null)
    const [showModal, setShowModal] = useState(false)

    const columnsTable = [
        {
            name: "Lote",
            selector: row => row.Lote,
            sortable: true,
            width: "150px",
            cell: row => (
                <span className="tw-font-medium tw-text-slate-700">{row.Lote}</span>
            )
        },
        {

            name: "Fecha Venc.",
            selector: row =>
                row.Fec_Ven_Entrada
                    ? (() => {
                        const [year, month, day] = row.Fec_Ven_Entrada.split('-');
                        return `${day}/${month}/${year}`;
                    })()
                    : "N/A",
            sortable: true,
            width: "140px",
            cell: row => {
                if (!row.Fec_Ven_Entrada) {
                    return (
                        <span className="tw-inline-flex tw-items-center tw-gap-1.5 tw-px-2 tw-py-0.5 tw-rounded-md tw-bg-slate-100 tw-text-slate-500 tw-text-xs tw-font-semibold tw-border tw-border-slate-200">
                            <i className="fa-regular fa-calendar-xmark tw-text-xs tw-text-slate-400"></i>
                            N/A
                        </span>
                    );
                }

                const [year, month, day] = row.Fec_Ven_Entrada.split('-');
                const fechaVenc = new Date(Date.UTC(year, month - 1, day));
                const hoy = new Date();
                const hoyUTC = new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()));

                const diasRestantes = Math.ceil((fechaVenc - hoyUTC) / (1000 * 60 * 60 * 24));

                let colorClase = "tw-text-slate-600";
                if (diasRestantes <= 0) colorClase = "tw-text-red-600 tw-font-medium";
                else if (diasRestantes <= 30) colorClase = "tw-text-amber-600 tw-font-medium";
                else colorClase = "tw-text-green-600";

                const fechaMostrada = `${day}/${month}/${year}`;

                return (
                    <div className="tw-flex tw-items-center tw-gap-2">
                        <i className={`fa-regular fa-calendar tw-text-xs ${diasRestantes <= 0 ? 'tw-text-red-500' :
                            diasRestantes <= 30 ? 'tw-text-amber-500' :
                                'tw-text-slate-400'
                            }`}></i>
                        <span className={colorClase}>
                            {fechaMostrada}
                        </span>
                    </div>
                );
            }
        },
        {
            name: "Insumo",
            selector: row => row.insumo?.Nom_Insumo || `ID ${row.Id_Insumos}`,
            sortable: true,
            cell: row => {
                const nombre = row.insumo?.Nom_Insumo || `Insumo #${row.Id_Insumos}`;
                const tienePres = tienePresentacion(row.insumo);
                const cant = tienePres ? Number(row.insumo.Can_Presentacion).toLocaleString("es-CO") : null;
                const unidad = (row.insumo?.Uni_medida || row.Uni_medida || "").toLowerCase();

                return (
                    <span className="tw-font-medium tw-text-slate-800">
                        {nombre}
                        {tienePres && (
                            <span className="tw-text-slate-500 tw-font-normal tw-text-xs tw-ml-1">
                                ({cant} {unidad})
                            </span>
                        )}
                    </span>
                );
            }
        },
        {
            name: "Unidad Med.",
            selector: row => (row.Uni_medida || "—").toLowerCase(),
            sortable: true,
            width: "80px",
            cell: row => (
                <span className="tw-px-2 tw-py-1 tw-bg-slate-100 tw-rounded-lg tw-text-xs tw-font-medium tw-text-slate-600">
                    {row.Uni_medida ? row.Uni_medida.toLowerCase() : "—"}
                </span>
            )
        },
        {
            name: "Proveedor",
            selector: row => row.proveedor?.Nom_Proveedor || `ID ${row.Id_Proveedor}`,
            sortable: true,
            cell: row => (
                <span className="tw-text-slate-600">
                    {row.proveedor?.Nom_Proveedor || `Proveedor #${row.Id_Proveedor}`}
                </span>
            )
        },
        {
            name: "Cantidad",
            selector: row => `${row.Can_Inicial - row.Can_Salida} / ${row.Can_Inicial}`,
            sortable: true,
            width: "120px",
            cell: row => {
                const disponible = row.Can_Inicial - row.Can_Salida
                const porcentaje = (disponible / row.Can_Inicial) * 100

                let colorBarra = "tw-bg-green-500"
                if (porcentaje <= 25) colorBarra = "tw-bg-red-500"
                else if (porcentaje <= 50) colorBarra = "tw-bg-amber-500"

                return (
                    <div className="tw-w-full">
                        <div className="tw-flex tw-justify-between tw-text-xs tw-mb-1">
                            <span className="tw-font-medium tw-text-slate-700">{disponible} {row.Uni_medida || ''}</span>
                            <span className="tw-text-slate-400">/ {row.Can_Inicial}</span>
                        </div>
                        <div className="tw-w-full tw-bg-slate-200 tw-rounded-full tw-h-1.5">
                            <div
                                className={`${colorBarra} tw-h-1.5 tw-rounded-full tw-transition-all`}
                                style={{ width: `${porcentaje}%` }}
                            ></div>
                        </div>
                    </div>
                )
            }
        },
        {
            name: "Vlr Unitario",
            selector: row => (row.Vlr_Unitario != null && row.Vlr_Unitario !== "") ? Number(row.Vlr_Unitario) : 0,
            sortable: true,
            width: "110px",
            cell: row => {
                const val = (row.Vlr_Unitario != null && row.Vlr_Unitario !== "") ? Number(row.Vlr_Unitario) : null;
                return (
                    <span className="tw-font-mono tw-text-slate-600">
                        {val !== null ? `$${val.toLocaleString("es-CO")}` : "—"}
                    </span>
                );
            }
        },
        {
            name: "Vlr Total",
            selector: row => {
                if (row.Vlr_Total != null && row.Vlr_Total !== "") return Number(row.Vlr_Total);
                if (row.Vlr_Unitario != null && row.Can_Inicial != null) return Number(row.Vlr_Unitario) * Number(row.Can_Inicial);
                return 0;
            },
            sortable: true,
            width: "110px",
            cell: row => {
                const total = (row.Vlr_Total != null && row.Vlr_Total !== "")
                    ? Number(row.Vlr_Total)
                    : (row.Vlr_Unitario != null && row.Can_Inicial != null
                        ? Number(row.Vlr_Unitario) * Number(row.Can_Inicial)
                        : null);

                return (
                    <span className="tw-font-mono tw-font-medium tw-text-slate-700">
                        {total !== null ? `$${total.toLocaleString("es-CO")}` : "—"}
                    </span>
                );
            }
        },
        {
            name: "Estado",
            sortable: true,
            width: "130px",
            cell: row => {
                const estadosConfig = {
                    STOCK: {
                        color: "tw-bg-green-100 tw-text-green-700",
                        icono: "fa-box",
                        label: "En Stock"
                    },
                    AGOTADO: {
                        color: "tw-bg-red-100 tw-text-red-700",
                        icono: "fa-box-open",
                        label: "Agotado"
                    },
                    VENCIDO: {
                        color: "tw-bg-amber-100 tw-text-amber-700",
                        icono: "fa-clock",
                        label: "Vencido"
                    }
                }
                const config = estadosConfig[row.Estado] || {
                    color: "tw-bg-slate-100 tw-text-slate-700",
                    icono: "fa-question",
                    label: row.Estado
                }

                return (
                    <span className={`tw-px-2 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium tw-flex tw-items-center tw-gap-1 tw-w-fit ${config.color}`}>
                        {row.Estado === 'VENCIDO' ? <AlertCircle className="tw-w-3 tw-h-3" /> : <Box className="tw-w-3 tw-h-3" />}
                        <span>{config.label}</span>
                    </span>
                )
            }
        },
        {
            name: "Pasante",
            selector: row => row.pasante?.Nom_Responsable || `ID ${row.Id_Pasante}`,
            sortable: true,
            cell: row => (
                <span className="tw-text-slate-600">
                    {row.pasante?.Nom_Responsable || `Pasante #${row.Id_Pasante}`}
                </span>
            )
        },
        {
            name: "Instructor",
            selector: row => row.instructor?.Nom_Responsable || `ID ${row.Id_Instructor}`,
            sortable: true,
            cell: row => (
                <span className="tw-text-slate-600">
                    {row.instructor?.Nom_Responsable || `Instructor #${row.Id_Instructor}`}
                </span>
            )
        },
        {
            name: "Acciones",
            right: true,
            width: "100px",
            cell: row => {
                const isUsed = row.Can_Salida > 0;
                return (
                    <div className="tw-flex tw-gap-2">
                        <button
                            title={isUsed ? "Entrada utilizada (No editable)" : "Editar"}
                            className={`tw-p-1.5 tw-rounded-lg tw-transition-all tw-duration-200 tw-shadow-sm ${
                                isUsed 
                                    ? "tw-bg-slate-200 tw-text-slate-400 tw-cursor-not-allowed" 
                                    : "tw-bg-primario-900 tw-text-white hover:tw-bg-primario-700"
                            }`}
                            onClick={() => {
                                if (isUsed) {
                                    Swal.fire("Edición Bloqueada", "No se puede editar esta entrada porque ya registra salidas de insumo.", "info");
                                } else {
                                    setEntradaSeleccionada(row);
                                    setShowModal(true);
                                }
                            }}
                        >
                            <Pen className="tw-w-3.5 tw-h-3.5" />
                        </button>
                        <button
                            title="Eliminar"
                            className="tw-p-1.5 tw-rounded-lg tw-bg-red-50 tw-text-red-500 hover:tw-bg-red-500 hover:tw-text-white tw-transition-all tw-duration-200 tw-shadow-sm"
                            onClick={() => deleteEntrada(row.Id_Entradas)}
                        >
                            <Trash2 className="tw-w-3.5 tw-h-3.5" />
                        </button>
                    </div>
                );
            },
            ignoreRowClick: true,
            button: true
        }
    ]

    const getAllEntradas = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await apiNode.get("/api/entradas/")
            setEntradas(Array.isArray(response.data) ? response.data : [])
        } catch {
            setError("Error al cargar entradas")
        } finally {
            setLoading(false)
        }
    }

    const deleteEntrada = async (id) => {
        const confirm = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción eliminará la entrada permanentemente",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#153753",
        })

        if (confirm.isConfirmed) {
            try {
                await apiNode.delete(`/api/entradas/${id}`)
                Swal.fire({
                    title: "Eliminado",
                    text: "La entrada ha sido eliminada correctamente",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                })
                getAllEntradas()
            } catch (error) {
                Swal.fire("Error", error.response?.data?.message || "No se pudo eliminar la entrada", "error")
            }
        }
    }

    useEffect(() => {
        getAllEntradas()
    }, [])

    const filtered = entradas.filter(e => {
        if (filtroEstado !== "TODOS" && e.Estado !== filtroEstado) return false;
        const textToSearch = filterText.toLowerCase()
        const lote = e.Lote?.toLowerCase() || ''
        const insumo = e.insumo?.Nom_Insumo?.toLowerCase() || ''
        const proveedor = e.proveedor?.Nom_Proveedor?.toLowerCase() || ''
        const pasante = e.pasante?.Nom_Responsable?.toLowerCase() || ''
        const instructor = e.instructor?.Nom_Responsable?.toLowerCase() || ''

        return lote.includes(textToSearch) ||
            insumo.includes(textToSearch) ||
            proveedor.includes(textToSearch) ||
            pasante.includes(textToSearch) ||
            instructor.includes(textToSearch)
    })

    const countStock = entradas.filter(e => e.Estado === 'STOCK').length;
    const countAgotado = entradas.filter(e => e.Estado === 'AGOTADO').length;
    const countVencido = entradas.filter(e => e.Estado === 'VENCIDO').length;

    const hideModal = () => {
        setShowModal(false)
        setEntradaSeleccionada(null)
        getAllEntradas()
    }

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

    return (
        <div className="tw-min-h-screen tw-bg-slate-50/50 tw-p-6">
            <div className="tw-max-w-7xl tw-mx-auto">
                <div className="tw-mb-6">
                    <div className="tw-flex tw-items-center tw-gap-3 tw-mb-2">
                        <div className="tw-w-10 tw-h-10 tw-bg-primario-900 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-shadow-md">
                            <Warehouse className="tw-w-5 tw-h-5 tw-text-secundario-400" />
                        </div>
                        <div>
                            <h1 className="tw-text-2xl tw-font-bold tw-text-slate-800 tw-m-0">Gestión de Entradas</h1>
                            <p className="tw-text-slate-500 tw-text-sm tw-m-0">Administra las entradas de inventario, lotes y stock disponible</p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="tw-mb-4 tw-p-4 tw-bg-red-50 tw-border tw-border-red-200 tw-rounded-xl tw-flex tw-items-center tw-gap-3">
                        <AlertCircle className="tw-w-5 tw-h-5 tw-text-red-500" />
                        <span className="tw-text-red-700 tw-text-sm">{error}</span>
                    </div>
                )}

                {/* Métricas / KPIs rápidos interactivos */}
                <div className="tw-grid tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-4 tw-mb-6">
                    <button
                        type="button"
                        onClick={() => setFiltroEstado("TODOS")}
                        className={`tw-bg-white tw-rounded-2xl tw-p-4 tw-border tw-text-left tw-transition-all ${filtroEstado === "TODOS" ? "tw-border-primario-500 tw-ring-2 tw-ring-primario-500/20 tw-shadow-md" : "tw-border-slate-200/80 tw-shadow-sm hover:tw-border-slate-300"}`}
                    >
                        <p className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-wider tw-m-0">Total Entradas</p>
                        <div className="tw-flex tw-items-center tw-justify-between tw-mt-2">
                            <h3 className="tw-text-2xl tw-font-bold tw-text-slate-800 tw-m-0">{entradas.length}</h3>
                            <div className="tw-w-9 tw-h-9 tw-rounded-xl tw-bg-primario-50 tw-flex tw-items-center tw-justify-center">
                                <Warehouse className="tw-w-4 tw-h-4 tw-text-primario-900" />
                            </div>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setFiltroEstado("STOCK")}
                        className={`tw-bg-white tw-rounded-2xl tw-p-4 tw-border tw-text-left tw-transition-all ${filtroEstado === "STOCK" ? "tw-border-emerald-500 tw-ring-2 tw-ring-emerald-500/20 tw-shadow-md" : "tw-border-slate-200/80 tw-shadow-sm hover:tw-border-slate-300"}`}
                    >
                        <p className="tw-text-xs tw-font-semibold tw-text-emerald-600 tw-uppercase tw-tracking-wider tw-m-0">En Stock</p>
                        <div className="tw-flex tw-items-center tw-justify-between tw-mt-2">
                            <h3 className="tw-text-2xl tw-font-bold tw-text-emerald-700 tw-m-0">{countStock}</h3>
                            <div className="tw-w-9 tw-h-9 tw-rounded-xl tw-bg-emerald-50 tw-flex tw-items-center tw-justify-center">
                                <Box className="tw-w-4 tw-h-4 tw-text-emerald-600" />
                            </div>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setFiltroEstado("AGOTADO")}
                        className={`tw-bg-white tw-rounded-2xl tw-p-4 tw-border tw-text-left tw-transition-all ${filtroEstado === "AGOTADO" ? "tw-border-rose-500 tw-ring-2 tw-ring-rose-500/20 tw-shadow-md" : "tw-border-slate-200/80 tw-shadow-sm hover:tw-border-slate-300"}`}
                    >
                        <p className="tw-text-xs tw-font-semibold tw-text-rose-500 tw-uppercase tw-tracking-wider tw-m-0">Agotadas</p>
                        <div className="tw-flex tw-items-center tw-justify-between tw-mt-2">
                            <h3 className="tw-text-2xl tw-font-bold tw-text-rose-700 tw-m-0">{countAgotado}</h3>
                            <div className="tw-w-9 tw-h-9 tw-rounded-xl tw-bg-rose-50 tw-flex tw-items-center tw-justify-center">
                                <Boxes className="tw-w-4 tw-h-4 tw-text-rose-600" />
                            </div>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setFiltroEstado("VENCIDO")}
                        className={`tw-bg-white tw-rounded-2xl tw-p-4 tw-border tw-text-left tw-transition-all ${filtroEstado === "VENCIDO" ? "tw-border-amber-500 tw-ring-2 tw-ring-amber-500/20 tw-shadow-md" : "tw-border-slate-200/80 tw-shadow-sm hover:tw-border-slate-300"}`}
                    >
                        <p className="tw-text-xs tw-font-semibold tw-text-amber-600 tw-uppercase tw-tracking-wider tw-m-0">Vencidas</p>
                        <div className="tw-flex tw-items-center tw-justify-between tw-mt-2">
                            <h3 className="tw-text-2xl tw-font-bold tw-text-amber-700 tw-m-0">{countVencido}</h3>
                            <div className="tw-w-9 tw-h-9 tw-rounded-xl tw-bg-amber-50 tw-flex tw-items-center tw-justify-center">
                                <AlertCircle className="tw-w-4 tw-h-4 tw-text-amber-600" />
                            </div>
                        </div>
                    </button>
                </div>

                {/* Barra de herramientas y filtros */}
                <div className="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200/80 tw-shadow-sm tw-p-4 tw-mb-6">
                    <div className="tw-flex tw-flex-col lg:tw-flex-row tw-justify-between tw-items-center tw-gap-4">
                        {/* Buscador */}
                        <div className="tw-relative tw-w-full lg:tw-w-96">
                            <Search className="tw-absolute tw-left-3 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-slate-400" />
                            <input
                                type="text"
                                className="tw-w-full tw-pl-10 tw-pr-9 tw-py-2.5 tw-border tw-border-slate-200 tw-rounded-xl tw-bg-slate-50 tw-text-slate-700 tw-placeholder-slate-400 focus:tw-bg-white focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-primario-500/20 focus:tw-border-primario-500 tw-transition-all"
                                placeholder="Buscar por lote, insumo, proveedor o responsable..."
                                value={filterText}
                                onChange={e => setFilterText(e.target.value)}
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

                        {/* Pills de Estado */}
                        <div className="tw-flex tw-items-center tw-gap-1.5 tw-overflow-x-auto tw-w-full lg:tw-w-auto">
                            {[
                                { key: "TODOS", label: "Todas", count: entradas.length },
                                { key: "STOCK", label: "En Stock", count: countStock },
                                { key: "AGOTADO", label: "Agotadas", count: countAgotado },
                                { key: "VENCIDO", label: "Vencidas", count: countVencido },
                            ].map(pill => (
                                <button
                                    key={pill.key}
                                    type="button"
                                    onClick={() => setFiltroEstado(pill.key)}
                                    className={`tw-px-3 tw-py-1.5 tw-rounded-xl tw-text-xs tw-font-semibold tw-transition-all tw-whitespace-nowrap tw-flex tw-items-center tw-gap-1.5 ${filtroEstado === pill.key ? "tw-bg-primario-900 tw-text-white tw-shadow-sm" : "tw-bg-slate-100 tw-text-slate-600 hover:tw-bg-slate-200/70"}`}
                                >
                                    <span>{pill.label}</span>
                                    <span className={`tw-px-1.5 tw-py-0.2 tw-rounded-full tw-text-[10px] ${filtroEstado === pill.key ? "tw-bg-white/20 tw-text-white" : "tw-bg-slate-200 tw-text-slate-700"}`}>
                                        {pill.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Botón Nueva Entrada */}
                        <button
                            type="button"
                            className="tw-w-full lg:tw-w-auto tw-px-5 tw-py-2.5 tw-bg-primario-900 hover:tw-bg-primario-700 tw-text-white tw-font-semibold tw-rounded-xl tw-shadow-sm hover:tw-shadow tw-transition-all tw-duration-200 tw-flex tw-items-center tw-justify-center tw-gap-2"
                            onClick={() => {
                                setEntradaSeleccionada(null)
                                setShowModal(true)
                            }}
                        >
                            <Plus className="tw-w-4 tw-h-4" />
                            <span>Nueva Entrada</span>
                        </button>
                    </div>
                </div>

                {/* Tabla de datos */}
                <div className="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200/80 tw-shadow-sm tw-overflow-hidden">
                    <DataTable
                        columns={columnsTable}
                        data={filtered}
                        keyField="Id_Entradas"
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
                                <div className="tw-inline-block tw-w-8 tw-h-8 tw-border-4 tw-border-primario-200 tw-border-t-primario-900 tw-rounded-full tw-animate-spin"></div>
                                <p className="tw-mt-3 tw-text-slate-500">Cargando entradas...</p>
                            </div>
                        }
                        noDataComponent={
                            <div className="tw-py-12 tw-text-center">
                                <Inbox className="tw-w-12 tw-h-12 tw-text-slate-300 tw-mx-auto tw-mb-3" />
                                <p className="tw-text-slate-400">No se encontraron entradas</p>
                            </div>
                        }
                    />
                </div>

                <div className="tw-mt-3 tw-text-right">
                    <p className="tw-text-xs tw-text-slate-400">
                        Mostrando {filtered.length} de {entradas.length} entradas
                    </p>
                </div>

                {showModal && (
                    <div
                        className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-4 tw-bg-black/50 tw-backdrop-blur-sm"
                        onClick={(e) => e.target === e.currentTarget && hideModal()}
                    >
                        <div className="tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-4xl tw-max-h-[92vh] tw-flex tw-flex-col tw-overflow-hidden tw-animate-in tw-fade-in tw-zoom-in-95 tw-duration-200">
                            <div className="tw-bg-primario-900 tw-px-6 tw-py-3.5 tw-shrink-0">
                                <div className="tw-flex tw-justify-between tw-items-center">
                                    <div className="tw-flex tw-items-center tw-gap-3">
                                        <div className="tw-w-8 tw-h-8 tw-bg-white/20 tw-rounded-lg tw-flex tw-items-center tw-justify-center">
                                            <Boxes className="tw-w-5 tw-h-5 tw-text-secundario-400" />
                                        </div>
                                        <h5 className="tw-text-white tw-font-semibold tw-text-base md:tw-text-lg tw-m-0">
                                            {entradaSeleccionada ? 'Editar Entrada' : 'Nueva Entrada'}
                                        </h5>
                                    </div>
                                    <button
                                        type="button"
                                        className="tw-text-white/70 hover:tw-text-white tw-transition-colors"
                                        onClick={hideModal}
                                    >
                                        <X className="tw-w-5 tw-h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="tw-p-4 md:tw-p-6 tw-overflow-y-auto tw-flex-1">
                                <EntradasForm
                                    hideModal={hideModal}
                                    refreshTable={getAllEntradas}
                                    entradaSeleccionada={entradaSeleccionada}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CrudEntradas