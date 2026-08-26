import db from "../database/db.js";
import { DataTypes } from "sequelize";

const responsableModel = db.define("responsables", {
    Id_Responsable: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Nom_Responsable: {
        type: DataTypes.STRING
    },
    Tip_Responsable: {
        type: DataTypes.ENUM("ADMIN", "Pasante de agroindustria", "Instructor de agroindustria", "Pasante solicitante"),
        allowNull: false
    },
     Tel_Responsable: {
        type: DataTypes.STRING,
    },
     Doc_Responsable: {
        type: DataTypes.STRING
    },
    Cor_Responsable: {
        type: DataTypes.STRING
    },
     Contraseña: {
        type: DataTypes.STRING
    },
     uuid: {
        type: DataTypes.STRING
    },
     token: {
        type: DataTypes.STRING
    },
    Estado: {
        type: DataTypes.ENUM("ACTIVO", "INACTIVO"),
        defaultValue: "ACTIVO",
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        field: "createdat" 
    },
    updatedAt: {
        type: DataTypes.DATE,
        field: "updatedat" 
    }
}, {
    freezeTableName: true,
    timestamps: true 
});

export default responsableModel;
