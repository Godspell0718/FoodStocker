import solicitudService from "../services/solicitudService.js";
import solicitudServiceNuevo from "../services/SolicitudServiceNuevo.js";
import SolicitudModel from "../models/SolicitudModel.js";
import responsablesModel from "../models/responsableModel.js";
import insumosSolicitudModel from "../models/insumosSolicitudModel.js";
import insumosModel from "../models/insumosModel.js";
import entradasModel from "../models/entradasModel.js";
import Estado_solicitudModel from "../models/Estado_solicitudModel.js";
import EstadosModel from "../models/EstadosModel.js";
import DestinoModel from "../models/destinoModel.js";

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
        const solicitud = await solicitudService.create({
            Id_Responsable: req.body.Id_Responsable,
            Fec_entrega: req.body.Fec_entrega,
            motivo: req.body.motivo,
            Descripcion: req.body.Descripcion || req.body.descripcion,
            Ficha: req.body.Ficha || req.body.ficha,
            Id_Destino: req.body.Id_Destino
        });

        // Registrar estado inicial (1 = solicitado)
        await Estado_solicitudModel.create({
            Id_solicitud: solicitud.Id_solicitud,
            Id_estado: 1,
            fecha: new Date()
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
                    attributes: ['Nom_Insumo', 'Uni_medida']
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
                    model: DestinoModel,
                    as: 'destino',
                    attributes: ['Nom_Destino', 'Tip_Destino']
                },
                {
                    model: insumosSolicitudModel,
                    as: 'insumos',
                    include: [
                        {
                            model: insumosModel,
                            as: 'insumo',
                            attributes: ['Nom_Insumo', 'Uni_medida', 'Tip_Presentacion', 'Can_Presentacion'],
                            include: [{
                                model: entradasModel,
                                as: 'entradas',
                                attributes: ['Id_Entradas', 'Lote', 'Can_Inicial', 'Can_Salida', 'Estado', 'Fec_Ven_Entrada', 'Uni_medida'],
                                required: false
                            }]
                        },
                        {
                            model: entradasModel,
                            as: 'entrada',
                            attributes: ['Id_Entradas', 'Lote', 'Fec_Ven_Entrada', 'Uni_medida']
                        }
                    ]
                }
            ],
            order: [['createdat', 'DESC']]
        });

        // Agregar el último estado a cada solicitud
        const result = await Promise.all(solicitudes.map(async (sol) => {
            const ultimoEstadoReg = await Estado_solicitudModel.findOne({
                where: { Id_solicitud: sol.Id_solicitud },
                include: [{ model: EstadosModel, as: 'estado', attributes: ['nom_estado'] }],
                order: [['Id_estado_solicitud', 'DESC']]
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
        const { Id_solicitud, Id_estado, motivo_cancelacion } = req.body;
        if (!Id_solicitud || !Id_estado) {
            return res.status(400).json({ message: "Id_solicitud e Id_estado son requeridos" });
        }
        if (Number(Id_estado) === 4 && (!motivo_cancelacion || !String(motivo_cancelacion).trim())) {
            return res.status(400).json({ message: "El motivo de cancelación es obligatorio" });
        }
        const registro = await solicitudServiceNuevo.cambiarEstado({ Id_solicitud, Id_estado, motivo_cancelacion });
        res.status(201).json({ message: "Estado actualizado", registro });
    } catch (error) {
        // Errores de reglas de negocio (transición inválida, stock, etc.) → 400
        res.status(400).json({ message: error.message });
    }
};

// POST /api/solicitudes/novedad
export const guardarNovedad = async (req, res) => {
    try {
        const { Id_solicitud, observacion, items } = req.body;
        if (!Id_solicitud) {
            return res.status(400).json({ message: "Id_solicitud es requerido" });
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Debes enviar los items con las cantidades entregadas" });
        }
        // Validar cada item
        for (const item of items) {
            if (item.cantidad_entregada === undefined || item.cantidad_entregada === null) {
                return res.status(400).json({ message: "Cada item debe tener cantidad_entregada" });
            }
            if (item.cantidad_entregada < 0) {
                return res.status(400).json({ message: "La cantidad entregada no puede ser negativa" });
            }
            if (item.cantidad_entregada > item.cantidad_solicitada) {
                return res.status(400).json({ message: "La cantidad entregada no puede superar la solicitada" });
            }
        }
        const result = await solicitudServiceNuevo.registrarNovedad({ Id_solicitud, observacion, items });
        res.status(200).json(result);
    } catch (error) {
        console.error("Error al registrar novedad:", error);
        res.status(500).json({ message: error.message });
    }
};

// POST /api/solicitudes/cambiar-lote
export const cambiarLoteItemSolicitud = async (req, res) => {
    try {
        const { Id_insumo_solicitud, Id_Entradas_nuevo } = req.body;
        if (!Id_insumo_solicitud || !Id_Entradas_nuevo) {
            return res.status(400).json({ message: "Id_insumo_solicitud e Id_Entradas_nuevo son requeridos" });
        }
        const resultado = await solicitudServiceNuevo.cambiarLoteItem({ Id_insumo_solicitud, Id_Entradas_nuevo });
        res.status(200).json({ message: "Lote cambiado exitosamente", data: resultado });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
