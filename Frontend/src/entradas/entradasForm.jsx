import { useState, useEffect } from "react"
import apiNode from "../api/axiosConfig.js"
import Swal from "sweetalert2"
import { 
    Calendar, Hash, DollarSign, Package, Truck, User, 
    ChevronDown, Save, X, Info
} from "lucide-react"

const inputClass = "tw-w-full tw-px-4 tw-py-2.5 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-gray-50 tw-text-sm tw-text-gray-700 focus:tw-outline-none focus:tw-border-primario-500 focus:tw-ring-2 focus:tw-ring-primario-100 focus:tw-bg-white tw-transition-all"
const labelClass = "tw-block tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wide tw-mb-1.5"
const selectClass = "tw-w-full tw-px-4 tw-py-2.5 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-gray-50 tw-text-sm tw-text-gray-700 focus:tw-outline-none focus:tw-border-primario-500 focus:tw-ring-2 focus:tw-ring-primario-100 focus:tw-bg-white tw-transition-all tw-appearance-none"

export const EntradasForm = ({ hideModal, refreshTable, entradaSeleccionada }) => {

    const [Fec_Ven_Entrada, setFec] = useState("")
    const [Lote, setLote] = useState("")
    const [Vlr_Unitario, setVlr] = useState("")
    const [Can_Inicial, setCantidad] = useState("")
    const [Id_Proveedor, setProveedor] = useState("")
    const [Id_Pasante, setPasante] = useState("")
    const [Id_Instructor, setInstructor] = useState("")
    const [Id_Insumos, setInsumo] = useState("")
    const [loading, setLoading] = useState(false)

    // ─── Datos para los selects ───────────────────────────────────
    const [proveedores, setProveedores] = useState([])
    const [responsables, setResponsables] = useState([])
    const [insumos, setInsumos] = useState([])

    // ─── Cargar datos al montar ───────────────────────────────────
    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        try {
            const [resP, resR, resI] = await Promise.all([
                apiNode.get("/api/proveedores/"),
                apiNode.get("/api/responsables/"),
                apiNode.get("/api/insumos/")
            ])
            setProveedores(resP.data)
            setResponsables(resR.data)
            setInsumos(resI.data)
        } catch (error) {
            console.error("Error cargando datos:", error)
        }
    }

    const resetForm = () => {
        setFec(""); setLote(""); setVlr(""); setCantidad("")
        setProveedor(""); setPasante(""); setInstructor("")
        setInsumo("")
    }

    useEffect(() => {
        if (entradaSeleccionada) {
            setFec(entradaSeleccionada.Fec_Ven_Entrada?.slice(0, 10) || "")
            setLote(entradaSeleccionada.Lote || "")
            setVlr(entradaSeleccionada.Vlr_Unitario || "")
            setCantidad(entradaSeleccionada.Can_Inicial || "")
            setProveedor(entradaSeleccionada.Id_Proveedor || "")
            setPasante(entradaSeleccionada.Id_Pasante || "")
            setInstructor(entradaSeleccionada.Id_Instructor || "")
            setInsumo(entradaSeleccionada.Id_Insumos || "")
        } else {
            resetForm()
        }
    }, [entradaSeleccionada])

    const gestionarForm = async e => {
        e.preventDefault()
        setLoading(true)

        const payload = {
            Fec_Ven_Entrada,
            Lote,
            Vlr_Unitario: Vlr_Unitario || null,
            Can_Inicial,
            Id_Proveedor,
            Id_Pasante,
            Id_Instructor,
            Id_Insumos
        }

        try {
            if (!entradaSeleccionada) {
                await apiNode.post("/api/entradas/", payload)
                Swal.fire({
                    icon: 'success',
                    title: 'Entrada creada',
                    text: 'El registro se ha guardado correctamente',
                    timer: 2000,
                    showConfirmButton: false
                })
            } else {
                await apiNode.put(`/api/entradas/${entradaSeleccionada.Id_Entradas}`, payload)
                Swal.fire({
                    icon: 'success',
                    title: 'Entrada actualizada',
                    text: 'Los cambios se han guardado correctamente',
                    timer: 2000,
                    showConfirmButton: false
                })
            }
            resetForm()
            hideModal()
            refreshTable()
        } catch (err) {
            console.error(err)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.response?.data?.message || 'No se pudo guardar la entrada'
            })
        } finally {
            setLoading(false)
        }
    }

    // ─── Filtrar pasantes e instructores ─────────────────────────
    const pasantes = responsables.filter(r => r.Tip_Responsable === 'P')
    const instructores = responsables.filter(r => r.Tip_Responsable === 'I')

    return (
        <form onSubmit={gestionarForm} className="tw-space-y-6">
            
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-5">
                {/* Fecha de vencimiento */}
                <div>
                    <label className={labelClass}>
                        <Calendar className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1.5" />
                        Fecha de vencimiento
                    </label>
                    <input
                        type="date"
                        className={inputClass}
                        value={Fec_Ven_Entrada}
                        onChange={e => setFec(e.target.value)}
                    />
                </div>

                {/* Lote */}
                <div>
                    <label className={labelClass}>
                        <Hash className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1.5" />
                        Lote
                    </label>
                    <input
                        type="text"
                        className={inputClass}
                        placeholder="Ej: LOTE-2024-01"
                        value={Lote}
                        onChange={e => setLote(e.target.value)}
                        required
                    />
                </div>

                {/* Valor unitario */}
                <div>
                    <label className={labelClass}>
                        <DollarSign className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1.5" />
                        Valor unitario
                    </label>
                    <input
                        type="number"
                        className={inputClass}
                        placeholder="$ 0"
                        value={Vlr_Unitario}
                        onChange={e => setVlr(e.target.value)}
                    />
                </div>

                {/* Cantidad inicial */}
                <div>
                    <label className={labelClass}>
                        <Package className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1.5" />
                        Cantidad inicial
                    </label>
                    <input
                        type="number"
                        className={inputClass}
                        placeholder="0"
                        value={Can_Inicial}
                        onChange={e => setCantidad(e.target.value)}
                        required
                    />
                </div>

                {/* Insumo */}
                <div className="md:tw-col-span-2">
                    <label className={labelClass}>
                        <Info className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1.5" />
                        Insumo
                    </label>
                    <div className="tw-relative">
                        <select
                            className={selectClass}
                            value={Id_Insumos}
                            onChange={e => setInsumo(e.target.value)}
                            required
                        >
                            <option value="">Seleccione un insumo...</option>
                            {insumos.map(ins => (
                                <option key={ins.Id_Insumos} value={ins.Id_Insumos}>
                                    {ins.Nom_Insumo} ({ins.Uni_Med_Insumo})
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="tw-absolute tw-right-4 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-gray-400 tw-pointer-events-none" />
                    </div>
                </div>

                {/* Proveedor */}
                <div className="md:tw-col-span-2">
                    <label className={labelClass}>
                        <Truck className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1.5" />
                        Proveedor
                    </label>
                    <div className="tw-relative">
                        <select
                            className={selectClass}
                            value={Id_Proveedor}
                            onChange={e => setProveedor(e.target.value)}
                            required
                        >
                            <option value="">Seleccione un proveedor...</option>
                            {proveedores.map(p => (
                                <option key={p.Id_Proveedor} value={p.Id_Proveedor}>
                                    {p.Nom_Proveedor}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="tw-absolute tw-right-4 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-gray-400 tw-pointer-events-none" />
                    </div>
                </div>

                {/* Pasante */}
                <div>
                    <label className={labelClass}>
                        <User className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1.5" />
                        Pasante responsable
                    </label>
                    <div className="tw-relative">
                        <select
                            className={selectClass}
                            value={Id_Pasante}
                            onChange={e => setPasante(e.target.value)}
                            required
                        >
                            <option value="">Seleccione un pasante...</option>
                            {pasantes.map(p => (
                                <option key={p.Id_Responsable} value={p.Id_Responsable}>
                                    {p.Nom_Responsable}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="tw-absolute tw-right-4 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-gray-400 tw-pointer-events-none" />
                    </div>
                </div>

                {/* Instructor */}
                <div>
                    <label className={labelClass}>
                        <User className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1.5" />
                        Instructor responsable
                    </label>
                    <div className="tw-relative">
                        <select
                            className={selectClass}
                            value={Id_Instructor}
                            onChange={e => setInstructor(e.target.value)}
                            required
                        >
                            <option value="">Seleccione un instructor...</option>
                            {instructores.map(i => (
                                <option key={i.Id_Responsable} value={i.Id_Responsable}>
                                    {i.Nom_Responsable}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="tw-absolute tw-right-4 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-gray-400 tw-pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Acciones */}
            <div className="tw-flex tw-gap-3 tw-pt-4">
                <button
                    type="button"
                    onClick={hideModal}
                    className="tw-flex-1 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-5 tw-py-3 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-white tw-text-gray-600 tw-font-semibold hover:tw-bg-gray-50 tw-transition-all"
                >
                    <X className="tw-w-4 tw-h-4" />
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="tw-flex-[2] tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-5 tw-py-3 tw-rounded-xl tw-bg-primario-900 tw-text-white tw-font-semibold hover:tw-bg-primario-700 tw-transition-all tw-shadow-lg tw-shadow-primario-900/20 disabled:tw-opacity-50"
                >
                    {loading ? (
                        <div className="tw-w-5 tw-h-5 tw-border-2 tw-border-white/30 tw-border-t-white tw-rounded-full tw-animate-spin" />
                    ) : (
                        <Save className="tw-w-4 tw-h-4" />
                    )}
                    {entradaSeleccionada ? "Actualizar entrada" : "Guardar entrada"}
                </button>
            </div>
        </form>
    )
}

export default EntradasForm

