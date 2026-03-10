import solicitudService from "../services/solicitudService.js";
import solicitudServiceNuevo from "../services/SolicitudServiceNuevo.js";
import SolicitudModel from "../models/SolicitudModel.js";
import responsablesModel from "../models/responsableModel.js";
import insumosSolicitudModel from "../models/insumosSolicitudModel.js";
import insumosModel from "../models/insumosModel.js";
import Estado_solicitudModel from "../models/Estado_solicitudModel.js";
import EstadosModel from "../models/EstadosModel.js";

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
    export const getInsumosBySolicitud = async (req, res) => {
        try {
            const { Id_solicitud } = req.params;
            const insumos = await insumosSolicitudModel.findAll({
                where: { Id_solicitud },
                include: [{
                    model: insumosModel,
                    as: 'insumo',
                    attributes: ['Nom_Insumo', 'Uni_Med_Insumo']
                }]
            });
            res.status(200).json(insumos);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }

    }

// Trae todas las solicitudes con su último estado, responsable e insumos
export const getSolicitudesPendientes = async (req, res) => {
    try {
        const solicitudes = await SolicitudModel.findAll({
            include: [
                {
                    model: responsablesModel,
                    as: 'responsable',
                    attributes: ['Nom_Responsable', 'Tip_Responsable']
                },
                {
                    model: insumosSolicitudModel,
                    as: 'insumos',
                    include: [{
                        model: insumosModel,
                        as: 'insumo',
                        attributes: ['Nom_Insumo']
                    }]
                }
            ],
            order: [['createdat', 'DESC']]
        });

        // Agregar el último estado a cada solicitud
        const result = await Promise.all(solicitudes.map(async (sol) => {
            const ultimoEstadoReg = await Estado_solicitudModel.findOne({
                where: { Id_solicitud: sol.Id_solicitud },
                include: [{ model: EstadosModel, as: 'estado', attributes: ['nom_estado'] }],
                order: [['createdat', 'DESC']]
            });

            return {
                ...sol.toJSON(),
                ultimoEstado: ultimoEstadoReg?.estado?.nom_estado ?? "solicitado"
            };
        }));

        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// POST /api/solicitudes/cambiar-estado
export const cambiarEstadoSolicitud = async (req, res) => {
    try {
        const { Id_solicitud, Id_estado } = req.body;
        if (!Id_solicitud || !Id_estado) {
            return res.status(400).json({ message: "Id_solicitud e Id_estado son requeridos" });
        }
        const registro = await solicitudServiceNuevo.cambiarEstado({ Id_solicitud, Id_estado });
        res.status(201).json({ message: "Estado actualizado", registro });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


