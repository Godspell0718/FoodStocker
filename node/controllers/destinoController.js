import destinoService from "../services/destinoService.js";
export const getAllDestinos = async (req, res) => {
    try {
        const destinos = await destinoService.getAll()
        res.status(200).json(destinos)

    } catch (error) {
        res.status(500).json({ message: error.message })

    }

}

export const getDestino = async (req, res) => {
    try {
        const destino = await destinoService.getById(req.params.id)
        res.status(200).json(destino)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

export const createDestino = async (req, res) => {
    try {
        const destino = await destinoService.create(req.body)
        res.status(201).json({ message: "Destino creado", destino })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export const updateDestino = async (req, res) => {
    try {
        await destinoService.update(req.params.id, req.body)
        res.status(200).json({ message: "Destino actualizado correctamente" })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export const deleteDestino = async (req, res) => {
    try {
        await destinoService.delete(req.params.id)
        res.status(204).send()
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}