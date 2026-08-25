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

        // 🚫 Validar que ningún campo esté vacío
        if (
            !Nom_Proveedor.trim() ||
            !Raz_Social.trim() ||
            !Nit_Proveedor.trim() ||
            !Tel_Proveedor.trim() ||
            !Cor_Proveedor.trim() ||
            !Dir_Proveedor.trim()
        ) {
            return MySwal.fire({
                title: "Validación",
                text: "Todos los campos son obligatorios y no pueden contener solo espacios.",
                icon: "warning"
            });
        }

        // 📧 Validación básica de correo electrónico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(Cor_Proveedor.trim())) {
            return MySwal.fire({
                title: "Validación",
                text: "Por favor introduce un correo electrónico válido.",
                icon: "warning"
            });
        }

        const data = {
            Nom_Proveedor: Nom_Proveedor.trim(),
            Raz_Social: Raz_Social.trim(),
            Nit_Proveedor: Nit_Proveedor.trim(),
            Tel_Proveedor: Tel_Proveedor.trim(),
            Cor_Proveedor: Cor_Proveedor.trim(),
            Dir_Proveedor: Dir_Proveedor.trim()
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
                text: error.response?.data?.message || "Ocurrió un error al guardar",
                icon: "error"
            });
        }
    };

    return (
        <form onSubmit={gestionarForm}>

            <div className="mb-3">
                <label>Nombre *</label>
                <input
                    type="text"
                    className="form-control"
                    value={Nom_Proveedor}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                />
            </div>

            <div className="mb-3">
                <label>Razón Social *</label>
                <input
                    type="text"
                    className="form-control"
                    value={Raz_Social}
                    onChange={(e) => setRazonSocial(e.target.value)}
                    required
                />
            </div>

            <div className="mb-3">
                <label>NIT *</label>
                <input
                    type="text"
                    className="form-control"
                    value={Nit_Proveedor}
                    onChange={(e) => setNit(e.target.value)}
                    required
                />
            </div>

            <div className="mb-3">
                <label>Teléfono *</label>
                <input
                    type="tel"
                    className="form-control"
                    value={Tel_Proveedor}
                    onChange={(e) => setTelefono(e.target.value)}
                    required
                />
            </div>

            <div className="mb-3">
                <label>Correo *</label>
                <input
                    type="email"
                    className="form-control"
                    value={Cor_Proveedor}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                />
            </div>

            <div className="mb-3">
                <label>Dirección *</label>
                <input
                    type="text"
                    className="form-control"
                    value={Dir_Proveedor}
                    onChange={(e) => setDireccion(e.target.value)}
                    required
                />
            </div>

            <button className="btn btn-primary w-100" type="submit">
                {textFormButton}
            </button>
        </form>
    );
};

export default ProveedoresForm;
