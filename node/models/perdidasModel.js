import db from '../database/db.js';
import { DataTypes } from 'sequelize';
import insumoModel from './insumosModel.js';
import entradaModel from './entradasModel.js';
import responsableModel from './responsableModel.js';

const perdidaModel = db.define('perdidas', {
    Id_Perdida: {
        type: DataTypes.INTEGER(5),
        primaryKey: true,
        autoIncrement: true
    },
    Id_Insumo: {
        type: DataTypes.INTEGER(5),
        allowNull: false,
        references: {
            model: 'insumos',
            key: 'Id_Insumos'
        }
    },
    Id_Entrada: {
        type: DataTypes.INTEGER(5),
        allowNull: true,
        references: {
            model: 'entradas',
            key: 'Id_Entradas'
        }
    },
    Cantidad: {
        type: DataTypes.INTEGER(4),
        allowNull: false
    },
    Motivo: {
        type: DataTypes.ENUM('VENCIMIENTO', 'DAÑO_FISICO', 'CONTAMINACION', 'OTROS'),
        allowNull: false
    },
    Observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    Id_Responsable: {
        type: DataTypes.INTEGER(5),
        allowNull: false,
        references: {
            model: 'responsables',
            key: 'Id_Responsable'
        }
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "createdat"
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "updatedat"
    }
}, {
    freezeTableName: true,
    timestamps: true
});

// Relaciones para facilitar las consultas
perdidaModel.belongsTo(insumoModel, { foreignKey: 'Id_Insumo' });
perdidaModel.belongsTo(entradaModel, { foreignKey: 'Id_Entrada' });
perdidaModel.belongsTo(responsableModel, { foreignKey: 'Id_Responsable' });

export default perdidaModel;
