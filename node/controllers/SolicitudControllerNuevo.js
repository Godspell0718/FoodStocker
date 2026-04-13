import solicitudServiceNuevo from "../services/SolicitudServiceNuevo.js";

export const crearSolicitudCompleta = async (req, res) => {
    try {
        const { Id_Responsable, Fec_entrega, motivo, insumos } = req.body;

        if (!Id_Responsable || !Fec_entrega || !motivo || !insumos || insumos.length === 0) {
            return res.status(400).json({ message: "Faltan campos requeridos o no hay insumos" });
        }

        const solicitud = await solicitudServiceNuevo.crearCompleta({
            Id_Responsable,
            Fec_entrega,
            motivo,
            insumos
        });

        res.status(201).json({ message: "Solicitud creada correctamente", solicitud });

    } catch (error) {
        console.error("Error al crear solicitud completa:", error);
        res.status(400).json({ message: error.message });
    }
};





