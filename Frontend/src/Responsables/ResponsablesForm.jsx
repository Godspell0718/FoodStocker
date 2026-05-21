import { useState, useEffect } from "react";
import apiAxios from "../api/axiosConfig.js";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
    User, FileText, Mail, Phone, Lock, Shield,
    ChevronDown, Save, X, Eye, EyeOff
} from "lucide-react";

const inputClass = "tw-w-full tw-px-4 tw-py-2.5 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-gray-50 tw-text-sm tw-text-gray-700 focus:tw-outline-none focus:tw-border-primario-500 focus:tw-ring-2 focus:tw-ring-primario-100 focus:tw-bg-white tw-transition-all"
const labelClass = "tw-block tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wide tw-mb-1.5"
const selectClass = "tw-w-full tw-px-4 tw-py-2.5 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-gray-50 tw-text-sm tw-text-gray-700 focus:tw-outline-none focus:tw-border-primario-500 focus:tw-ring-2 focus:tw-ring-primario-100 focus:tw-bg-white tw-transition-all tw-appearance-none"

const tipoConfig = {
    ADMIN: { label: "Administrador", color: "tw-bg-red-100 tw-text-red-700", icon: "🛡️" },
    PA: { label: "Pasante Agroindustria", color: "tw-bg-emerald-100 tw-text-emerald-700", icon: "🌿" },
    IA: { label: "Instructor Agroindustria", color: "tw-bg-blue-100 tw-text-blue-700", icon: "📋" },
    PDU: { label: "Pasante", color: "tw-bg-amber-100 tw-text-amber-700", icon: "🎓" },
    IDU: { label: "Instructor", color: "tw-bg-purple-100 tw-text-purple-700", icon: "👨‍🏫" },
}

const ResponsablesForm = ({ hideModal, responsableSeleccionado }) => {
    const MySwal = withReactContent(Swal);

    const [Nom_Responsable, setNombre] = useState('');
    const [Doc_Responsable, setDocumento] = useState('');
    const [Cor_Responsable, setCorreo] = useState('');
    const [Tel_Responsable, setTelefono] = useState('');
    const [Tip_Responsable, setTipo] = useState('PDU');
    const [contrasena, setContrasena] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const isEditing = !!responsableSeleccionado;

    useEffect(() => {
        if (responsableSeleccionado) {
            setNombre(responsableSeleccionado.Nom_Responsable || '');
            setDocumento(responsableSeleccionado.Doc_Responsable || '');
            setCorreo(responsableSeleccionado.Cor_Responsable || '');
            setTelefono(responsableSeleccionado.Tel_Responsable || '');
            setTipo(responsableSeleccionado.Tip_Responsable || 'PDU');
            setContrasena('');
        } else {
            limpiarFormulario();
        }
    }, [responsableSeleccionado]);

    const limpiarFormulario = () => {
        setNombre('');
        setDocumento('');
        setCorreo('');
        setTelefono('');
        setTipo('PDU');
        setContrasena('');
    };

    const gestionarForm = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = {
            Nom_Responsable,
            Doc_Responsable,
            Cor_Responsable,
            Tel_Responsable,
            Tip_Responsable,
            Contraseña: contrasena
        };

        try {
            if (!isEditing) {
                await apiAxios.post("/api/responsables", data);
                MySwal.fire({
                    icon: 'success',
                    title: 'Registro exitoso',
                    text: 'Responsable creado correctamente',
                    timer: 2000,
                    showConfirmButton: false
                });
                limpiarFormulario();
            } else {
                await apiAxios.put(
                    `/api/responsables/${responsableSeleccionado.Id_Responsable}`,
                    data
                );
                MySwal.fire({
                    icon: 'success',
                    title: 'Actualización exitosa',
                    text: 'Responsable actualizado correctamente',
                    timer: 2000,
                    showConfirmButton: false
                });
            }

            hideModal();

        } catch (error) {
            console.error("Error:", error);
            MySwal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Ocurrió un error al procesar la solicitud'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={gestionarForm} className="tw-space-y-5">

            {/* Nombre completo — ancho completo */}
            <div>
                <label className={labelClass}>
                    <User className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1.5" />
                    Nombre completo
                </label>
                <input
                    type="text"
                    className={inputClass}
                    placeholder="Ej: Juan Pérez"
                    value={Nom_Responsable}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                />
            </div>

            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                {/* Documento */}
                <div>
                    <label className={labelClass}>
                        <FileText className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1.5" />
                        Documento
                    </label>
                    <input
                        type="text"
                        className={inputClass}
                        placeholder="Ej: 1234567890"
                        value={Doc_Responsable}
                        onChange={(e) => setDocumento(e.target.value)}
                        required
                    />
                </div>

                {/* Teléfono */}
                <div>
                    <label className={labelClass}>
                        <Phone className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1.5" />
                        Teléfono
                    </label>
                    <input
                        type="tel"
                        className={inputClass}
                        placeholder="Ej: 3001234567"
                        value={Tel_Responsable || ''}
                        onChange={(e) => setTelefono(e.target.value)}
                    />
                </div>
            </div>

            {/* Correo — ancho completo */}
            <div>
                <label className={labelClass}>
                    <Mail className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1.5" />
                    Correo electrónico
                </label>
                <input
                    type="email"
                    className={inputClass}
                    placeholder="Ej: usuario@correo.com"
                    value={Cor_Responsable}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                />
            </div>

            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                {/* Contraseña */}
                <div>
                    <label className={labelClass}>
                        <Lock className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1.5" />
                        {isEditing ? "Nueva contraseña" : "Contraseña"}
                    </label>
                    <div className="tw-relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            className={`${inputClass} tw-pr-10`}
                            placeholder={isEditing ? "Dejar vacío para mantener" : "Ingrese contraseña"}
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            required={!isEditing}
                        />
                        <button
                            type="button"
                            className="tw-absolute tw-right-3 tw-top-1/2 -tw-translate-y-1/2 tw-text-gray-400 hover:tw-text-gray-600 tw-transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                        >
                            {showPassword
                                ? <EyeOff className="tw-w-4 tw-h-4" />
                                : <Eye className="tw-w-4 tw-h-4" />
                            }
                        </button>
                    </div>
                    {isEditing && (
                        <p className="tw-text-xs tw-text-gray-400 tw-mt-1">
                            Solo si deseas cambiar la contraseña actual
                        </p>
                    )}
                </div>

                {/* Tipo / Rol */}
                <div>
                    <label className={labelClass}>
                        <Shield className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1.5" />
                        Rol del usuario
                    </label>
                    <div className="tw-relative">
                        <select
                            className={selectClass}
                            value={Tip_Responsable}
                            onChange={(e) => setTipo(e.target.value)}
                            required
                        >
                            <option value="ADMIN">🛡️ Administrador</option>
                            <option value="PA">🌿 Pasante Agroindustria</option>
                            <option value="IA">📋 Instructor Agroindustria</option>
                            <option value="PDU">🎓 Pasante</option>
                            <option value="IDU">👨‍🏫 Instructor</option>
                        </select>
                        <ChevronDown className="tw-absolute tw-right-4 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-gray-400 tw-pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Preview del rol seleccionado */}
            {Tip_Responsable && tipoConfig[Tip_Responsable] && (
                <div className={`tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2.5 tw-rounded-xl tw-text-sm tw-font-medium ${tipoConfig[Tip_Responsable].color}`}>
                    <span className="tw-text-base">{tipoConfig[Tip_Responsable].icon}</span>
                    <span>
                        Este usuario será registrado como <strong>{tipoConfig[Tip_Responsable].label}</strong>
                    </span>
                </div>
            )}

            {/* Botones de acción */}
            <div className="tw-flex tw-gap-3 tw-pt-2">
                <button
                    type="button"
                    onClick={hideModal}
                    className="tw-flex-1 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-5 tw-py-3 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-white tw-text-gray-600 tw-font-semibold hover:tw-bg-gray-50 tw-transition-all"
                >
                    <X className="tw-w-4 tw-h-4" />
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="tw-flex-[2] tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-5 tw-py-3 tw-rounded-xl tw-bg-primario-900 tw-text-white tw-font-semibold hover:tw-bg-primario-700 tw-transition-all tw-shadow-lg tw-shadow-primario-900/20 disabled:tw-opacity-50"
                >
                    {loading ? (
                        <div className="tw-w-5 tw-h-5 tw-border-2 tw-border-white/30 tw-border-t-white tw-rounded-full tw-animate-spin" />
                    ) : (
                        <Save className="tw-w-4 tw-h-4" />
                    )}
                    {isEditing ? "Actualizar usuario" : "Registrar usuario"}
                </button>
            </div>
        </form>
    );
};

export default ResponsablesForm;