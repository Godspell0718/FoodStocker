import solicitudService from "../services/SolicitudService.js"

export const getAll = async (req, res) => {
    try {
        const Solicitud = await solicitudService.getAll()
        res.status(200).json(Solicitud)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getById = async (req, res) => {
    try {
        const solicitud = await solicitudService.getById(req.params.Id_solicitud)
        res.status(200).json(solicitud)

    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const createSolicitud = async (req, res) => {
  try {
    console.log("REQ BODY ", req.body);

    const solicitud = await solicitudService.create({
      Id_Responsable: req.body.Id_Responsable,
      Fec_entrega: req.body.Fec_entrega,
      motivo: req.body.motivo
    });

    res.status(201).json(solicitud);
  } catch (error) {
    console.error("SEQUELIZE ERROR ", error);
    res.status(400).json({ message: error.message });
  }
};



export const updatesolicitud = async (req, res) => {
    try {
        await solicitudService.update(req.params.Id_solicitud, req.body)
        res.status(200).json({ message: "solicitud actualizada correctamente" })
    } catch (error) {
        res.status(400).json({ message: error.message })

    }
}

export const deletesolicitud = async (req, res) => {
    try {
        await solicitudService.delete(req.params.Id_solicitud)
        res.status(204).send()
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}
