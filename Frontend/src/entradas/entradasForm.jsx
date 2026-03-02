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
    const [Uni_medida, setUnidad] = useState("")
    const [textFormButton, setText] = useState("Enviar")

    const resetForm = () => {
        setFec("")
        setLote("")
        setVlr("")
        setCantidad("")
        setProveedor("")
        setPasante("")
        setInstructor("")
        setInsumo("")
        setUnidad("")
        setText("Enviar")
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
            setUnidad(entradaSeleccionada.Uni_medida || "")
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
            Id_Insumos,
            Uni_medida
        }

        try {
            if (!entradaSeleccionada) {
                await apiNode.post("/api/entradas/", payload)
                alert("Entrada creada")
            } else {
                await apiNode.put(
                    `/api/entradas/${entradaSeleccionada.Id_Entradas}`,
                    payload
                )
                alert("Entrada actualizada")
            }

            resetForm()
            hideModal()
            refreshTable()

        } catch (err) {
            alert("Error al guardar entrada")
        }
    }

    return (
        <form onSubmit={gestionarForm}>
            <div className="card border-0 shadow-sm">
                <div className="card-body">

                    <h5 className="mb-4 text-center fw-semibold">
                        {entradaSeleccionada ? "Actualizar entrada" : "Registrar nueva entrada"}
                    </h5>

                    {/* Sección general */}
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
                            />
                        </div>
                    </div>

                    {/* Valores */}
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
                            />
                        </div>
                    </div>

                    {/* Relaciones */}
                    <div className="row mb-3">
                        <div className="col-md-4">
                            <label className="form-label">Proveedor</label>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="ID Proveedor"
                                value={Id_Proveedor}
                                onChange={e => setProveedor(e.target.value)}
                            />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Pasante</label>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="ID Pasante"
                                value={Id_Pasante}
                                onChange={e => setPasante(e.target.value)}
                            />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Instructor</label>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="ID Instructor"
                                value={Id_Instructor}
                                onChange={e => setInstructor(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Insumo */}
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <label className="form-label">Insumo</label>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="ID Insumo"
                                value={Id_Insumos}
                                onChange={e => setInsumo(e.target.value)}
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Unidad de medida</label>
                            <select
                                className="form-select"
                                value={Uni_medida}
                                onChange={e => setUnidad(e.target.value)}
                            >
                                <option value="">Seleccione unidad</option>
                                <option value="kg">Kilogramos (kg)</option>
                                <option value="gr">Gramos (gr)</option>
                                <option value="l">Litros (l)</option>
                                <option value="ml">Mililitros (ml)</option>
                            </select>
                        </div>
                    </div>

                    {/* Botón */}
                    <div className="d-grid">
                        <button className="btn btn-primary btn-lg" type="submit">
                            {textFormButton}
                        </button>
                    </div>

                </div>
            </div>
        </form>
    )
}

export default EntradasForm