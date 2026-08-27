import React, { useState, useEffect, useContext } from 'react';
import apiAxios from '../api/axiosConfig.js';
import { AuthContext } from '../context/authContext.jsx';
import Swal from 'sweetalert2';
import {
    User, FileText, Mail, Phone, Lock, Save, X,
    Eye, EyeOff, Shield, CircleUser, AtSign, BadgeCheck
} from 'lucide-react';

const inputClass = "tw-w-full tw-pl-11 tw-pr-4 tw-py-3 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-gray-50/80 tw-text-sm tw-text-gray-700 focus:tw-outline-none focus:tw-border-primario-500 focus:tw-ring-2 focus:tw-ring-primario-100 focus:tw-bg-white tw-transition-all tw-placeholder-gray-400";
const labelClass = "tw-block tw-text-[11px] tw-font-bold tw-text-gray-400 tw-uppercase tw-tracking-wider tw-mb-2";

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

    // Generate initials from name
    const initials = nombre
        ? nombre.split(' ').slice(0, 2).map(n => n[0]?.toUpperCase()).join('')
        : 'U';

    return (
        <div
            className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-4 tw-bg-black/50 tw-backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="tw-bg-gray-50 tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-2xl tw-overflow-hidden tw-animate-in tw-fade-in tw-zoom-in-95 tw-duration-200">

                {/* Close button */}
                <button
                    type="button"
                    className="tw-absolute tw-z-10 tw-top-4 tw-right-4 tw-w-8 tw-h-8 tw-rounded-full tw-bg-white/10 hover:tw-bg-white/20 tw-text-white tw-flex tw-items-center tw-justify-center tw-transition-colors"
                    onClick={onClose}
                >
                    <X className="tw-w-4 tw-h-4" />
                </button>

                {/* ============ PROFILE HEADER CARD ============ */}
                <div className="tw-relative tw-bg-gradient-to-r tw-from-primario-900 tw-via-slate-800 tw-to-primario-900 tw-px-8 tw-py-7">
                    <div className="tw-flex tw-items-center tw-gap-5">
                        {/* Avatar */}
                        <div className="tw-w-16 tw-h-16 tw-rounded-2xl tw-bg-gradient-to-br tw-from-indigo-500 tw-to-blue-600 tw-flex tw-items-center tw-justify-center tw-text-white tw-text-2xl tw-font-bold tw-shadow-xl tw-ring-3 tw-ring-white/10">
                            {initials}
                        </div>
                        <div className="tw-flex-1">
                            <h2 className="tw-text-xl tw-font-bold tw-text-white tw-m-0 tw-mb-1">
                                {nombre || 'Usuario'}
                            </h2>
                            <p className="tw-text-slate-300 tw-text-sm tw-m-0 tw-mb-2">
                                {user?.rol || 'N/A'}
                            </p>
                            <span className="tw-inline-flex tw-items-center tw-gap-1.5 tw-px-3 tw-py-1 tw-bg-emerald-500/15 tw-text-emerald-400 tw-text-xs tw-font-bold tw-rounded-full tw-border tw-border-emerald-500/20">
                                <span className="tw-w-1.5 tw-h-1.5 tw-bg-emerald-400 tw-rounded-full"></span>
                                Cuenta Activa
                            </span>
                        </div>
                    </div>
                </div>

                {/* ============ FORM BODY ============ */}
                <form onSubmit={handleSave} className="tw-p-6">
                    <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-5">

                        {/* ---- LEFT: Información Personal ---- */}
                        <div className="tw-bg-white tw-rounded-2xl tw-p-5 tw-shadow-sm tw-border tw-border-gray-100">
                            <div className="tw-flex tw-items-center tw-gap-2 tw-mb-5">
                                <div className="tw-w-7 tw-h-7 tw-bg-indigo-100 tw-rounded-lg tw-flex tw-items-center tw-justify-center">
                                    <CircleUser className="tw-w-4 tw-h-4 tw-text-indigo-600" />
                                </div>
                                <h3 className="tw-text-sm tw-font-bold tw-text-gray-800 tw-m-0">Información Personal</h3>
                            </div>

                            {/* Nombre */}
                            <div className="tw-mb-4">
                                <label className={labelClass}>Nombres</label>
                                <div className="tw-relative">
                                    <User className="tw-absolute tw-left-3.5 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-gray-400" />
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Documento */}
                            <div className="tw-mb-4">
                                <label className={labelClass}>Num. Documento</label>
                                <div className="tw-relative">
                                    <FileText className="tw-absolute tw-left-3.5 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-gray-400" />
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={documento}
                                        onChange={(e) => setDocumento(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Rol (read-only) */}
                            <div>
                                <label className={labelClass}>Rol</label>
                                <div className="tw-relative">
                                    <Shield className="tw-absolute tw-left-3.5 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-gray-400" />
                                    <div className="tw-w-full tw-pl-11 tw-pr-4 tw-py-3 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-gray-100 tw-text-sm tw-text-gray-500 tw-cursor-not-allowed tw-flex tw-items-center tw-justify-between">
                                        <span>{user?.rol || 'N/A'}</span>
                                        <span className="tw-text-[10px] tw-text-gray-400 tw-bg-gray-200 tw-px-2 tw-py-0.5 tw-rounded-md tw-font-medium">No editable</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ---- RIGHT: Información de Contacto ---- */}
                        <div className="tw-bg-white tw-rounded-2xl tw-p-5 tw-shadow-sm tw-border tw-border-gray-100 tw-flex tw-flex-col">
                            <div className="tw-flex tw-items-center tw-gap-2 tw-mb-5">
                                <div className="tw-w-7 tw-h-7 tw-bg-blue-100 tw-rounded-lg tw-flex tw-items-center tw-justify-center">
                                    <AtSign className="tw-w-4 tw-h-4 tw-text-blue-600" />
                                </div>
                                <h3 className="tw-text-sm tw-font-bold tw-text-gray-800 tw-m-0">Información de Contacto</h3>
                            </div>

                            {/* Correo */}
                            <div className="tw-mb-4">
                                <label className={labelClass}>Correo Electrónico</label>
                                <div className="tw-relative">
                                    <Mail className="tw-absolute tw-left-3.5 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-gray-400" />
                                    <input
                                        type="email"
                                        className={inputClass}
                                        value={correo}
                                        onChange={(e) => setCorreo(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Teléfono */}
                            <div className="tw-mb-4">
                                <label className={labelClass}>Teléfono</label>
                                <div className="tw-relative">
                                    <Phone className="tw-absolute tw-left-3.5 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-gray-400" />
                                    <input
                                        type="tel"
                                        className={inputClass}
                                        value={telefono}
                                        onChange={(e) => setTelefono(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Contraseña */}
                            <div>
                                <label className={labelClass}>Nueva Contraseña</label>
                                <div className="tw-relative">
                                    <Lock className="tw-absolute tw-left-3.5 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className={`${inputClass} tw-pr-10`}
                                        placeholder="Dejar en blanco para mantener"
                                        value={contrasena}
                                        onChange={(e) => setContrasena(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="tw-absolute tw-right-3 tw-top-1/2 -tw-translate-y-1/2 tw-text-gray-400 hover:tw-text-gray-600 tw-transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="tw-w-4 tw-h-4" /> : <Eye className="tw-w-4 tw-h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ============ SAVE BUTTON ============ */}
                    <div className="tw-mt-5 tw-flex tw-gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="tw-px-6 tw-py-3 tw-rounded-xl tw-border tw-border-gray-200 tw-text-gray-600 tw-font-semibold tw-text-sm hover:tw-bg-gray-100 tw-transition-all tw-duration-150"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="tw-flex-1 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-6 tw-py-3 tw-rounded-xl tw-bg-gradient-to-r tw-from-blue-600 tw-to-indigo-600 tw-text-white tw-font-semibold tw-text-sm hover:tw-from-blue-700 hover:tw-to-indigo-700 tw-shadow-lg tw-shadow-blue-500/25 hover:tw-shadow-blue-500/40 disabled:tw-opacity-50 tw-transition-all tw-duration-200"
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
