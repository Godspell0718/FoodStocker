import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";

const SolicitudModel = sequelize.define(
    "solicitud",
    {
        Id_solicitud: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Id_Responsable: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        Fec_entrega: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        motivo: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        Descripcion: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        Ficha: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

        createdat: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedat: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    },
    {
        tableName: "solicitud",
        timestamps: false
    }
);

export default SolicitudModel;