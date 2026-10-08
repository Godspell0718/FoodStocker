import { useState, useEffect } from "react"
import apiNode from "../api/axiosConfig.js"
import Swal from "sweetalert2"
import {
    Calendar, Hash, DollarSign, Package, Truck, User,
    ChevronDown, Save, X, Info, FileText, Calculator, Layers, Check
} from "lucide-react"

const inputClass = "tw-w-full tw-px-4 tw-py-2.5 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-gray-50 tw-text-sm tw-text-gray-700 focus:tw-outline-none focus:tw-border-primario-500 focus:tw-ring-2 focus:tw-ring-primario-100 focus:tw-bg-white tw-transition-all"
const labelClass = "tw-block tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wide tw-mb-1.5"
const selectClass = "tw-w-full tw-px-4 tw-py-2.5 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-gray-50 tw-text-sm tw-text-gray-700 focus:tw-outline-none focus:tw-border-primario-500 focus:tw-ring-2 focus:tw-ring-primario-100 focus:tw-bg-white tw-transition-all tw-appearance-none"

export const EntradasForm = ({ hideModal, refreshTable, entradaSeleccionada }) => {

    const [Fec_Ven_Entrada, setFec] = useState("")
    const [sinVencimiento, setSinVencimiento] = useState(false)
    const [Lote, setLote] = useState("")
    const [Vlr_Unitario, setVlr] = useState("")
    const [Can_Inicial, setCantidad] = useState("")
    const [Id_Proveedor, setProveedor] = useState("")
    const [Id_Pasante, setPasante] = useState("")
    const [Id_Instructor, setInstructor] = useState("")
    const [Id_Insumos, setInsumo] = useState("")
    const [Uni_medida, setUniMedida] = useState("")
    const [Observaciones, setObservaciones] = useState("")
    const [loading, setLoading] = useState(false)

    // ─── Asistente / Calculador de empaques (bolsas, cubetas, cajas) ───
    const [modoEmpaque, setModoEmpaque] = useState(false)
    const [cantEmpaques, setCantEmpaques] = useState("")
    const [pesoPorEmpaque, setPesoPorEmpaque] = useState("")
    const [tipoEmpaque, setTipoEmpaque] = useState("bolsas")

    // Comprobar si la entrada ya fue utilizada (Requerimiento 8)
    const isUsed = entradaSeleccionada && (entradaSeleccionada.Can_Salida > 0)

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
        setFec(""); setSinVencimiento(false); setLote(""); setVlr(""); setCantidad("")
        setProveedor(""); setPasante(""); setInstructor("")
        setInsumo(""); setUniMedida(""); setObservaciones("")
        setModoEmpaque(false); setCantEmpaques(""); setPesoPorEmpaque("")
    }

    const actualizarCalculoEmpaques = (empaques, contenido) => {
        const nEmp = Number(empaques)
        const nCont = Number(contenido)
        if (!isNaN(nEmp) && nEmp > 0 && !isNaN(nCont) && nCont > 0) {
            setCantidad(String(Math.round(nEmp * nCont)))
        }
    }

    const handleCantEmpaquesChange = (val) => {
        setCantEmpaques(val)
        actualizarCalculoEmpaques(val, pesoPorEmpaque)
    }

    const handlePesoPorEmpaqueChange = (val) => {
        setPesoPorEmpaque(val)
        actualizarCalculoEmpaques(cantEmpaques, val)
    }

    useEffect(() => {
        if (entradaSeleccionada) {
            const fv = entradaSeleccionada.Fec_Ven_Entrada?.slice(0, 10) || ""
            setFec(fv)
            setSinVencimiento(!fv)
            setLote(entradaSeleccionada.Lote || "")
            setVlr(entradaSeleccionada.Vlr_Unitario || "")
            setCantidad(entradaSeleccionada.Can_Inicial || "")
            setProveedor(entradaSeleccionada.Id_Proveedor || "")
            setPasante(entradaSeleccionada.Id_Pasante || "")
            setInstructor(entradaSeleccionada.Id_Instructor || "")
            setInsumo(entradaSeleccionada.Id_Insumos || "")
            setUniMedida(entradaSeleccionada.Uni_medida || entradaSeleccionada.insumo?.Uni_medida || "")
            setObservaciones(entradaSeleccionada.Observaciones || "")
        } else {
            resetForm()
        }
    }, [entradaSeleccionada])

    const handleInsumoChange = (e) => {
        const val = e.target.value
        setInsumo(val)
        const selectedInsumo = insumos.find(i => String(i.Id_Insumos) === String(val))
        if (selectedInsumo && selectedInsumo.Uni_medida) {
            setUniMedida(selectedInsumo.Uni_medida)
        }
    }

    const gestionarForm = async e => {
        e.preventDefault()

        if (isUsed) {
            return Swal.fire("Atención", "No es posible modificar esta entrada porque ya ha sido utilizada", "warning")
        }

        // Validaciones (Requerimiento 3)
        if (!Id_Insumos) return Swal.fire("Validación", "Debe seleccionar un insumo", "warning")
        if (!Lote.trim()) return Swal.fire("Validación", "El lote es requerido", "warning")
        if (!Can_Inicial || Number(Can_Inicial) <= 0) return Swal.fire("Validación", "La cantidad inicial debe ser mayor a 0", "warning")

        const vlrUnit = (Vlr_Unitario !== "" && Vlr_Unitario !== null) ? Number(Vlr_Unitario) : null
        const canInit = Number(Can_Inicial)
        let vlrTot = null

        if (vlrUnit !== null && !isNaN(vlrUnit)) {
            if (modoEmpaque && cantEmpaques && Number(cantEmpaques) > 0) {
                // Si llegó en empaques, el total pagado es: N° de empaques * valor de cada empaque
                vlrTot = Math.round(vlrUnit * Number(cantEmpaques))
            } else if (!isNaN(canInit) && canInit > 0) {
                vlrTot = Math.round(vlrUnit * canInit)
            }
        }

        const payload = {
            Fec_Ven_Entrada: sinVencimiento ? null : (Fec_Ven_Entrada || null),
            Lote,
            Vlr_Unitario: vlrUnit,
            Vlr_Total: vlrTot,
            Can_Inicial: canInit,
            Id_Proveedor,
            Id_Pasante,
            Id_Instructor,
            Id_Insumos,
            Estado: 'STOCK',
            Uni_medida,
            Observaciones: Observaciones || null
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
    const pasantes = responsables.filter(r => (r.Tip_Responsable === 'Pasante de agroindustria' || r.Tip_Responsable === 'Pasante solicitante') && (r.Estado === 'ACTIVO' || r.Id_Responsable === Id_Pasante))
    const instructores = responsables.filter(r => (r.Tip_Responsable === 'Instructor de agroindustria' || r.Tip_Responsable === 'ADMIN') && (r.Estado === 'ACTIVO' || r.Id_Responsable === Id_Instructor))

    return (
        <form onSubmit={gestionarForm} className="tw-space-y-6">

            {/* Requerimiento 8: Aviso si la entrada ya fue utilizada */}
            {isUsed && (
                <div className="tw-bg-amber-50 tw-border tw-border-amber-200 tw-p-3.5 tw-rounded-xl tw-flex tw-items-center tw-gap-3">
                    <Info className="tw-w-5 tw-h-5 tw-text-amber-600 tw-shrink-0" />
                    <p className="tw-text-xs tw-text-amber-800 tw-font-medium tw-m-0">
                        Esta entrada ya registra consumos/salidas ({entradaSeleccionada.Can_Salida} unidades utilizadas). <strong>No se permite su modificación.</strong>
                    </p>
                </div>
            )}

            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-5">

                {/* 1. INSUMO */}
                <div className="md:tw-col-span-2">
                    <div className="tw-flex tw-justify-between tw-items-center tw-mb-1.5">
                        <label className={`${labelClass} tw-mb-0`}>
                            <Info className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1.5" />
                            Insumo *
                        </label>
                        {Id_Insumos && Uni_medida && (
                            <span className="tw-text-xs tw-font-semibold tw-text-primario-900 tw-bg-primario-50 tw-px-2.5 tw-py-0.5 tw-rounded-full tw-border tw-border-primario-200">
                                Unidad de medida: {Uni_medida}
                            </span>
                        )}
                    </div>
                    <div className="tw-relative">
                        <select
                            className={`${selectClass} ${isUsed ? 'tw-bg-gray-200' : ''}`}
                            value={Id_Insumos}
                            onChange={handleInsumoChange}
                            disabled={isUsed}
                            required
                        >
                            <option value="">Seleccione un insumo...</option>
                            {insumos.filter(ins => ins.Estado === 'ACTIVO' || ins.Id_Insumos === Id_Insumos).map(ins => (
                                <option key={ins.Id_Insumos} value={ins.Id_Insumos}>
                                    {ins.Nom_Insumo} ({ins.Tip_Insumo})
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="tw-absolute tw-right-4 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-gray-400 tw-pointer-events-none" />
                    </div>
                </div>

                {/* Lote */}
                <div>
                    <label className={labelClass}>
                        <Hash className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1.5" />
                        Lote
                    </label>
                    <input
                        type="text"
                        className={`${inputClass} ${isUsed ? 'tw-bg-gray-200' : ''}`}
                        placeholder="Ej: LOTE-2024-01"
                        value={Lote}
                        onChange={e => setLote(e.target.value)}
                        disabled={isUsed}
                        required
                    />
                </div>

                {/* Fecha de vencimiento */}
                <div>
                    <div className="tw-flex tw-justify-between tw-items-center tw-mb-1.5">
                        <label className={`${labelClass} tw-mb-0`}>
                            <Calendar className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1.5" />
                            Fecha de vencimiento
                        </label>
                        <label className="tw-inline-flex tw-items-center tw-gap-1.5 tw-text-xs tw-text-gray-600 tw-cursor-pointer hover:tw-text-primario-900">
                            <input
                                type="checkbox"
                                className="tw-rounded tw-text-primario-900 focus:tw-ring-primario-500 tw-w-3.5 tw-h-3.5"
                                checked={sinVencimiento}
                                onChange={(e) => {
                                    const checked = e.target.checked
                                    setSinVencimiento(checked)
                                    if (checked) setFec("")
                                }}
                                disabled={isUsed}
                            />
                            <span>Sin vencimiento (N/A)</span>
                        </label>
                    </div>
                    {sinVencimiento ? (
                        <div className="tw-w-full tw-px-4 tw-py-2.5 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-gray-100 tw-text-sm tw-text-gray-600 tw-flex tw-items-center tw-justify-between">
                            <span className="tw-font-medium tw-text-xs">N/A — No perecedero / Sin fecha de vencimiento</span>
                        </div>
                    ) : (
                        <input
                            type="date"
                            className={`${inputClass} ${isUsed ? 'tw-bg-gray-200' : ''}`}
                            value={Fec_Ven_Entrada}
                            onChange={e => setFec(e.target.value)}
                            disabled={isUsed}
                        />
                    )}
                </div>

                {/* Cantidad inicial / Asistente de empaque */}
                {modoEmpaque ? (
                    <div className="md:tw-col-span-2 tw-bg-emerald-50/80 tw-border tw-border-emerald-200 tw-rounded-2xl tw-p-4 tw-transition-all">
                        <div className="tw-flex tw-justify-between tw-items-center tw-mb-3">
                            <div className="tw-flex tw-items-center tw-gap-2">
                                <Calculator className="tw-w-4 tw-h-4 tw-text-emerald-700" />
                                <span className="tw-text-xs tw-font-bold tw-text-emerald-900 tw-uppercase tw-tracking-wide">
                                    Calculadora de recepción (Bolsas, Cubetas, Cajas)
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModoEmpaque(false)}
                                className="tw-text-xs tw-text-emerald-800 hover:tw-text-emerald-950 tw-underline tw-font-medium"
                            >
                                Cambiar a ingreso directo
                            </button>
                        </div>

                        <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-3 tw-gap-3 tw-mb-3">
                            <div>
                                <label className="tw-block tw-text-[11px] tw-font-semibold tw-text-emerald-900 tw-mb-1">
                                    Presentación / Empaque
                                </label>
                                <select
                                    className={selectClass}
                                    value={tipoEmpaque}
                                    onChange={e => setTipoEmpaque(e.target.value)}
                                    disabled={isUsed}
                                >
                                    <option value="bolsas">Bolsas</option>
                                    <option value="cubetas">Cubetas / Panales</option>
                                    <option value="cajas">Cajas</option>
                                    <option value="paquetes">Paquetes</option>
                                    <option value="bultos">Bultos / Sacos</option>
                                    <option value="latas">Latas / Frascos</option>
                                    <option value="unidades">Unidades sueltas</option>
                                </select>
                            </div>
                            <div>
                                <label className="tw-block tw-text-[11px] tw-font-semibold tw-text-emerald-900 tw-mb-1">
                                    N° de {tipoEmpaque}
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    className={inputClass}
                                    placeholder="Ej: 8"
                                    value={cantEmpaques}
                                    onChange={e => handleCantEmpaquesChange(e.target.value)}
                                    disabled={isUsed}
                                />
                            </div>
                            <div>
                                <label className="tw-block tw-text-[11px] tw-font-semibold tw-text-emerald-900 tw-mb-1">
                                    Contenido por {tipoEmpaque.replace(/s$/, '') || "empaque"} {Uni_medida ? `(${Uni_medida})` : ''}
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    className={inputClass}
                                    placeholder={Uni_medida === 'Und' ? "Ej: 30" : "Ej: 500"}
                                    value={pesoPorEmpaque}
                                    onChange={e => handlePesoPorEmpaqueChange(e.target.value)}
                                    disabled={isUsed}
                                />
                            </div>
                        </div>

                        {/* Total calculado y badge de resultado */}
                        <div className="tw-bg-white tw-border tw-border-emerald-200 tw-rounded-xl tw-p-3 tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center sm:tw-justify-between tw-gap-2">
                            <div className="tw-text-xs tw-text-emerald-900">
                                {cantEmpaques && pesoPorEmpaque ? (
                                    <span>
                                        Total a ingresar: <strong>{cantEmpaques}</strong> {tipoEmpaque} × <strong>{pesoPorEmpaque} {Uni_medida}</strong> =
                                        <span className="tw-ml-1.5 tw-font-bold tw-text-sm tw-text-emerald-700">
                                            {(Number(cantEmpaques) * Number(pesoPorEmpaque)).toLocaleString("es-CO")} {Uni_medida}
                                        </span>
                                    </span>
                                ) : (
                                    <span className="tw-text-gray-500">
                                        Escribe el N° de empaques y el contenido de cada uno para calcular el total.
                                    </span>
                                )}
                            </div>

                            {cantEmpaques && pesoPorEmpaque && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const nota = `Recepción: ${cantEmpaques} ${tipoEmpaque} de ${pesoPorEmpaque} ${Uni_medida}.`
                                        setObservaciones(prev => {
                                            if (prev && prev.includes(nota)) return prev
                                            return prev ? `${prev} | ${nota}` : nota
                                        })
                                    }}
                                    className="tw-text-xs tw-bg-emerald-100 hover:tw-bg-emerald-200 tw-text-emerald-800 tw-font-semibold tw-px-2.5 tw-py-1 tw-rounded-lg tw-transition-colors tw-self-start sm:tw-self-auto"
                                >
                                    + Guardar detalle en observaciones
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="tw-flex tw-justify-between tw-items-center tw-mb-1.5">
                            <label className={`${labelClass} tw-mb-0`}>
                                <Package className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1.5" />
                                Cantidad {Uni_medida ? `(${Uni_medida})` : ''} *
                            </label>
                            {!isUsed && (
                                <button
                                    type="button"
                                    onClick={() => setModoEmpaque(true)}
                                    className="tw-text-xs tw-text-primario-900 hover:tw-underline tw-font-medium tw-flex tw-items-center tw-gap-1"
                                >
                                    <Calculator className="tw-w-3.5 tw-h-3.5" />
                                    ¿Llegó en bolsas / cubetas?
                                </button>
                            )}
                        </div>
                        <input
                            type="number"
                            className={`${inputClass} ${isUsed ? 'tw-bg-gray-200' : ''}`}
                            placeholder="0"
                            value={Can_Inicial}
                            onChange={e => setCantidad(e.target.value)}
                            disabled={isUsed}
                            required
                        />
                    </div>
                )}

                {/* Valor unitario */}
                <div>
                    <label className={labelClass}>
                        <DollarSign className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1.5" />
                        {modoEmpaque ? `Valor por ${tipoEmpaque.replace(/s$/, '') || "empaque"}` : `Valor unitario`}
                    </label>
                    <input
                        type="number"
                        className={`${inputClass} ${isUsed ? 'tw-bg-gray-200' : ''}`}
                        placeholder="$ 0"
                        value={Vlr_Unitario}
                        onChange={e => setVlr(e.target.value)}
                        disabled={isUsed}
                    />
                </div>

                {/* Valor total calculado */}
                <div>
                    <label className={labelClass}>
                        <DollarSign className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1.5" />
                        Valor total {modoEmpaque && cantEmpaques ? `(${cantEmpaques} ${tipoEmpaque})` : '(calculado)'}
                    </label>
                    <input
                        type="text"
                        className={`${inputClass} tw-bg-emerald-50 tw-border-emerald-200 tw-font-semibold tw-text-emerald-800 tw-cursor-not-allowed`}
                        value={
                            Vlr_Unitario && Number(Vlr_Unitario) > 0
                                ? modoEmpaque && cantEmpaques && Number(cantEmpaques) > 0
                                    ? `$ ${(Number(Vlr_Unitario) * Number(cantEmpaques)).toLocaleString("es-CO")}`
                                    : Can_Inicial && Number(Can_Inicial) > 0
                                        ? `$ ${(Number(Vlr_Unitario) * Number(Can_Inicial)).toLocaleString("es-CO")}`
                                        : "$ 0"
                                : "$ 0"
                        }
                        disabled
                        readOnly
                    />
                </div>

                {/* Proveedor */}
                <div className="md:tw-col-span-2">
                    <label className={labelClass}>
                        <Truck className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1.5" />
                        Proveedor
                    </label>
                    <div className="tw-relative">
                        <select
                            className={`${selectClass} ${isUsed ? 'tw-bg-gray-200' : ''}`}
                            value={Id_Proveedor}
                            onChange={e => setProveedor(e.target.value)}
                            disabled={isUsed}
                            required
                        >
                            <option value="">Seleccione un proveedor...</option>
                            {proveedores.filter(p => p.Estado === 'ACTIVO' || p.Id_Proveedor === Id_Proveedor).map(p => (
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
                            className={`${selectClass} ${isUsed ? 'tw-bg-gray-200' : ''}`}
                            value={Id_Pasante}
                            onChange={e => setPasante(e.target.value)}
                            disabled={isUsed}
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
                            className={`${selectClass} ${isUsed ? 'tw-bg-gray-200' : ''}`}
                            value={Id_Instructor}
                            onChange={e => setInstructor(e.target.value)}
                            disabled={isUsed}
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

            {/* Observaciones */}
            <div className="md:tw-col-span-2">
                <label className={labelClass}>
                    <FileText className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1.5" />
                    Observaciones
                </label>
                <textarea
                    className={`${inputClass} tw-resize-none ${isUsed ? 'tw-bg-gray-200' : ''}`}
                    rows={3}
                    placeholder="Escriba aquí cualquier observación relevante sobre esta entrada..."
                    value={Observaciones}
                    onChange={e => setObservaciones(e.target.value)}
                    disabled={isUsed}
                    maxLength={500}
                />
                <p className="tw-text-xs tw-text-gray-400 tw-mt-1 tw-text-right tw-m-0">
                    {Observaciones.length}/500
                </p>
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