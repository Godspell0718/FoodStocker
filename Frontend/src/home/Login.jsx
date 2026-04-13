import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiNode from "../api/axiosConfig";

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
            navigate('/home')

        } catch (err) {
            setError(err.response?.data?.mensaje || 'Email o contraseña incorrecta')
            setLoading(false)
        }
    }

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-6 col-lg-4">
                        
                        {/* Tarjeta de login */}
                        <div className="card bg-black text-white border-0 shadow-lg" 
                             style={{ 
                                 borderRadius: '15px',
                                 background: 'linear-gradient(145deg, #1a1a1a 0%, #0a0a0a 100%)'
                             }}>
                            
                            {/* Header con ícono */}
                            <div className="card-header bg-transparent border-0 text-center pt-4">
                                <div className="mb-3">
                                    <i className="fas fa-utensils fa-3x text-white opacity-75"></i>
                                </div>
                                <h2 className="fw-bold mb-1">FoodStocker</h2>
                                <p className="text-white-50 small">Inicia sesión en tu cuenta</p>
                            </div>

                            {/* Body del formulario */}
                            <div className="card-body px-4 py-4">
                                <form onSubmit={gestionarLogin}>
                                    
                                    {/* Campo de correo */}
                                    <div className="mb-4">
                                        <label className="form-label text-white-50 small fw-bold mb-1">
                                            <i className="fas fa-envelope me-2"></i>
                                            CORREO ELECTRÓNICO
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control bg-black text-white border-secondary"
                                            style={{ 
                                                borderColor: '#333',
                                                borderRadius: '10px',
                                                padding: '12px 15px'
                                            }}
                                            value={Cor_Responsable}
                                            onChange={(e) => setCorreo(e.target.value)}
                                            placeholder="ejemplo@correo.com"
                                            required
                                        />
                                    </div>

                                    {/* Campo de contraseña */}
                                    <div className="mb-4">
                                        <label className="form-label text-white-50 small fw-bold mb-1">
                                            <i className="fas fa-lock me-2"></i>
                                            CONTRASEÑA
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control bg-black text-white border-secondary"
                                            style={{ 
                                                borderColor: '#333',
                                                borderRadius: '10px',
                                                padding: '12px 15px'
                                            }}
                                            value={Contraseña}
                                            onChange={(e) => setContraseña(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>

                                    {/* Checkbox de recordar (opcional) */}
                                    <div className="mb-4 d-flex justify-content-between align-items-center">
                                        <div className="form-check">
                                            <input 
                                                type="checkbox" 
                                                className="form-check-input bg-black border-secondary" 
                                                id="remember"
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <label className="form-check-label text-white-50 small" htmlFor="remember">
                                                Recordar sesión
                                            </label>
                                        </div>
                                        <a href="#" className="text-white-50 small text-decoration-none">
                                            ¿Olvidaste tu contraseña?
                                        </a>
                                    </div>

                                    {/* Mensaje de error */}
                                    {error && (
                                        <div className="alert alert-danger bg-danger bg-opacity-10 text-white border-danger border-opacity-25 py-2 mb-4" 
                                             style={{ borderRadius: '8px' }}>
                                            <i className="fas fa-exclamation-circle me-2"></i>
                                            <small>{error}</small>
                                        </div>
                                    )}

                                    {/* Botón de login */}
                                    <button 
                                        type="submit" 
                                        className="btn btn-light w-100 py-3 fw-bold mb-3"
                                        disabled={loading}
                                        style={{
                                            borderRadius: '10px',
                                            background: 'white',
                                            color: 'black',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                                        onMouseLeave={(e) => e.target.style.background = 'white'}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Iniciando sesión...
                                            </>
                                        ) : (
                                            'INICIAR SESIÓN'
                                        )}
                                    </button>

                                    {/* Enlace de registro (opcional) */}
                                    <p className="text-center text-white-50 small mb-0">
                                        ¿No tienes una cuenta?{' '}
                                        <a href="#" className="text-white text-decoration-none">
                                            Contacta al administrador
                                        </a>
                                    </p>
                                </form>
                            </div>

                            {/* Footer decorativo */}
                            <div className="card-footer bg-transparent border-0 text-center pb-4">
                                <div className="d-flex justify-content-center gap-3">
                                    <i className="fas fa-shield-alt text-white-50"></i>
                                    <i className="fas fa-lock text-white-50"></i>
                                    <i className="fas fa-server text-white-50"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login