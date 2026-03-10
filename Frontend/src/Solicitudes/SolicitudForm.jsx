import { useState, useEffect } from "react";
import apiAxios from "../api/axiosConfig.js";
import Swal from "sweetalert2";


const SolicitudForm = ({ hideModal, isEditing, selectedSolicitud }) => {

    const [formData, setFormData] = useState({
        Id_Responsable: "",
        Fec_entrega: "",
        motivo: ""
    });
    // select
    const [responsables, setResponsables] = useState([]);
    //fin

    const [textFormButton, setTextFormButton] = useState("Crear")
    useEffect(() => {
        if (isEditing && selectedSolicitud) {
            setFormData({
                Id_Responsable: selectedSolicitud.Id_Responsable,
                Fec_entrega: selectedSolicitud.Fec_entrega,
                motivo: selectedSolicitud.motivo
            })
            setTextFormButton("Actualizar")
        } else {
            setFormData({
                Id_Responsable: "",
                Fec_entrega: "",
                motivo: ""
            })

            setTextFormButton("Crear")
        }
        //select
        getResponsables();
        //fin

    }, [isEditing, selectedSolicitud])

    //select

    const getResponsables = async () => {
        try {
            const res = await apiAxios.get("/api/responsables");
            setResponsables(res.data);
            console.log(res.data);
        } catch (error) {
            console.error("Error cargando responsables", error);
        }
    };
    //fin

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
                await apiAxios.put(`/api/solicitudes/${selectedSolicitud.Id_solicitud}`, formData)
                Swal.fire("Actualizado", "La solicitud fue actualizada correctamente", "success")
            } else {
                await apiAxios.post("/api/solicitudes/", formData)
                Swal.fire("Creado", "La solicitud fue creada correctamente", "success")
            }

            hideModal()

        } catch (error) {
            console.error("ERROR AXIOS ", error);
            console.log("RESPUESTA BACKEND ", error.response?.data);

            Swal.fire(
                "Error",
                error.response?.data?.message || "Error desconocido",
                "error"
            );
        }
    }

    return (
        <form onSubmit={gestionarForm} className="col-12">

            {isEditing && (
                <div className="mb-3">
                    <label className="form-label">ID Solicitud</label>
                    <input
                        type="text"
                        id="Id_solicitud"
                        className="form-control"
                        value={formData.Id_solicitud}
                        disabled
                    />
                </div>
            )}
          
            <select 
                id="Id_Responsable"  
                className="form-control"
                value={formData.Id_Responsable}
                onChange={handleInputChange}
            >
                <option value="">Seleccione uno...</option>

                {responsables.map((resp) => (
                    <option key={resp.Id_Responsable} value={resp.Id_Responsable}>
                        {resp.Nom_Responsable}
                    </option>
                ))} 
            </select> 
          
            <div className="mb-3">
                <label className="form-label">Fecha Entrega</label>
                <input
                    type="date"
                    id="Fec_entrega"
                    className="form-control"
                    value={formData.Fec_entrega}
                    onChange={handleInputChange}
                />
            </div>
            <div className="mb-3">
                <label className="form-label">motivo</label>
                <input
                    type="text"
                    id="motivo"
                    className="form-control"
                    value={formData.motivo}
                    onChange={handleInputChange}
                />
            </div>

            <div className="mb-3 d-flex gap-2">
                <button type="submit" className="btn btn-dark flex-fill">
                    {textFormButton}
                </button>

                <button
                    type="button"
                    className="btn btn-dark"
                    onClick={hideModal}
                >
                    Cancelar
                </button>
            </div>

        </form>
    )
}

export default SolicitudForm
