import { useState } from "react"
import apiAxios from "../api/axiosConfig.js"

const LoteForm = ({hideModal}) => {

    //Definir una prop para cada campo del formulario

    const [Id_Almacen, setAlmacen] = useState('')
    const [fech_lleg, setfechllegada] = useState('')
    const [updatedate, setfupdatedate] = useState('')
    const [textFormButton, setTextFormButton] = useState('Enviar')
    const [foto, setFoto] = useState(null)


    const gestionarForm = async (e) => {
    e.preventDefault()  //Evita que la página se actualice

    if (textFormButton == 'Enviar') {
        try {

            const response = await apiAxios.post('/api/lote', { //Se envian todos los datos como un objeto JSON 
                Id_Almacen : Id_Almacen,
                fech_lleg: fech_lleg,
                updatedate: updatedate
                
            })

            // Axios devuelve el cuerpo de la respuesta en response.data
            const data = response.data;

            alert('Lote creado correctamente')

            hideModal()


        } catch (error) {

            console.error("Error registrando el lote:", error.response ? error.response.data : error.message);
            alert(error.message)
        }

    } else if (textFormButton == 'Actualizar') {

    }
}


    return (
        <>
            <form onSubmit={gestionarForm} encType="multipart/form-data" className="col-12 col-md-6">
                <div className="mb-3">
                    <label htmlFor="Id_Almacen" className="form-label">Id_Almacen:</label>
                    <input type="text" id="Id_Almacen" className="form-control" value={Id_Almacen} onChange={(e) => setAlmacen(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label htmlFor="fech_lleg" className="form-label">Fecha de llegada:</label>
                    <input type="text" id="fech_lleg" className="form-control" value={fech_lleg} onChange={(e) => setfechllegada(e.target.value)} />
                </div>
                <div className="mb-3">
                    <input type="submit" className="btn btn-primary w-50" value={textFormButton} />
                </div>
            </form>
        </>
    )
}

export default LoteForm