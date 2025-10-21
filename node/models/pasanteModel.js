import db from "../database/db.js";
import { DataTypes } from "sequelize";

const PasanteModel = db.define("pasantes", {
    Id_Pasante: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Nom_Pasante: {
        type: DataTypes.STRING
    },
    Tel_Pasante: {
        type: DataTypes.STRING
    },
    Doc_Pasante: {
        type: DataTypes.INTEGER
    },
    createdAt: {
        type: DataTypes.DATE,
        field: "createdate" 
    },
    updatedAt: {
        type: DataTypes.DATE,
        field: "updatedate" 
    }
}, {
    freezeTableName: true,
    timestamps: true 
});

export default PasanteModel;
