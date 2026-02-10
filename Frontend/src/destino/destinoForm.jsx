import { useState, useEffect } from "react"
import apiAxios from "../api/axiosConfig.js"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"

const DestinoForm = ({ hideModal, destinoSeleccionado }) => {

    const MySwal = withReactContent(Swal)

    //Definir una prop para cada campo del formulario

    const [Tip_Destino, setTipdestino] = useState('')
    const [Nom_Destino, setNombres] = useState('')
    const [textFormButton, setTextFormButton] = useState('Enviar')
    const [foto, setFoto] = useState(null)

    useEffect(() => {
        if (destinoSeleccionado) {
            setNombres(destinoSeleccionado.Nom_Destino)
            setTipdestino(destinoSeleccionado.Tip_Destino)
            setTextFormButton('Actualizar')
        } else {
            setNombres('')
            setTipdestino('')
            setTextFormButton('Enviar')
        }
    }, [destinoSeleccionado])



    const gestionarForm = async (e) => {
        e.preventDefault()  //Evita que la página se actualice

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


                hideModal()


            } catch (error) {

                console.error("Error registrando Destino:", error.response ? error.response.data : error.message);
                alert(error.message)
            }

        } else if (textFormButton == 'Actualizar') {
            try {
                await apiAxios.put(`/api/destino/${destinoSeleccionado.Id_Destino}`, {
                    Nom_Destino: Nom_Destino,
                    Tip_Destino: Tip_Destino
                })

                MySwal.fire({
                    title: "Actualización",
                    text: "Destino actualizado correctamente",
                    icon: "success"
                })

                hideModal()

            } catch (error) {
                console.error("Error actualizando Destino:", error.response ? error.response.data : error.message);
                alert("Error al actualizar")
            }
        }

    }

    return (
        <>
            <form onSubmit={gestionarForm} encType="multipart/form-data" className="col-12 col-md-6">
                <div className="mb-3">
                    <label htmlFor="Nom_Destino" className="form-label">Nombres:</label>
                    <input type="text" id="Nom_Destino" className="form-control" value={Nom_Destino} onChange={(e) => setNombres(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label htmlFor="Tip_Destino" className="form-label">Tipo Destino:</label>
                    <input type="text" id="Tip_Destino" className="form-control" value={Tip_Destino} onChange={(e) => setTipdestino(e.target.value)} />
                </div>
                <div className="mb-3">
                    <input type="submit" className="btn btn-primary w-50" value={textFormButton} />
                </div>
            </form>
        </>
    )
}

export default DestinoForm