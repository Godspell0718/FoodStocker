import { useState, useEffect } from "react"
import apiNode from "../api/axiosConfig.js"

const EntradasForm = ({ hideModal, refreshTable, entradaSeleccionada }) => {

    const [Fec_Ven_Entrada, setFec] = useState("")
    const [Lote, setLote] = useState("")
    const [Vlr_Unitario, setVlr] = useState("")
    const [Can_Inicial, setCantidad] = useState("")
    const [Id_Proveedor, setProveedor] = useState("")
    const [Id_Pasante, setPasante] = useState("")
    const [Id_Instructor, setInstructor] = useState("")
    const [Id_Insumos, setInsumo] = useState("")
    const [textFormButton, setText] = useState("Enviar")

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
        setInsumo(""); setText("Enviar")
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
            setText("Actualizar")
        } else {
            resetForm()
        }
    }, [entradaSeleccionada])

    const gestionarForm = async e => {
        e.preventDefault()

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
                alert("Entrada creada")
            } else {
                await apiNode.put(`/api/entradas/${entradaSeleccionada.Id_Entradas}`, payload)
                alert("Entrada actualizada")
            }
            resetForm()
            hideModal()
            refreshTable()
        } catch (err) {
            console.error(err)
            alert("Error al guardar entrada")
        }
    }

    // ─── Filtrar pasantes e instructores ─────────────────────────
    const pasantes = responsables.filter(r => r.Tip_Responsable === 'P')
    const instructores = responsables.filter(r => r.Tip_Responsable === 'I')

    return (
        <form onSubmit={gestionarForm}>
            <div className="card border-0 shadow-sm">
                <div className="card-body">

                    <h5 className="mb-4 text-center fw-semibold">
                        {entradaSeleccionada ? "Actualizar entrada" : "Registrar nueva entrada"}
                    </h5>

                    {/* Fecha y Lote */}
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <label className="form-label">Fecha de vencimiento</label>
                            <input
                                type="date"
                                className="form-control"
                                value={Fec_Ven_Entrada}
                                onChange={e => setFec(e.target.value)}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Lote</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Ej: LOTE-2024-01"
                                value={Lote}
                                onChange={e => setLote(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Valor y Cantidad */}
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <label className="form-label">Valor unitario</label>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="$"
                                value={Vlr_Unitario}
                                onChange={e => setVlr(e.target.value)}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Cantidad inicial</label>
                            <input
                                type="number"
                                className="form-control"
                                value={Can_Inicial}
                                onChange={e => setCantidad(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Insumo */}
                    <div className="mb-3">
                        <label className="form-label">Insumo</label>
                        <select
                            className="form-select"
                            value={Id_Insumos}
                            onChange={e => setInsumo(e.target.value)}
                            required
                        >
                            <option value="">Seleccione un insumo...</option>
                            {insumos.map(ins => (
                                <option key={ins.Id_Insumos} value={ins.Id_Insumos}>
                                    {ins.Nom_Insumo} — {ins.Tip_Insumo}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Proveedor */}
                    <div className="mb-3">
                        <label className="form-label">Proveedor</label>
                        <select
                            className="form-select"
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
                    </div>

                    {/* Pasante e Instructor */}
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <label className="form-label">Pasante</label>
                            <select
                                className="form-select"
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
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Instructor</label>
                            <select
                                className="form-select"
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
                        </div>
                    </div>

                    {/* Botón */}
                    <div className="d-grid">
                        <button className="btn btn-dark btn-lg" type="submit">
                            {textFormButton}
                        </button>
                    </div>

                </div>
            </div>
        </form>
    )
}

export default EntradasForm