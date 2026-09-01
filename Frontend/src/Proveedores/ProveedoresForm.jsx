import { useState, useEffect } from "react";
import apiAxios from "../api/axiosConfig.js";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
    Truck, Building2, Hash, Phone, Mail, MapPin,
    Save, X, AlertCircle
} from "lucide-react";

const inputBase = "tw-w-full tw-px-4 tw-py-2.5 tw-rounded-xl tw-border tw-bg-gray-50 tw-text-sm tw-text-gray-700 focus:tw-outline-none focus:tw-border-primario-500 focus:tw-ring-2 focus:tw-ring-primario-100 focus:tw-bg-white tw-transition-all tw-duration-200";
const inputValid = "tw-border-gray-200";
const inputError = "tw-border-red-400 tw-ring-2 tw-ring-red-100 tw-bg-red-50/30";
const labelClass = "tw-flex tw-items-center tw-gap-1.5 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wide tw-mb-1.5";

const ProveedoresForm = ({ hideModal, proveedorSeleccionado }) => {

    const MySwal = withReactContent(Swal);

    // STATES
    const [Nom_Proveedor, setNombre] = useState('');
    const [Raz_Social, setRazonSocial] = useState('');
    const [Nit_Proveedor, setNit] = useState('');
    const [Tel_Proveedor, setTelefono] = useState('');
    const [Cor_Proveedor, setCorreo] = useState('');
    const [Dir_Proveedor, setDireccion] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const isEditing = !!proveedorSeleccionado;

    // CARGAR DATOS CUANDO SE EDITA
    useEffect(() => {
        if (proveedorSeleccionado) {
            setNombre(proveedorSeleccionado.Nom_Proveedor || '');
            setRazonSocial(proveedorSeleccionado.Raz_Social || '');
            setNit(proveedorSeleccionado.Nit_Proveedor || '');
            setTelefono(proveedorSeleccionado.Tel_Proveedor || '');
            setCorreo(proveedorSeleccionado.Cor_Proveedor || '');
            setDireccion(proveedorSeleccionado.Dir_Proveedor || '');
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
        setErrors({});
        setTouched({});
    };

    // Validación en tiempo real
    const validate = (field, value) => {
        const newErrors = { ...errors };

        switch (field) {
            case 'Nom_Proveedor':
                if (!value.trim()) newErrors.Nom_Proveedor = 'El nombre es obligatorio';
                else if (value.trim().length < 3) newErrors.Nom_Proveedor = 'Mínimo 3 caracteres';
                else delete newErrors.Nom_Proveedor;
                break;
            case 'Raz_Social':
                if (!value.trim()) newErrors.Raz_Social = 'La razón social es obligatoria';
                else delete newErrors.Raz_Social;
                break;
            case 'Nit_Proveedor':
                if (!value.trim()) newErrors.Nit_Proveedor = 'El NIT es obligatorio';
                else delete newErrors.Nit_Proveedor;
                break;
            case 'Tel_Proveedor':
                if (!value.trim()) newErrors.Tel_Proveedor = 'El teléfono es obligatorio';
                else if (!/^[0-9+\-\s()]{7,15}$/.test(value.trim())) newErrors.Tel_Proveedor = 'Formato de teléfono inválido';
                else delete newErrors.Tel_Proveedor;
                break;
            case 'Cor_Proveedor':
                if (!value.trim()) newErrors.Cor_Proveedor = 'El correo es obligatorio';
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) newErrors.Cor_Proveedor = 'Correo electrónico inválido';
                else delete newErrors.Cor_Proveedor;
                break;
            case 'Dir_Proveedor':
                if (!value.trim()) newErrors.Dir_Proveedor = 'La dirección es obligatoria';
                else delete newErrors.Dir_Proveedor;
                break;
        }

        setErrors(newErrors);
        return newErrors;
    };

    const handleChange = (field, setter) => (e) => {
        const value = e.target.value;
        setter(value);
        if (touched[field]) {
            validate(field, value);
        }
    };

    const handleBlur = (field, value) => () => {
        setTouched(prev => ({ ...prev, [field]: true }));
        validate(field, value);
    };

    const validateAll = () => {
        const fields = {
            Nom_Proveedor, Raz_Social, Nit_Proveedor,
            Tel_Proveedor, Cor_Proveedor, Dir_Proveedor
        };
        let allErrors = {};
        const allTouched = {};
        Object.entries(fields).forEach(([field, value]) => {
            allTouched[field] = true;
            const result = validate(field, value);
            allErrors = { ...allErrors, ...result };
        });
        setTouched(allTouched);
        setErrors(allErrors);
        return Object.keys(allErrors).length === 0;
    };

    const gestionarForm = async (e) => {
        e.preventDefault();

        if (!validateAll()) {
            return MySwal.fire({
                title: "Campos incompletos",
                text: "Por favor corrige los campos marcados en rojo antes de continuar.",
                icon: "warning",
                confirmButtonColor: "#153753"
            });
        }

        setLoading(true);

        const data = {
            Nom_Proveedor: Nom_Proveedor.trim(),
            Raz_Social: Raz_Social.trim(),
            Nit_Proveedor: Nit_Proveedor.trim(),
            Tel_Proveedor: Tel_Proveedor.trim(),
            Cor_Proveedor: Cor_Proveedor.trim(),
            Dir_Proveedor: Dir_Proveedor.trim()
        };

        try {
            if (!isEditing) {
                await apiAxios.post("/api/proveedores", data);
                MySwal.fire({
                    title: "Creado",
                    text: "Proveedor creado correctamente",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                await apiAxios.put(
                    `/api/proveedores/${proveedorSeleccionado.Id_Proveedor}`,
                    data
                );
                MySwal.fire({
                    title: "Actualizado",
                    text: "Proveedor actualizado correctamente",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                });
            }

            limpiarFormulario();
            hideModal();

        } catch (error) {
            console.error("Error:", error);
            MySwal.fire({
                title: "Error",
                text: error.response?.data?.message || "Ocurrió un error al guardar",
                icon: "error",
                confirmButtonColor: "#153753"
            });
        } finally {
            setLoading(false);
        }
    };

    // Helper para renderizar cada campo
    const renderField = ({ field, label, icon: Icon, value, setter, type = "text", placeholder = "", colSpan = false }) => {
        const hasError = touched[field] && errors[field];
        return (
            <div className={colSpan ? "md:tw-col-span-2" : ""}>
                <label className={labelClass}>
                    <Icon className="tw-w-3.5 tw-h-3.5" />
                    {label} <span className="tw-text-red-400">*</span>
                </label>
                <div className="tw-relative">
                    <input
                        type={type}
                        className={`${inputBase} ${hasError ? inputError : inputValid}`}
                        placeholder={placeholder}
                        value={value}
                        onChange={handleChange(field, setter)}
                        onBlur={handleBlur(field, value)}
                    />
                    {hasError && (
                        <div className="tw-absolute tw-right-3 tw-top-1/2 -tw-translate-y-1/2">
                            <AlertCircle className="tw-w-4 tw-h-4 tw-text-red-400" />
                        </div>
                    )}
                </div>
                {hasError && (
                    <p className="tw-mt-1 tw-text-xs tw-text-red-500 tw-flex tw-items-center tw-gap-1">
                        {errors[field]}
                    </p>
                )}
            </div>
        );
    };

    return (
        <form onSubmit={gestionarForm} className="tw-space-y-6">

            {/* Sección: Información General */}
            <div>
                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-4">
                    <div className="tw-h-px tw-flex-1 tw-bg-gradient-to-r tw-from-primario-900/20 tw-to-transparent"></div>
                    <span className="tw-text-xs tw-font-bold tw-text-primario-900 tw-uppercase tw-tracking-widest">
                        Información General
                    </span>
                    <div className="tw-h-px tw-flex-1 tw-bg-gradient-to-l tw-from-primario-900/20 tw-to-transparent"></div>
                </div>

                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-5">
                    {renderField({
                        field: 'Nom_Proveedor',
                        label: 'Nombre del proveedor',
                        icon: Truck,
                        value: Nom_Proveedor,
                        setter: setNombre,
                        placeholder: 'Ej: Distribuidora ABC'
                    })}
                    {renderField({
                        field: 'Raz_Social',
                        label: 'Razón social',
                        icon: Building2,
                        value: Raz_Social,
                        setter: setRazonSocial,
                        placeholder: 'Ej: ABC S.A.S'
                    })}
                    {renderField({
                        field: 'Nit_Proveedor',
                        label: 'NIT',
                        icon: Hash,
                        value: Nit_Proveedor,
                        setter: setNit,
                        placeholder: 'Ej: 900.123.456-7'
                    })}
                </div>
            </div>

            {/* Sección: Contacto */}
            <div>
                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-4">
                    <div className="tw-h-px tw-flex-1 tw-bg-gradient-to-r tw-from-primario-900/20 tw-to-transparent"></div>
                    <span className="tw-text-xs tw-font-bold tw-text-primario-900 tw-uppercase tw-tracking-widest">
                        Información de Contacto
                    </span>
                    <div className="tw-h-px tw-flex-1 tw-bg-gradient-to-l tw-from-primario-900/20 tw-to-transparent"></div>
                </div>

                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-5">
                    {renderField({
                        field: 'Tel_Proveedor',
                        label: 'Teléfono',
                        icon: Phone,
                        value: Tel_Proveedor,
                        setter: setTelefono,
                        type: 'tel',
                        placeholder: 'Ej: 310 123 4567'
                    })}
                    {renderField({
                        field: 'Cor_Proveedor',
                        label: 'Correo electrónico',
                        icon: Mail,
                        value: Cor_Proveedor,
                        setter: setCorreo,
                        type: 'email',
                        placeholder: 'Ej: contacto@empresa.com'
                    })}
                    {renderField({
                        field: 'Dir_Proveedor',
                        label: 'Dirección',
                        icon: MapPin,
                        value: Dir_Proveedor,
                        setter: setDireccion,
                        placeholder: 'Ej: Cra 10 #25-30, Bogotá',
                        colSpan: true
                    })}
                </div>
            </div>

            {/* Botones de acción */}
            <div className="tw-flex tw-gap-3 tw-pt-2">
                <button
                    type="button"
                    onClick={() => {
                        limpiarFormulario();
                        hideModal();
                    }}
                    className="tw-flex-1 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-5 tw-py-3 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-white tw-text-gray-600 tw-font-semibold hover:tw-bg-gray-50 tw-transition-all tw-duration-200"
                >
                    <X className="tw-w-4 tw-h-4" />
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="tw-flex-[2] tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-5 tw-py-3 tw-rounded-xl tw-bg-primario-900 tw-text-white tw-font-semibold hover:tw-bg-primario-700 tw-transition-all tw-duration-200 tw-shadow-lg tw-shadow-primario-900/20 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
                >
                    {loading ? (
                        <div className="tw-w-5 tw-h-5 tw-border-2 tw-border-white/30 tw-border-t-white tw-rounded-full tw-animate-spin" />
                    ) : (
                        <Save className="tw-w-4 tw-h-4" />
                    )}
                    {isEditing ? "Actualizar proveedor" : "Guardar proveedor"}
                </button>
            </div>
        </form>
    );
};

export default ProveedoresForm;
