import { useState, useEffect } from "react"
import apiAxios from "../api/axiosConfig.js"
import Swal from "sweetalert2"
import { Save, X, Hash, Tag } from "lucide-react"

const EstadoForm = ({ hideModal, isEditing, selectedEstado, setRefresh, refresh }) => {

    const [formData, setFormData] = useState({ Id_estado: "", nom_estado: "" })
    const [textFormButton, setTextFormButton] = useState("Crear")

    useEffect(() => {
        if (isEditing && selectedEstado) {
            setFormData({ Id_estado: selectedEstado.Id_estado, nom_estado: selectedEstado.nom_estado })
            setTextFormButton("Actualizar")
        } else {
            setFormData({ Id_estado: "", nom_estado: "" })
            setTextFormButton("Crear")
        }
    }, [isEditing, selectedEstado])

    const handleInputChange = (e) => {
        const { id, value } = e.target
        setFormData({ ...formData, [id]: value })
    }

    const gestionarForm = async (e) => {
        e.preventDefault()
        try {
            if (isEditing) {
                await apiAxios.put(`/api/Estados/${formData.Id_estado}`, formData)
                Swal.fire({ title: "Actualizado", text: "Estado actualizado correctamente", icon: "success", timer: 1500, showConfirmButton: false })
            } else {
                await apiAxios.post("/api/Estados/", formData)
                Swal.fire({ title: "Creado", text: "Estado creado con éxito", icon: "success", timer: 1500, showConfirmButton: false })
            }
            hideModal()
            setRefresh(!refresh)
        } catch (error) {
            Swal.fire("Error", "Hubo un problema al procesar la solicitud", "error")
        }
    }

    const labelClass = "tw-block tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wide tw-mb-1.5"
    const inputClass = "tw-w-full tw-px-4 tw-py-2.5 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-gray-50 tw-text-sm tw-text-gray-700 focus:tw-outline-none focus:tw-border-primario-500 focus:tw-ring-2 focus:tw-ring-primario-100 focus:tw-bg-white tw-transition-all"

    return (
        <form onSubmit={gestionarForm} className="tw-flex tw-flex-col tw-gap-4">

            {isEditing && (
                <div>
                    <label className={labelClass}>
                        <Hash className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1" />
                        ID Estado
                    </label>
                    <input
                        type="text"
                        id="Id_estado"
                        className={`${inputClass} tw-opacity-60 tw-cursor-not-allowed`}
                        value={formData.Id_estado}
                        disabled
                    />
                </div>
            )}

            <div>
                <label className={labelClass}>
                    <Tag className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1" />
                    Nombre del Estado
                </label>
                <input
                    type="text"
                    id="nom_estado"
                    className={inputClass}
                    placeholder="Ej: Solicitado, En proceso..."
                    value={formData.nom_estado}
                    onChange={handleInputChange}
                    required
                />
            </div>

            <div className="tw-flex tw-gap-2 tw-mt-2">
                <button
                    type="submit"
                    className="tw-flex-1 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-4 tw-py-2.5 tw-rounded-xl tw-bg-primario-900 tw-text-white tw-font-medium tw-text-sm hover:tw-bg-primario-700 tw-transition-all tw-shadow-md"
                >
                    <Save className="tw-w-4 tw-h-4" />
                    {textFormButton}
                </button>
                <button
                    type="button"
                    onClick={hideModal}
                    className="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2.5 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-white tw-text-gray-600 tw-font-medium tw-text-sm hover:tw-bg-gray-50 tw-transition-all"
                >
                    <X className="tw-w-4 tw-h-4" />
                    Cancelar
                </button>
            </div>
        </form>
    )
}

export default EstadoForm
