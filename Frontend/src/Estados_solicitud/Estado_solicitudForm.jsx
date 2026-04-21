import { useState, useEffect } from "react"
import apiAxios from "../api/axiosConfig.js"
import Swal from "sweetalert2"
import { Save, X, ClipboardList, Waypoints, Calendar, Hash } from "lucide-react"

const Estado_solicitudForm = ({ hideModal, isEditing, selectedEstado_solicitud, setRefresh, refresh }) => {

    const [formData, setFormData] = useState({
        Id_solicitud: "",
        Id_estado: "",
        fecha: ""
    })
    const [solicitudes, setSolicitudes] = useState([])
    const [estados, setEstados] = useState([])
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
            setFormData({ Id_solicitud: "", Id_estado: "", fecha: "" })
            setTextFormButton("Crear")
        }
        getSolicitudes()
        getEstados()
    }, [isEditing, selectedEstado_solicitud])

    const getSolicitudes = async () => {
        try {
            const res = await apiAxios.get("/api/solicitudes")
            setSolicitudes(res.data)
        } catch (error) {
            console.error("Error cargando solicitudes", error)
        }
    }

    const getEstados = async () => {
        try {
            const res = await apiAxios.get("/api/estados")
            setEstados(res.data)
        } catch (error) {
            console.error("Error cargando estados", error)
        }
    }

    const handleInputChange = (e) => {
        const { id, value } = e.target
        setFormData({ ...formData, [id]: value })
    }

    const gestionarForm = async (e) => {
        e.preventDefault()
        try {
            if (isEditing) {
                await apiAxios.put(`/api/Estado_solicitud/${formData.Id_estado_solicitud}`, formData)
                Swal.fire({ title: "Actualizado", text: "Registro actualizado correctamente", icon: "success", timer: 1500, showConfirmButton: false })
            } else {
                await apiAxios.post("/api/Estado_solicitud/", formData)
                Swal.fire({ title: "Creado", text: "Registro creado con éxito", icon: "success", timer: 1500, showConfirmButton: false })
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

            {/* ID (solo edición) */}
            {isEditing && (
                <div>
                    <label className={labelClass}>
                        <Hash className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1" />
                        ID Estado Solicitud
                    </label>
                    <input
                        type="text"
                        id="Id_estado_solicitud"
                        className={`${inputClass} tw-opacity-60 tw-cursor-not-allowed`}
                        value={formData.Id_estado_solicitud || ""}
                        disabled
                    />
                </div>
            )}

            {/* ID Solicitud */}
            <div>
                <label className={labelClass}>
                    <ClipboardList className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1" />
                    Solicitud
                </label>
                {isEditing ? (
                    <select
                        id="Id_solicitud"
                        className={inputClass}
                        value={formData.Id_solicitud}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Seleccione una solicitud...</option>
                        {solicitudes.map((sol) => (
                            <option key={sol.Id_solicitud} value={sol.Id_solicitud}>
                                #{sol.Id_solicitud} — {sol.responsable?.Nom_Responsable ?? sol.motivo ?? "Solicitud"}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        type="text"
                        id="Id_solicitud"
                        className={inputClass}
                        placeholder="ID de la solicitud"
                        value={formData.Id_solicitud}
                        onChange={handleInputChange}
                        required
                    />
                )}
            </div>

            {/* Estado */}
            <div>
                <label className={labelClass}>
                    <Waypoints className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1" />
                    Estado
                </label>
                <select
                    id="Id_estado"
                    className={inputClass}
                    value={formData.Id_estado}
                    onChange={handleInputChange}
                    required
                >
                    <option value="">Seleccione un estado...</option>
                    {estados.map((est) => (
                        <option key={est.Id_estado} value={est.Id_estado}>
                            {est.nom_estado}
                        </option>
                    ))}
                </select>
            </div>

            {/* Fecha */}
            <div>
                <label className={labelClass}>
                    <Calendar className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1" />
                    Fecha
                </label>
                <input
                    type="date"
                    id="fecha"
                    className={inputClass}
                    value={formData.fecha}
                    onChange={handleInputChange}
                    required
                />
            </div>

            {/* Botones */}
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

export default Estado_solicitudForm
