<<<<<<< HEAD
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL   //importar variable con la url del servidor backend del archivo .env

const apiNode = axios.create({
    baseURL: API_URL,
    headers:{

=======
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL

const apiAxios = axios.create({
    baseURL: API_URL,
    headers: {
>>>>>>> 6172372 (Realice mis tablas Solicitud, Estados y Estados_Solicitud)
        'Content-Type': 'application/json'
    }
})

<<<<<<< HEAD

export default apiNode

=======
export default apiAxios
>>>>>>> 6172372 (Realice mis tablas Solicitud, Estados y Estados_Solicitud)
