import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

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
            localStorage.removeItem('tokenFoodStocker')
            localStorage.removeItem('userFoodStocker')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default apiNode