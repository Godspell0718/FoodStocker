import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL   //importar variable con la url del servidor backend del archivo .env

const apiNode = axios.create({
    baseURL: API_URL,
    headers:{

        'Content-Type': 'application/json'
    }
})


export default apiNode

