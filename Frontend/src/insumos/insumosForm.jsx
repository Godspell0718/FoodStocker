import { useState, useEffect } from "react";
import apiAxios from "../api/axiosConfig.js";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const InsumosForm = ({ hideModal, insumoParaEditar }) => {

    const MySwal = withReactContent(Swal);

    const [Nom_Insumo, setNombre] = useState('');
    const [peso, setPeso] = useState('');
    const [Tip_Insumo, setTipo] = useState('');
    const [Can_Insumo, setCantidad] = useState('');
    const [Uni_Med_Insumo, setUnidad] = useState('');
    const [Ref_Insumo, setReferencia] = useState('');
    const [Codigo_Insumo, setCodigo] = useState('');
    const [textFormButton, setTextFormButton] = useState("Enviar");

    useEffect(() => {
        if (insumoParaEditar) {
            setNombre(insumoParaEditar.Nom_Insumo || '');
            setPeso(insumoParaEditar.peso || '');
            setTipo(insumoParaEditar.Tip_Insumo || '');
            setCantidad(insumoParaEditar.Can_Insumo || '');
            setUnidad(insumoParaEditar.Uni_Med_Insumo || '');
            setReferencia(insumoParaEditar.Ref_Insumo || '');
            setCodigo(insumoParaEditar.Codigo_Insumo || '');
            setTextFormButton("Actualizar");
        } else {
            limpiarFormulario();
        }
    }, [insumoParaEditar]);

    const limpiarFormulario = () => {
        setNombre('');
        setPeso('');
        setTipo('');
        setCantidad('');
        setUnidad('');
        setReferencia('');
        setCodigo('');
        setTextFormButton("Enviar");
    };

    const gestionarForm = async (e) => {
        e.preventDefault();

        const data = {
            Nom_Insumo,
            peso,
            Tip_Insumo,
            Can_Insumo,
            Uni_Med_Insumo,
            Ref_Insumo,
            Codigo_Insumo
        };

        try {
            if (textFormButton === "Enviar") {
                await apiAxios.post("/api/insumos/", data);
                MySwal.fire({
                    title: "Creado",
                    text: "Insumo creado correctamente",
                    icon: "success"
                });
            }

            if (textFormButton === "Actualizar") {
                await apiAxios.put(
                    `/api/insumos/${insumoParaEditar.Id_Insumos}`,
                    data
                );
                MySwal.fire({
                    title: "Actualizado",
                    text: "Insumo actualizado correctamente",
                    icon: "success"
                });
            }

            limpiarFormulario();
            hideModal();

        } catch (error) {
            console.error("Error:", error);
            MySwal.fire({
                title: "Error",
                text: "Ocurrió un error al guardar",
                icon: "error"
            });
        }
    };

    return (
        <form onSubmit={gestionarForm}>
            <div className="mb-3">
                <label>Nombre del Insumo</label>
                <input
                    className="form-control"
                    value={Nom_Insumo}
                    onChange={(e) => setNombre(e.target.value)}
                />
            </div>

            <div className="mb-3">
                <label>unidades del insumo</label>
                <input
                    type="number"
                    className="form-control"
                    value={Can_Insumo}
                    onChange={(e) => setCantidad(e.target.value)}
                />
            </div>

            <div className="mb-3">
                <label>Peso del insumo</label>
                <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                />
            </div>
            <div className="mb-3">
                <label>Tipo de insumo</label>
                <select
                    className="form-control"
                    value={Tip_Insumo}
                    onChange={(e) => setTipo(e.target.value)}
                >
                    <option value="" disabled>Seleccione tipo</option>
                    <option value="lacteos">lacteos</option>
                    <option value="carnicos">carnicos</option>
                    <option value="chocolateria">chocolateria</option>
                    <option value="panaderia">panaderia</option>
                    <option value="fruhor">fruhor</option>
                    <option value="cafe">cafe</option>
                    <option value="bebidas">bebidas</option>
                    <option value="licores">licores</option>
                    <option value="condimentos">Condimentos</option>
                    <option value="especias">Especias</option>
                    <option value="frutas">Frutas</option>
                    <option value="verduras">Verduras</option>
                    <option value="granos">Granos</option>
                    <option value="cereales">Cereales</option>
                    <option value="aceites">Aceites</option>
                    <option value="salsas">Salsas</option>
                    <option value="enlatados">Enlatados</option>
                    <option value="congelados">Congelados</option>
                </select>
            </div>
            <div className="mb-3">
                <label>unidad de medida del insumo</label>
                <select
                    className="form-control"
                    value={Uni_Med_Insumo}
                    onChange={(e) => setUnidad(e.target.value)}
                >
                    <option value="" disabled>Seleccione tipo</option>
                    <option value="gr">gramos</option>
                    <option value="kg">kilogramos</option>
                    <option value="ml">mililitros</option>
                    <option value="l">litros</option>
                    <option value="lbs">libras</option>
                </select>
            </div>
            <div className="mb-3">
                <label>Referencia del Insumo</label>
                <select
                    className="form-control"
                    value={Ref_Insumo}
                    onChange={(e) => setReferencia(e.target.value)}
                >
                    <option value="" disabled>Seleccione referencia</option>
                    <option value="IN">Insumo</option>
                    <option value="MP">Materia Prima</option>
                </select>
            </div>
            <div className="mb-3">
                <label>Código</label>
                <input
                    className="form-control"
                    value={Codigo_Insumo}
                    onChange={(e) => setCodigo(e.target.value)}
                />
            </div>
            <button className="btn btn-primary w-100" type="submit">
                {textFormButton}
            </button>
        </form>
    );
};

export default InsumosForm;