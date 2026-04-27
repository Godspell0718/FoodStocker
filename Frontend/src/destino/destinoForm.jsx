import { useState, useEffect } from "react"
import apiAxios from "../api/axiosConfig.js"
import Swal from "sweetalert2"
import { MapPin, Type, Save, Send } from "lucide-react"

const DestinoForm = ({ hideModal, destinoSeleccionado }) => {

    const [Tip_Destino, setTipdestino] = useState('')
    const [Nom_Destino, setNombres] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (destinoSeleccionado) {
            setNombres(destinoSeleccionado.Nom_Destino)
            setTipdestino(destinoSeleccionado.Tip_Destino)
        } else {
<<<<<<< HEAD
            setNombres('')
            setTipdestino('')
        }
    }, [destinoSeleccionado])

=======
            limpiarFormulario()
        }
    }, [destinoSeleccionado])

    const limpiarFormulario = () => {
        setNombres('')
        setTipdestino('')
        setTextFormButton('Enviar')
    }



>>>>>>> 752bb6008220f62e9832250a9847bebadbfe8942
    const gestionarForm = async (e) => {
        e.preventDefault()
        setLoading(true)

<<<<<<< HEAD
        try {
            if (destinoSeleccionado) {
=======
        if (textFormButton == 'Enviar') {
            try {

                const response = await apiAxios.post('/api/destino', { //Se envian todos los datos como un objeto JSON 
                    Nom_Destino: Nom_Destino,
                    Tip_Destino: Tip_Destino

                })

                MySwal.fire({
                    title: "Registro Exitoso",
                    text: "Destino creado correctamente",
                    icon: "success"
                })

                limpiarFormulario()
                hideModal()


            } catch (error) {

                console.error("Error registrando Destino:", error.response ? error.response.data : error.message);
                alert(error.message)
            }

        } else if (textFormButton == 'Actualizar') {
            try {
>>>>>>> 752bb6008220f62e9832250a9847bebadbfe8942
                await apiAxios.put(`/api/destino/${destinoSeleccionado.Id_Destino}`, {
                    Nom_Destino,
                    Tip_Destino
                })
                Swal.fire({
                    title: "Actualizado",
                    text: "Destino actualizado correctamente",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                })
            } else {
                await apiAxios.post('/api/destino', {
                    Nom_Destino,
                    Tip_Destino
                })
                Swal.fire({
                    title: "Registrado",
                    text: "Destino creado correctamente",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                })
<<<<<<< HEAD
=======

                limpiarFormulario()
                hideModal()

            } catch (error) {
                console.error("Error actualizando Destino:", error.response ? error.response.data : error.message);
                alert("Error al actualizar")
>>>>>>> 752bb6008220f62e9832250a9847bebadbfe8942
            }
            hideModal()
        } catch (error) {
            console.error("Error gestionando destino:", error)
            Swal.fire("Error", error.response?.data?.message || "No se pudo procesar la solicitud", "error")
        } finally {
            setLoading(false)
        }
    }

    const inputClass = "tw-w-full tw-px-4 tw-py-2.5 tw-rounded-xl tw-border tw-border-slate-200 tw-bg-slate-50 tw-text-slate-700 tw-placeholder-slate-400 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-primario-500/20 focus:tw-border-primario-500 tw-transition-all"
    const labelClass = "tw-flex tw-items-center tw-gap-2 tw-text-xs tw-font-bold tw-text-slate-500 tw-uppercase tw-tracking-widest tw-mb-2"

    return (
        <form onSubmit={gestionarForm} className="tw-space-y-6">
            <div className="tw-space-y-4">
                {/* Nombre Destino */}
                <div className="tw-space-y-1">
                    <label htmlFor="Nom_Destino" className={labelClass}>
                        <MapPin className="tw-w-3.5 tw-h-3.5" />
                        Nombre del Destino
                    </label>
                    <input 
                        type="text" 
                        id="Nom_Destino" 
                        className={inputClass}
                        value={Nom_Destino} 
                        onChange={(e) => setNombres(e.target.value)} 
                        placeholder="Ej: Cocina Principal"
                        required
                    />
                </div>

                {/* Tipo Destino */}
                <div className="tw-space-y-1">
                    <label htmlFor="Tip_Destino" className={labelClass}>
                        <Type className="tw-w-3.5 tw-h-3.5" />
                        Tipo de Destino
                    </label>
                    <input 
                        type="text" 
                        id="Tip_Destino" 
                        className={inputClass}
                        value={Tip_Destino} 
                        onChange={(e) => setTipdestino(e.target.value)} 
                        placeholder="Ej: Formación / Servicio"
                        required
                    />
                </div>
            </div>

            {/* Submit Button */}
            <div className="tw-pt-2">
                <button 
                    type="submit" 
                    disabled={loading}
                    className="tw-w-full tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-6 tw-py-3 tw-bg-primario-900 hover:tw-bg-primario-700 tw-text-white tw-font-bold tw-rounded-xl tw-shadow-lg tw-transition-all tw-duration-200 disabled:tw-opacity-50"
                >
                    {loading ? (
                        <div className="tw-w-5 tw-h-5 tw-border-2 tw-border-white/30 tw-border-t-white tw-rounded-full tw-animate-spin"></div>
                    ) : (
                        destinoSeleccionado ? <Save className="tw-w-4 tw-h-4" /> : <Send className="tw-w-4 tw-h-4" />
                    )}
                    <span>{destinoSeleccionado ? 'Actualizar Destino' : 'Registrar Destino'}</span>
                </button>
            </div>
        </form>
    )
}

export default DestinoForm