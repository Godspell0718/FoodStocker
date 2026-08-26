import { useState, useEffect } from "react";
import apiAxios from "../api/axiosConfig.js";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const InsumosForm = ({ hideModal, insumoParaEditar }) => {
    const MySwal = withReactContent(Swal);

    const [Nom_Insumo, setNombre]     = useState('');
    const [Tip_Insumo, setTipo]       = useState('');
    const [Ref_Insumo, setReferencia] = useState('');
    const [textFormButton, setTextFormButton] = useState("Enviar");

    useEffect(() => {
        if (insumoParaEditar) {
            setNombre(insumoParaEditar.Nom_Insumo || '');
            setTipo(insumoParaEditar.Tip_Insumo || '');
            setReferencia(insumoParaEditar.Ref_Insumo || '');
            setTextFormButton("Actualizar");
        } else {
            limpiarFormulario();
        }
    }, [insumoParaEditar]);

    const limpiarFormulario = () => {
        setNombre('');
        setTipo('');
        setReferencia('');
        setTextFormButton("Enviar");
    };

    const gestionarForm = async (e) => {
        e.preventDefault();

        // Validación mínima recomendada
        if (!Nom_Insumo.trim()) {
            MySwal.fire({ title: "Atención", text: "El nombre del insumo es obligatorio", icon: "warning" });
            return;
        }

        const data = {
            Nom_Insumo,
            Tip_Insumo,
            Ref_Insumo
        };

        try {
            if (textFormButton === "Enviar") {
                await apiAxios.post("/api/insumos/", data);
                MySwal.fire({ title: "Creado", text: "Insumo creado correctamente", icon: "success" });
            }

            if (textFormButton === "Actualizar") {
                await apiAxios.put(
                    `/api/insumos/${insumoParaEditar.Id_Insumos}`,
                    data
                );
                MySwal.fire({ title: "Actualizado", text: "Insumo actualizado correctamente", icon: "success" });
            }

            limpiarFormulario();
            hideModal();

        } catch (error) {
            console.error("Error:", error);
            MySwal.fire({
                title: "Error",
                text: error.response?.data?.mensaje || "Ocurrió un error al guardar",
                icon: "error"
            });
        }
    };

    return (
        <form onSubmit={gestionarForm} className="tw-space-y-5">
            <div>
                <label className="tw-block tw-text-sm tw-font-medium tw-text-slate-700 tw-mb-1.5">
                    Nombre del Insumo <span className="tw-text-red-500">*</span>
                </label>
                <input
                    className="tw-w-full tw-px-4 tw-py-2.5 tw-border tw-border-slate-200 tw-rounded-xl tw-bg-slate-50 tw-text-slate-700 tw-placeholder-slate-400 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-primario-500/20 focus:tw-border-primario-500 tw-transition-all"
                    placeholder="Ej: Harina de trigo"
                    value={Nom_Insumo}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                />
            </div>

            <div>
                <label className="tw-block tw-text-sm tw-font-medium tw-text-slate-700 tw-mb-1.5">
                    Tipo de insumo
                </label>
                <select
                    className="tw-w-full tw-px-4 tw-py-2.5 tw-border tw-border-slate-200 tw-rounded-xl tw-bg-slate-50 tw-text-slate-700 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-primario-500/20 focus:tw-border-primario-500 tw-transition-all tw-appearance-none"
                    value={Tip_Insumo}
                    onChange={(e) => setTipo(e.target.value)}
                >
                    <option value="">Seleccione tipo</option>
                    <option value="lacteos">Lácteos</option>
                    <option value="carnicos">Cárnicos</option>
                    <option value="chocolateria">Chocolatería</option>
                    <option value="panaderia">Panadería</option>
                    <option value="fruhor">FruHor</option>
                    <option value="cafe">Café</option>
                    <option value="bebidas">Bebidas</option>
                    <option value="licores">Licores</option>
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

            <div>
                <label className="tw-block tw-text-sm tw-font-medium tw-text-slate-700 tw-mb-1.5">
                    Referencia del Insumo
                </label>
                <select
                    className="tw-w-full tw-px-4 tw-py-2.5 tw-border tw-border-slate-200 tw-rounded-xl tw-bg-slate-50 tw-text-slate-700 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-primario-500/20 focus:tw-border-primario-500 tw-transition-all tw-appearance-none"
                    value={Ref_Insumo}
                    onChange={(e) => setReferencia(e.target.value)}
                >
                    <option value="">Seleccione referencia</option>
                    <option value="IN">Insumo</option>
                    <option value="MP">Materia Prima</option>
                </select>
            </div>

            <button 
                className="tw-w-full tw-py-2.5 tw-bg-primario-900 hover:tw-bg-primario-700 tw-text-white tw-font-medium tw-rounded-xl tw-shadow-md hover:tw-shadow-lg tw-transition-all tw-duration-200"
                type="submit"
            >
                {textFormButton}
            </button>
        </form>
    );
};

export default InsumosForm;