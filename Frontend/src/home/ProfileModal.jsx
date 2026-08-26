import React, { useState, useEffect, useContext } from 'react';
import apiAxios from '../api/axiosConfig.js';
import { AuthContext } from '../context/authContext.jsx';
import Swal from 'sweetalert2';
import { User, FileText, Mail, Phone, Lock, Save, X, Eye, EyeOff, Shield } from 'lucide-react';

const inputClass = "tw-w-full tw-px-4 tw-py-2.5 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-gray-50 tw-text-sm tw-text-gray-700 focus:tw-outline-none focus:tw-border-primario-500 focus:tw-ring-2 focus:tw-ring-primario-100 focus:tw-bg-white tw-transition-all";
const labelClass = "tw-block tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wide tw-mb-1.5";

export default function ProfileModal({ isOpen, onClose }) {
    const { user, login } = useContext(AuthContext);
    const [nombre, setNombre] = useState('');
    const [documento, setDocumento] = useState('');
    const [correo, setCorreo] = useState('');
    const [telefono, setTelefono] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && user?.id) {
            cargarPerfil();
        }
    }, [isOpen, user]);

    const cargarPerfil = async () => {
        try {
            const res = await apiAxios.get(`/api/responsables/${user.id}`);
            const data = res.data;
            setNombre(data.Nom_Responsable || '');
            setDocumento(data.Doc_Responsable || '');
            setCorreo(data.Cor_Responsable || '');
            setTelefono(data.Tel_Responsable || '');
            setContrasena('');
        } catch (error) {
            console.error("Error al cargar perfil:", error);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!nombre.trim() || !correo.trim() || !documento.trim()) {
            return Swal.fire("Campo obligatorio", "Nombre, documento y correo son requeridos", "warning");
        }

        setLoading(true);
        try {
            const payload = {
                Nom_Responsable: nombre,
                Doc_Responsable: documento,
                Cor_Responsable: correo,
                Tel_Responsable: telefono
            };
            if (contrasena) {
                payload.Contraseña = contrasena;
            }

            await apiAxios.put(`/api/responsables/${user.id}`, payload);

            // Actualizar contexto local de usuario
            const storedUser = JSON.parse(localStorage.getItem('userFoodStocker') || '{}');
            const updatedUser = { ...storedUser, nombre };
            const storedToken = localStorage.getItem('tokenFoodStocker');
            login(updatedUser, storedToken);

            Swal.fire({
                icon: 'success',
                title: 'Perfil actualizado',
                text: 'Tus datos han sido actualizados correctamente',
                timer: 1800,
                showConfirmButton: false
            });
            onClose();
        } catch (error) {
            console.error("Error al actualizar perfil:", error);
            Swal.fire("Error", error.response?.data?.message || "No se pudo actualizar el perfil", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-4 tw-bg-black/50 tw-backdrop-blur-sm">
            <div className="tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-md tw-overflow-hidden tw-animate-in tw-fade-in tw-zoom-in-95 tw-duration-200">
                
                {/* Header */}
                <div className="tw-bg-primario-900 tw-px-6 tw-py-4">
                    <div className="tw-flex tw-justify-between tw-items-center">
                        <div className="tw-flex tw-items-center tw-gap-3">
                            <div className="tw-w-8 tw-h-8 tw-bg-white/20 tw-rounded-lg tw-flex tw-items-center tw-justify-center">
                                <User className="tw-w-5 tw-h-5 tw-text-secundario-400" />
                            </div>
                            <h5 className="tw-text-white tw-font-semibold tw-text-lg tw-m-0">
                                Editar Mi Perfil
                            </h5>
                        </div>
                        <button
                            type="button"
                            className="tw-text-white/70 hover:tw-text-white tw-transition-colors"
                            onClick={onClose}
                        >
                            <X className="tw-w-6 tw-h-6" />
                        </button>
                    </div>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSave} className="tw-p-6 tw-space-y-4">
                    
                    {/* Indicador de Rol (No editable por el admin para su propio usuario) */}
                    <div className="tw-bg-slate-100 tw-p-3 tw-rounded-xl tw-flex tw-items-center tw-gap-2">
                        <Shield className="tw-w-4 tw-h-4 tw-text-slate-600" />
                        <span className="tw-text-xs tw-font-semibold tw-text-slate-600">
                            Rol actual: <span className="tw-text-primario-900 tw-font-bold">{user?.rol || 'N/A'}</span>
                        </span>
                        <span className="tw-text-[10px] tw-text-slate-400 tw-ml-auto">(No modificable)</span>
                    </div>

                    <div>
                        <label className={labelClass}>
                            <User className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1.5" />
                            Nombre completo
                        </label>
                        <input
                            type="text"
                            className={inputClass}
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                        />
                    </div>

                    <div className="tw-grid tw-grid-cols-2 tw-gap-3">
                        <div>
                            <label className={labelClass}>
                                <FileText className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1.5" />
                                Documento
                            </label>
                            <input
                                type="text"
                                className={inputClass}
                                value={documento}
                                onChange={(e) => setDocumento(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className={labelClass}>
                                <Phone className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1.5" />
                                Teléfono
                            </label>
                            <input
                                type="tel"
                                className={inputClass}
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>
                            <Mail className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1.5" />
                            Correo electrónico
                        </label>
                        <input
                            type="email"
                            className={inputClass}
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className={labelClass}>
                            <Lock className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1.5" />
                            Nueva Contraseña
                        </label>
                        <div className="tw-relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className={`${inputClass} tw-pr-10`}
                                placeholder="Dejar en blanco para mantener"
                                value={contrasena}
                                onChange={(e) => setContrasena(e.target.value)}
                            />
                            <button
                                type="button"
                                className="tw-absolute tw-right-3 tw-top-1/2 -tw-translate-y-1/2 tw-text-gray-400 hover:tw-text-gray-600"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="tw-w-4 tw-h-4" /> : <Eye className="tw-w-4 tw-h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="tw-flex tw-gap-3 tw-pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="tw-flex-1 tw-px-4 tw-py-2.5 tw-rounded-xl tw-border tw-border-gray-200 tw-text-gray-600 tw-font-semibold hover:tw-bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="tw-flex-[2] tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-4 tw-py-2.5 tw-rounded-xl tw-bg-primario-900 tw-text-white tw-font-semibold hover:tw-bg-primario-700 disabled:tw-opacity-50"
                        >
                            {loading ? (
                                <div className="tw-w-4 tw-h-4 tw-border-2 tw-border-white/30 tw-border-t-white tw-rounded-full tw-animate-spin" />
                            ) : (
                                <Save className="tw-w-4 tw-h-4" />
                            )}
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
