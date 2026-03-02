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
            <input type="date" className="form-control mb-2" value={Fec_Ven_Entrada} onChange={e => setFec(e.target.value)} />
            <input type="text" className="form-control mb-2" placeholder="Lote" value={Lote} onChange={e => setLote(e.target.value)} />
            <input type="number" className="form-control mb-2" placeholder="Valor unitario" value={Vlr_Unitario} onChange={e => setVlr(e.target.value)} />
            <input type="number" className="form-control mb-2" placeholder="Cantidad" value={Can_Inicial} onChange={e => setCantidad(e.target.value)} />
            <input type="number" className="form-control mb-2" placeholder="ID Proveedor" value={Id_Proveedor} onChange={e => setProveedor(e.target.value)} />
            <input type="number" className="form-control mb-2" placeholder="ID Pasante" value={Id_Pasante} onChange={e => setPasante(e.target.value)} />
            <input type="number" className="form-control mb-2" placeholder="ID Instructor" value={Id_Instructor} onChange={e => setInstructor(e.target.value)} />
            <input type="number" className="form-control mb-2" placeholder="ID Insumo" value={Id_Insumos} onChange={e => setInsumo(e.target.value)} />
            <select className="form-control mb-3" value={Uni_medida} onChange={e => setUnidad(e.target.value)}>
                <option value="">Unidad</option>
                <option value="kg">kg</option>
                <option value="gr">gr</option>
                <option value="l">l</option>
                <option value="ml">ml</option>
            </select>

            <button className="btn btn-primary w-100" type="submit">
                {textFormButton}
            </button>
        </form>
    )
}

export default EntradasForm