import EstadosService from '../services/EstadosService.js'

export const getAll = async (req, res) => {
    try {
        const Estados = await EstadosService.getAll()
        res.status(200).json(Estados)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getById = async (req, res) => {
    try {
        const estado = await EstadosService.getById(req.params.Id_estado)
        res.status(200).json(estado)

    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
}
export const createEstado = async (req, res) => {
    try {
        const estado = await EstadosService.create(req.body)
        res.status(201).json({ message: "Estado creado", estado })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export const updateEstado = async (req, res) => {
    try {
        await EstadosService.update(req.params.Id_estado, req.body)
        res.status(200).json({ message: "Estado actualizado correctamente" })
    } catch (error) {
        res.status(400).json({ message: error.message })

    }
}

export const deleteEstado = async (req, res) => {
    try {
        await EstadosService.delete(req.params.Id_estado)
        res.status(204).send()
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}
