import { useState, useEffect } from "react";
import apiAxios from "../api/axiosConfig.js";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const ResponsablesForm = ({ hideModal, responsableSeleccionado }) => {
    const MySwal = withReactContent(Swal)

    const [Nom_Responsable, setNombre] = useState('');
    const [Doc_Responsable, setDocumento] = useState('');
    const [Cor_Responsable, setCorreo] = useState('');
    const [Tel_Responsable, setTelefono] = useState('');
    const [Tip_Responsable, setTipo] = useState('P');
    const [textFormButton, setTextFormButton] = useState("Enviar");

    // 🟢 RESET AUTOMÁTICO DEL FORMULARIO
    useEffect(() => {
        if (responsableSeleccionado) {
            setNombre(responsableSeleccionado.Nom_Responsable || '');
            setDocumento(responsableSeleccionado.Doc_Responsable || '');
            setCorreo(responsableSeleccionado.Cor_Responsable || '');
            setTelefono(responsableSeleccionado.Tel_Responsable || '');
            setTipo(responsableSeleccionado.Tip_Responsable || 'P');
            setTextFormButton("Actualizar");
        } else {
            limpiarFormulario();
        }
    }, [responsableSeleccionado]);

    const limpiarFormulario = () => {
        setNombre('');
        setDocumento('');
        setCorreo('');
        setTelefono('');
        setTipo('P');
        setTextFormButton("Enviar");
    };

    const gestionarForm = async (e) => {
        e.preventDefault();

        const data = {
            Nom_Responsable,
            Doc_Responsable,
            Cor_Responsable,
            Tel_Responsable,
            Tip_Responsable
        };

        try {
        if (textFormButton === "Enviar") {
            await apiAxios.post("/api/responsables", data);

            MySwal.fire({
                title: "Registro exitoso",
                text: "Responsable creado correctamente",
                icon: "success"
            });

            limpiarFormulario();
        }

        if (textFormButton === "Actualizar") {
            await apiAxios.put(
                `/api/responsables/${responsableSeleccionado.Id_Responsable}`,
                data
            );

            MySwal.fire({
                title: "Actualización",
                text: "Responsable actualizado correctamente",
                icon: "success"
            });
        }

        hideModal();

    } catch (error) {
        console.error("Error:", error);
        MySwal.fire({
            title: "Error",
            text: "Ocurrió un error",
            icon: "error"
        });
    }
};

    return (
        <form onSubmit={gestionarForm}>

            <div className="mb-3">
                <label>Nombre</label>
                <input
                    className="form-control"
                    value={Nom_Responsable}
                    onChange={(e) => setNombre(e.target.value)}
                />
            </div>

            <div className="mb-3">
                <label>Documento</label>
                <input
                    className="form-control"
                    value={Doc_Responsable}
                    onChange={(e) => setDocumento(e.target.value)}
                />
            </div>

            <div className="mb-3">
                <label>Correo</label>
                <input
                    className="form-control"
                    value={Cor_Responsable}
                    onChange={(e) => setCorreo(e.target.value)}
                />
            </div>

            <div className="mb-3">
                <label>Teléfono</label>
                <input
                    className="form-control"
                    value={Tel_Responsable}
                    onChange={(e) => setTelefono(e.target.value)}
                />
            </div>

            <div className="mb-3">
                <label>Tipo</label>
                <select
                    className="form-control"
                    value={Tip_Responsable}
                    onChange={(e) => setTipo(e.target.value)}
                >
                    <option value="P">Pasante</option>
                    <option value="I">Instructor</option>
                </select>
            </div>

            <button className="btn btn-primary w-100" type="submit">
                {textFormButton}
            </button>

        </form>
    );
};

export default ResponsablesForm;
