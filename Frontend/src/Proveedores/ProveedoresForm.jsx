import { useState, useEffect } from "react";
import apiAxios from "../api/axiosConfig.js";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const ProveedoresForm = ({ hideModal, proveedorSeleccionado }) => {

    const MySwal = withReactContent(Swal);

    // STATES
    const [Nom_Proveedor, setNombre] = useState('');
    const [Raz_Social, setRazonSocial] = useState('');
    const [Nit_Proveedor, setNit] = useState('');
    const [Tel_Proveedor, setTelefono] = useState('');
    const [Cor_Proveedor, setCorreo] = useState('');
    const [Dir_Proveedor, setDireccion] = useState('');
    const [textFormButton, setTextFormButton] = useState("Enviar");

    // CARGAR DATOS CUANDO SE EDITA
    useEffect(() => {
        if (proveedorSeleccionado) {
            setNombre(proveedorSeleccionado.Nom_Proveedor || '');
            setRazonSocial(proveedorSeleccionado.Raz_Social || '');
            setNit(proveedorSeleccionado.Nit_Proveedor || '');
            setTelefono(proveedorSeleccionado.Tel_Proveedor || '');
            setCorreo(proveedorSeleccionado.Cor_Proveedor || '');
            setDireccion(proveedorSeleccionado.Dir_Proveedor || '');
            setTextFormButton("Actualizar");
        } else {
            limpiarFormulario();
        }
    }, [proveedorSeleccionado]);

    const limpiarFormulario = () => {
        setNombre('');
        setRazonSocial('');
        setNit('');
        setTelefono('');
        setCorreo('');
        setDireccion('');
        setTextFormButton("Enviar");
    };

    const gestionarForm = async (e) => {
        e.preventDefault();

        const data = {
            Nom_Proveedor,
            Raz_Social,
            Nit_Proveedor,
            Tel_Proveedor,
            Cor_Proveedor,
            Dir_Proveedor
        };

        try {
            if (textFormButton === "Enviar") {
                await apiAxios.post("/api/proveedores", data);
                MySwal.fire({
                    title: "Creado",
                    text: "Proveedor creado correctamente",
                    icon: "success"
                });
            }

            if (textFormButton === "Actualizar") {
                await apiAxios.put(
                    `/api/proveedores/${proveedorSeleccionado.Id_Proveedor}`,
                    data
                );
                MySwal.fire({
                    title: "Actualizado",
                    text: "Proveedor actualizado correctamente",
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
                <label>Nombre</label>
                <input
                    className="form-control"
                    value={Nom_Proveedor}
                    onChange={(e) => setNombre(e.target.value)}
                />
            </div>

            <div className="mb-3">
                <label>Razón Social</label>
                <input
                    className="form-control"
                    value={Raz_Social}
                    onChange={(e) => setRazonSocial(e.target.value)}
                />
            </div>

            <div className="mb-3">
                <label>NIT</label>
                <input
                    className="form-control"
                    value={Nit_Proveedor}
                    onChange={(e) => setNit(e.target.value)}
                />
            </div>

            <div className="mb-3">
                <label>Teléfono</label>
                <input
                    className="form-control"
                    value={Tel_Proveedor}
                    onChange={(e) => setTelefono(e.target.value)}
                />
            </div>

            <div className="mb-3">
                <label>Correo</label>
                <input
                    className="form-control"
                    value={Cor_Proveedor}
                    onChange={(e) => setCorreo(e.target.value)}
                />
            </div>

            <div className="mb-3">
                <label>Dirección</label>
                <input
                    className="form-control"
                    value={Dir_Proveedor}
                    onChange={(e) => setDireccion(e.target.value)}
                />
            </div>

            <button className="btn btn-primary w-100" type="submit">
                {textFormButton}
            </button>
        </form>
    );
};

export default ProveedoresForm;
