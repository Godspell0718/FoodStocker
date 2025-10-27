import loteService from "../services/loteService.js";
export const getAllLotes = async (req, res) => {
    try {
        const lotes = await loteService.getAll()
        res.status(200).json(lotes)

    } catch (error) {
        res.status(500).json({ message: error.message })

    }

}

export const getLote = async (req, res) => {
    try {
        const lote = await loteService.getById(req.params.id)
        res.status(200).json(lote)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

export const createLote = async (req, res) => {
    try {
        const lote = await loteService.create(req.body)
        res.status(201).json({ message: "Lote creado", lote })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export const updateLote = async (req, res) => {
    try {
        await loteService.update(req.params.id, req.body)
        res.status(200).json({ message: "Lote actualizado correctamente" })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export const deleteLote = async (req, res) => {
    try {
        await loteService.delete(req.params.id)
        res.status(204).send()
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}