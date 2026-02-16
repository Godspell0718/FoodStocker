import { useState, useEffect } from "react"
import apiAxios from "../api/axiosConfig.js"
import Swal from "sweetalert2"

const EstadoForm = ({ hideModal, isEditing, selectedEstado, setRefresh, refresh }) => {

    const [formData, setFormData] = useState({
        Id_estado: "",
        nom_estado: ""
    })

    const [textFormButton, setTextFormButton] = useState("Crear")
    useEffect(() => {
        if (isEditing && selectedEstado) {
            setFormData({
                Id_estado: selectedEstado.Id_estado,
                nom_estado: selectedEstado.nom_estado
            })
            setTextFormButton("Actualizar")
        } else {
            setFormData({
                Id_estado: "",

                nom_estado: ""
            })
            setTextFormButton("Crear")
        }
    }, [isEditing, selectedEstado   ])

    const handleInputChange = (e) => {
        const { id, value } = e.target
        setFormData({
            ...formData,
            [id]: value
        })
    }
    const gestionarForm = async (e) => {
        e.preventDefault()

        try {
            if (isEditing) {
                await apiAxios.put(`/api/Estados/${formData.Id_estado}`, formData)
                Swal.fire("Actualizado", "Registro actualizado correctamente", "success")
            } else {
                await apiAxios.post("/api/Estados/", formData)
                Swal.fire("Creado", "Registro creado con éxito", "success")
            }

            hideModal()
            setRefresh(!refresh)

        } catch (error) {
            Swal.fire("Error", "Hubo un problema al procesar la solicitud", "error")
        }
    }
    return (
        <form onSubmit={gestionarForm} className="col-12">

            {isEditing && (
                <div className="mb-3">
                    <label className="form-label">ID Estado </label>
                    <input
                        type="text"
                        id="Id_estado"
                        className="form-control"
                        value={formData.Id_estado}
                        disabled
                    />
                </div>
            )}

            <div className="mb-3">
                <label className="form-label">Estado</label>
                <input
                    type="text"
                    id="nom_estado"
                    className="form-control"
                    value={formData.nom_estado}
                    onChange={handleInputChange}
                />
            </div>


            <div className="d-flex gap-2">
                <button type="submit" className="btn btn-dark flex-fill">
                    {textFormButton}
                </button>

                <button type="button" className="btn btn-dark" onClick={hideModal}>
                    Cancelar
                </button>
            </div>

        </form>
    )
}

export default EstadoForm
