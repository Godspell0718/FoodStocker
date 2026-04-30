import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiNode from "../api/axiosConfig";
import { Utensils, Mail, Lock, ShieldCheck, Server, AlertCircle, Loader2 } from "lucide-react";

const Login = ({ setIsAuth }) => {
    const navigate = useNavigate()
    const [Cor_Responsable, setCorreo] = useState('')
    const [Contraseña, setContraseña] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const gestionarLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await apiNode.post('/api/responsables/login', {
                Cor_Responsable: Cor_Responsable,
                Contraseña: Contraseña
            })

            const { token, usuario } = res.data

            if (!token) {
                setError('No se recibió token del servidor')
                setLoading(false)
                return
            }

            localStorage.setItem('tokenFoodStocker', token)
            localStorage.setItem('userFoodStocker', JSON.stringify(usuario))
            setIsAuth(true)
            navigate('/Entradas')

        } catch (err) {
            setError(err.response?.data?.mensaje || 'Email o contraseña incorrecta')
            setLoading(false)
        }
    }

    return (
        <div className="tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-bg-slate-950 tw-relative tw-overflow-hidden">
            {/* Background elements */}
            <div className="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-full tw-overflow-hidden tw-z-0">
                <div className="tw-absolute -tw-top-24 -tw-left-24 tw-w-96 tw-h-96 tw-bg-primario-900/20 tw-rounded-full tw-blur-3xl"></div>
                <div className="tw-absolute -tw-bottom-24 -tw-right-24 tw-w-96 tw-h-96 tw-bg-primario-500/10 tw-rounded-full tw-blur-3xl"></div>
            </div>

            <div className="tw-relative tw-z-10 tw-w-full tw-max-w-md tw-px-6">
                <div className="tw-bg-slate-900/50 tw-backdrop-blur-xl tw-border tw-border-white/10 tw-rounded-3xl tw-shadow-2xl tw-overflow-hidden">
                    
                    {/* Header */}
                    <div className="tw-px-8 tw-pt-10 tw-pb-6 tw-text-center">
                        <div className="tw-inline-flex tw-items-center tw-justify-center tw-w-16 tw-h-16 tw-rounded-2xl tw-bg-white/5 tw-border tw-border-white/10 tw-mb-6">
                            <Utensils className="tw-w-8 tw-h-8 tw-text-white" />
                        </div>
                        <h1 className="tw-text-3xl tw-font-bold tw-text-white tw-mb-2">FoodStocker</h1>
                        <p className="tw-text-slate-400 tw-text-sm">Inicia sesión en tu cuenta</p>
                    </div>

                    {/* Form */}
                    <div className="tw-px-8 tw-pb-10">
                        <form onSubmit={gestionarLogin} className="tw-space-y-6">
                            
                            {/* Email */}
                            <div className="tw-space-y-2">
                                <label className="tw-flex tw-items-center tw-gap-2 tw-text-xs tw-font-bold tw-text-slate-500 tw-uppercase tw-tracking-widest">
                                    <Mail className="tw-w-3.5 tw-h-3.5" />
                                    Correo Electrónico
                                </label>
                                <div className="tw-relative">
                                    <input
                                        type="email"
                                        className="tw-w-full tw-bg-white/5 tw-border tw-border-white/10 tw-rounded-xl tw-px-4 tw-py-3 tw-text-white tw-placeholder-slate-600 focus:tw-outline-none focus:tw-border-white/20 focus:tw-ring-2 focus:tw-ring-white/5 tw-transition-all"
                                        value={Cor_Responsable}
                                        onChange={(e) => setCorreo(e.target.value)}
                                        placeholder="ejemplo@correo.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="tw-space-y-2">
                                <div className="tw-flex tw-justify-between tw-items-center">
                                    <label className="tw-flex tw-items-center tw-gap-2 tw-text-xs tw-font-bold tw-text-slate-500 tw-uppercase tw-tracking-widest">
                                        <Lock className="tw-w-3.5 tw-h-3.5" />
                                        Contraseña
                                    </label>
                                    <a href="#" className="tw-text-xs tw-text-slate-500 hover:tw-text-white tw-transition-colors">¿Olvidaste tu contraseña?</a>
                                </div>
                                <div className="tw-relative">
                                    <input
                                        type="password"
                                        className="tw-w-full tw-bg-white/5 tw-border tw-border-white/10 tw-rounded-xl tw-px-4 tw-py-3 tw-text-white tw-placeholder-slate-600 focus:tw-outline-none focus:tw-border-white/20 focus:tw-ring-2 focus:tw-ring-white/5 tw-transition-all"
                                        value={Contraseña}
                                        onChange={(e) => setContraseña(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Remember */}
                            <div className="tw-flex tw-items-center">
                                <label className="tw-flex tw-items-center tw-gap-3 tw-cursor-pointer tw-group">
                                    <div className="tw-relative">
                                        <input type="checkbox" className="tw-peer tw-sr-only" />
                                        <div className="tw-w-5 tw-h-5 tw-bg-white/5 tw-border tw-border-white/10 tw-rounded-md peer-checked:tw-bg-white peer-checked:tw-border-white tw-transition-all"></div>
                                        <div className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-opacity-0 peer-checked:tw-opacity-100 tw-transition-opacity">
                                            <svg className="tw-w-3 tw-h-3 tw-text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                                <path d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                    <span className="tw-text-sm tw-text-slate-400 group-hover:tw-text-slate-300 tw-transition-colors">Recordar sesión</span>
                                </label>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="tw-p-4 tw-bg-red-500/10 tw-border tw-border-red-500/20 tw-rounded-xl tw-flex tw-items-center tw-gap-3">
                                    <AlertCircle className="tw-w-5 tw-h-5 tw-text-red-500" />
                                    <p className="tw-text-sm tw-text-red-400 tw-m-0">{error}</p>
                                </div>
                            )}

                            {/* Submit */}
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="tw-w-full tw-py-4 tw-bg-white tw-text-slate-950 tw-font-bold tw-rounded-xl hover:tw-bg-slate-200 tw-transition-all tw-shadow-lg tw-shadow-white/5 tw-flex tw-items-center tw-justify-center tw-gap-2 disabled:tw-opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="tw-w-5 tw-h-5 tw-animate-spin" />
                                        <span>Iniciando sesión...</span>
                                    </>
                                ) : (
                                    'INICIAR SESIÓN'
                                )}
                            </button>

                            <p className="tw-text-center tw-text-sm tw-text-slate-500">
                                ¿No tienes una cuenta?{' '}
                                <a href="#" className="tw-text-white tw-font-medium hover:tw-underline">Contacta al administrador</a>
                            </p>
                        </form>
                    </div>

                    {/* Footer icons */}
                    <div className="tw-px-8 tw-py-6 tw-bg-white/5 tw-border-t tw-border-white/5 tw-flex tw-justify-center tw-gap-8">
                        <ShieldCheck className="tw-w-5 tw-h-5 tw-text-slate-600" />
                        <Lock className="tw-w-5 tw-h-5 tw-text-slate-600" />
                        <Server className="tw-w-5 tw-h-5 tw-text-slate-600" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login