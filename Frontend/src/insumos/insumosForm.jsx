import { useState, useEffect } from "react";
import apiAxios from "../api/axiosConfig.js";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Package, Tag, Layers, ChevronDown, Save, X } from "lucide-react";

const inputClass = "tw-w-full tw-px-4 tw-py-2.5 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-gray-50 tw-text-sm tw-text-gray-700 focus:tw-outline-none focus:tw-border-primario-500 focus:tw-ring-2 focus:tw-ring-primario-100 focus:tw-bg-white tw-transition-all";
const labelClass = "tw-block tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wide tw-mb-1.5";
const selectClass = "tw-w-full tw-px-4 tw-py-2.5 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-gray-50 tw-text-sm tw-text-gray-700 focus:tw-outline-none focus:tw-border-primario-500 focus:tw-ring-2 focus:tw-ring-primario-100 focus:tw-bg-white tw-transition-all tw-appearance-none";

const categoriasInsumo = [
    { value: "lacteos", label: "Lácteos" },
    { value: "carnicos", label: "Cárnicos" },
    { value: "chocolateria", label: "Chocolatería" },
    { value: "panaderia", label: "Panadería" },
    { value: "bebidas", label: "Bebidas" },
    { value: "condimentos", label: "Condimentos" },
    { value: "especias", label: "Especias" },
    { value: "frutas", label: "Frutas" },
    { value: "verduras", label: "Verduras" },
    { value: "granos", label: "Granos" },
    { value: "cereales", label: "Cereales" },
    { value: "aceites", label: "Aceites" },
    { value: "salsas", label: "Salsas" },
    { value: "enlatados", label: "Enlatados" },
    { value: "congelados", label: "Congelados" },
];

const referenciasInsumo = [
    { value: "MP", label: "MP - Materia Prima" },
    { value: "IN", label: "IN - Insumo" },
    { value: "MR", label: "MR - Material de Reposición" },
    { value: "PT", label: "PT - Producto Terminado" },
    { value: "PP", label: "PP - Producto en Proceso" },
];

const InsumosForm = ({ hideModal, insumoParaEditar, onSuccess }) => {
    const MySwal = withReactContent(Swal);

    const [Nom_Insumo, setNombre] = useState('');
    const [Tip_Insumo, setTipo] = useState('lacteos');
    const [Ref_Insumo, setReferencia] = useState('MP');
    const [loading, setLoading] = useState(false);

    const isEditing = !!insumoParaEditar;

    useEffect(() => {
        if (insumoParaEditar) {
            setNombre(insumoParaEditar.Nom_Insumo || '');
            setTipo(insumoParaEditar.Tip_Insumo || 'lacteos');
            setReferencia(insumoParaEditar.Ref_Insumo || 'MP');
        } else {
            limpiarFormulario();
        }
    }, [insumoParaEditar]);

    const limpiarFormulario = () => {
        setNombre('');
        setTipo('lacteos');
        setReferencia('MP');
    };

    const gestionarForm = async (e) => {
        e.preventDefault();

        if (!Nom_Insumo.trim() || Nom_Insumo.trim().length < 2) {
            return MySwal.fire({
                title: "Campo requerido",
                text: "El nombre del insumo debe tener al menos 2 caracteres.",
                icon: "warning"
            });
        }

        if (!Tip_Insumo) {
            return MySwal.fire({
                title: "Campo requerido",
                text: "Seleccione un tipo de insumo válido.",
                icon: "warning"
            });
        }

        setLoading(true);

        const data = {
            Nom_Insumo: Nom_Insumo.trim(),
            Tip_Insumo,
            Ref_Insumo: Ref_Insumo || 'MP'
        };

        try {
            if (!isEditing) {
                await apiAxios.post("/api/insumos/", data);
                MySwal.fire({
                    icon: 'success',
                    title: 'Insumo creado',
                    text: 'El insumo fue registrado correctamente',
                    timer: 1800,
                    showConfirmButton: false
                });
            } else {
                await apiAxios.put(`/api/insumos/${insumoParaEditar.Id_Insumos}`, data);
                MySwal.fire({
                    icon: 'success',
                    title: 'Insumo actualizado',
                    text: 'Los cambios fueron guardados correctamente',
                    timer: 1800,
                    showConfirmButton: false
                });
            }

            if (onSuccess) onSuccess();
            limpiarFormulario();
            hideModal();

        } catch (error) {
            console.error("Error al guardar insumo:", error);
            MySwal.fire({
                title: "Error",
                text: error.response?.data?.mensaje || error.response?.data?.error || "Ocurrió un error al guardar",
                icon: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={gestionarForm} className="tw-space-y-4">
            {/* Nombre del Insumo */}
            <div>
                <label className={labelClass}>
                    <Package className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1.5 tw-text-primario-900" />
                    Nombre del Insumo <span className="tw-text-red-500">*</span>
                </label>
                <input
                    type="text"
                    className={inputClass}
                    placeholder="Ej: Harina de trigo, Leche entera..."
                    value={Nom_Insumo}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                />
            </div>

            {/* Tipo de Insumo */}
            <div>
                <label className={labelClass}>
                    <Tag className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1.5 tw-text-primario-900" />
                    Tipo / Categoría <span className="tw-text-red-500">*</span>
                </label>
                <div className="tw-relative">
                    <select
                        className={selectClass}
                        value={Tip_Insumo}
                        onChange={(e) => setTipo(e.target.value)}
                        required
                    >
                        {categoriasInsumo.map(cat => (
                            <option key={cat.value} value={cat.value}>
                                {cat.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="tw-absolute tw-right-4 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-gray-400 tw-pointer-events-none" />
                </div>
            </div>

            {/* Referencia */}
            <div>
                <label className={labelClass}>
                    <Layers className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1.5 tw-text-primario-900" />
                    Referencia de Insumo <span className="tw-text-red-500">*</span>
                </label>
                <div className="tw-relative">
                    <select
                        className={selectClass}
                        value={Ref_Insumo}
                        onChange={(e) => setReferencia(e.target.value)}
                        required
                    >
                        {referenciasInsumo.map(ref => (
                            <option key={ref.value} value={ref.value}>
                                {ref.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="tw-absolute tw-right-4 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-gray-400 tw-pointer-events-none" />
                </div>
            </div>

            {/* Botones de acción */}
            <div className="tw-flex tw-gap-3 tw-pt-3">
                <button
                    type="button"
                    onClick={hideModal}
                    className="tw-flex-1 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-4 tw-py-2.5 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-white tw-text-gray-600 tw-font-semibold hover:tw-bg-gray-50 tw-transition-all"
                >
                    <X className="tw-w-4 tw-h-4" />
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="tw-flex-[2] tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-4 tw-py-2.5 tw-rounded-xl tw-bg-primario-900 tw-text-white tw-font-semibold hover:tw-bg-primario-700 tw-transition-all tw-shadow-lg tw-shadow-primario-900/20 disabled:tw-opacity-50"
                >
                    {loading ? (
                        <div className="tw-w-5 tw-h-5 tw-border-2 tw-border-white/30 tw-border-t-white tw-rounded-full tw-animate-spin" />
                    ) : (
                        <Save className="tw-w-4 tw-h-4" />
                    )}
                    {isEditing ? "Actualizar Insumo" : "Guardar Insumo"}
                </button>
            </div>
        </form>
    );
};

export default InsumosForm;