import Estado_solicitudService from '../services/Estado_solicitudService.js'

export const getAll = async (req, res) => {
    try {
        const Estado_solicitud = await Estado_solicitudService.getAll()
        res.status(200).json(Estado_solicitud)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getById = async (req, res) => {
    try {
        const estado_solicitud = await Estado_solicitudService.getById(req.params.Id_estado_solicitud)
        res.status(200).json(estado_solicitud)

    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
}
export const createEstado_solicitud = async (req, res) => {
    try {
        const estado_solicitud = await Estado_solicitudService.createEstado_solicitud(req.body)
        res.status(201).json({ message: "Estado solicitud creada", estado_solicitud })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export const updateEstado_solicitud = async (req, res) => {
    try {
        await Estado_solicitudService.updateEstado_solicitud(req.params.Id_estado_solicitud, req.body)
        res.status(200).json({ message: "Estado solicitud actualizada correctamente" })
    } catch (error) {
        res.status(400).json({ message: error.message })

    }
}

export const deleteEstado_solicitud = async (req, res) => {
    try {
        await Estado_solicitudService.deleteEstado_solicitud(req.params.Id_estado_solicitud)
        res.status(204).send()
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}
