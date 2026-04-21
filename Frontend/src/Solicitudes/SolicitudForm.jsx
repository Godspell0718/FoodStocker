import { useState, useEffect } from "react";
import apiAxios from "../api/axiosConfig.js";
import Swal from "sweetalert2";
import { Save, X, User, Calendar, FileText } from "lucide-react";

const SolicitudForm = ({ hideModal, isEditing, selectedSolicitud }) => {
    const [formData, setFormData] = useState({
        Id_Responsable: "",
        Fec_entrega: "",
        motivo: ""
    });
    const [responsables, setResponsables] = useState([]);
    const [textFormButton, setTextFormButton] = useState("Crear");

    useEffect(() => {
        if (isEditing && selectedSolicitud) {
            setFormData({
                Id_Responsable: selectedSolicitud.Id_Responsable,
                Fec_entrega: selectedSolicitud.Fec_entrega,
                motivo: selectedSolicitud.motivo
            });
            setTextFormButton("Actualizar");
        } else {
            setFormData({ Id_Responsable: "", Fec_entrega: "", motivo: "" });
            setTextFormButton("Crear");
        }
        getResponsables();
    }, [isEditing, selectedSolicitud]);

    const getResponsables = async () => {
        try {
            const res = await apiAxios.get("/api/responsables");
            setResponsables(res.data);
        } catch (error) {
            console.error("Error cargando responsables", error);
        }
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const gestionarForm = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await apiAxios.put(`/api/solicitudes/${selectedSolicitud.Id_solicitud}`, formData);
                Swal.fire({ title: "Actualizado", text: "La solicitud fue actualizada correctamente", icon: "success", timer: 1500, showConfirmButton: false });
            } else {
                await apiAxios.post("/api/solicitudes/", formData);
                Swal.fire({ title: "Creado", text: "La solicitud fue creada correctamente", icon: "success", timer: 1500, showConfirmButton: false });
            }
            hideModal();
        } catch (error) {
            Swal.fire("Error", error.response?.data?.message || "Error desconocido", "error");
        }
    };

    const labelClass = "tw-block tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wide tw-mb-1.5";
    const inputClass = "tw-w-full tw-px-4 tw-py-2.5 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-gray-50 tw-text-sm tw-text-gray-700 focus:tw-outline-none focus:tw-border-primario-500 focus:tw-ring-2 focus:tw-ring-primario-100 focus:tw-bg-white tw-transition-all";

    return (
        <form onSubmit={gestionarForm} className="tw-flex tw-flex-col tw-gap-4">

            {isEditing && (
                <div>
                    <label className={labelClass}>ID Solicitud</label>
                    <input
                        type="text"
                        id="Id_solicitud"
                        className={`${inputClass} tw-opacity-60 tw-cursor-not-allowed`}
                        value={formData.Id_solicitud || ""}
                        disabled
                    />
                </div>
            )}

            {/* Responsable */}
            <div>
                <label className={labelClass}>
                    <User className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1" />
                    Responsable
                </label>
                <select
                    id="Id_Responsable"
                    className={inputClass}
                    value={formData.Id_Responsable}
                    onChange={handleInputChange}
                    required
                >
                    <option value="">Seleccione un responsable...</option>
                    {responsables.map((resp) => (
                        <option key={resp.Id_Responsable} value={resp.Id_Responsable}>
                            {resp.Nom_Responsable}
                        </option>
                    ))}
                </select>
            </div>

            {/* Fecha entrega */}
            <div>
                <label className={labelClass}>
                    <Calendar className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1" />
                    Fecha de entrega
                </label>
                <input
                    type="date"
                    id="Fec_entrega"
                    className={inputClass}
                    value={formData.Fec_entrega}
                    onChange={handleInputChange}
                    required
                />
            </div>

            {/* Motivo */}
            <div>
                <label className={labelClass}>
                    <FileText className="tw-w-3.5 tw-h-3.5 tw-inline tw-mr-1" />
                    Motivo
                </label>
                <input
                    type="text"
                    id="motivo"
                    className={inputClass}
                    placeholder="Ej: Práctica de panadería"
                    value={formData.motivo}
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
    );
};

export default SolicitudForm;
