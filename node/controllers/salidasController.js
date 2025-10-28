import Ser_Salida from "../services/salidasService.js";

export const getAllSalidas = async (req, res) => {
    try {
        const salidas = await Ser_Salida.getAllSalidas()
        res.status(200).json(salidas)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getSalida = async (req, res) => {
    try {
        const salida = await Ser_Salida.getSalidaById(req.params.Id_Salida)
        res.status(200).json(salida)

    }
    catch (error) {
        res.statuts(500).json({ message: error.message })
    }
}
export const createSalida = async (req, res) => {
    try {
        const salida = async(req, body)
        res.status(201).json({ menssage: "Envio creado correctamente" })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export const updateSalida = async (req, res) => {
    try {
        await Ser_Salida.update(req.params.Id_Salida, req.body)
        res.status(200).json({ message: "Salida actualizada correctamente" })
    } catch (error) {
        res.status(400).json({ message: error.message })

    }
}

export const deleteSalida = async (req, res) => {
    try {
        await Ser_Salida.delete(req.params.Id_Salida)
        res.status(204).send()
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}
