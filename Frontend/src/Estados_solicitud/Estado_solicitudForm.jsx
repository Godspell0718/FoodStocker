import { useState, useEffect } from "react"
import apiAxios from "../api/axiosConfig.js"
import Swal from "sweetalert2"

const Estado_solicitudForm = ({ hideModal, isEditing, selectedEstado_solicitud, setRefresh, refresh }) => {

    const [formData, setFormData] = useState({
        Id_solicitud: "",
        Id_estado: "",
        fecha:""
    })

    const [textFormButton, setTextFormButton] = useState("Crear")
    useEffect(() => {
        if (isEditing && selectedEstado_solicitud) {
            setFormData({
                Id_estado_solicitud: selectedEstado_solicitud.Id_estado_solicitud,
                Id_solicitud: selectedEstado_solicitud.Id_solicitud,
                Id_estado: selectedEstado_solicitud.Id_estado,
                fecha: selectedEstado_solicitud.fecha
            })
            setTextFormButton("Actualizar")
        } else {
            setFormData({
                Id_solicitud: "",
                Id_estado: "",
                fecha:""
            })
            setTextFormButton("Crear")
        }
    }, [isEditing, selectedEstado_solicitud])

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
                await apiAxios.put(`/api/Estado_solicitud/${formData.Id_estado_solicitud}`, formData)
                Swal.fire("Actualizado", "Registro actualizado correctamente", "success")
            } else {
                await apiAxios.post("/api/Estado_solicitud/", formData)
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
                    <label className="form-label">ID Estado Solicitud</label>
                    <input
                        type="text"
                        id="Id_estado_solicitud"
                        className="form-control"
                        value={formData.Id_estado_solicitud}
                        disabled
                    />
                </div>
            )}

            <div className="mb-3">
                <label className="form-label">ID Solicitud</label>
                <input
                    type="text"
                    id="Id_solicitud"
                    className="form-control"
                    value={formData.Id_solicitud}
                    onChange={handleInputChange}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">ID Estado</label>
                <input
                    type="text"
                    id="Id_estado"
                    className="form-control"
                    value={formData.Id_estado}
                    onChange={handleInputChange}
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Fecha</label>
                <input
                    type="date"
                    id="fecha"
                    className="form-control"
                    value={formData.fecha}
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

export default Estado_solicitudForm
