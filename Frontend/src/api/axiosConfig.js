import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const APP_ENV = import.meta.env.VITE_APP_ENV || 'development'

// 🔍 Muestra en consola a qué entorno estás conectado
console.log(`🌐 [FoodStocker] Entorno: ${APP_ENV} | API: ${API_URL}`)

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
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    error => Promise.reject(error)
)

// INTERCEPTOR PARA MANEJAR RESPUESTAS
apiNode.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // No redirigir si el 401 viene del login (dejar que el componente muestre el error)
            const requestUrl = error.config?.url || ''
            if (!requestUrl.includes('/login')) {
                localStorage.removeItem('tokenFoodStocker')
                localStorage.removeItem('userFoodStocker')
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export default apiNode