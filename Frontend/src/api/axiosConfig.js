import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'  // Valor por defecto

console.log('🔧 API_URL configurada:', API_URL)

const apiNode = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

// INTERCEPTOR PARA AGREGAR EL TOKEN
apiNode.interceptors.request.use(
    config => {
        const token = localStorage.getItem('tokenFoodStocker')
        console.log('📤 Petición a:', config.url)
        console.log('📤 Token en localStorage:', token ? '✓ Sí existe' : '✗ No existe')
        
        if (token) {
            console.log('📤 Token (primeros 20 chars):', token.substring(0, 20) + '...')
            config.headers.Authorization = `Bearer ${token}`
            console.log('📤 Header Authorization añadido')
        } else {
            console.log('📤 No hay token para añadir')
        }
        
        return config
    },
    error => {
        console.error('❌ Error en interceptor request:', error)
        return Promise.reject(error)
    }
)

// INTERCEPTOR PARA MANEJAR RESPUESTAS
apiNode.interceptors.response.use(
    response => {
        console.log('📥 Respuesta exitosa de:', response.config.url, 'Status:', response.status)
        return response
    },
    error => {
        console.error('❌ Error en respuesta:', error.config?.url)
        console.error('❌ Status:', error.response?.status)
        console.error('❌ Data:', error.response?.data)
        console.error('❌ Headers:', error.config?.headers)
        
        if (error.response?.status === 401) {
            console.log('🔐 Token rechazado por el backend')
            // Comentamos esto temporalmente para no redirigir automáticamente
            // localStorage.removeItem('tokenFoodStocker')
            // localStorage.removeItem('userFoodStocker')
            // window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default apiNode