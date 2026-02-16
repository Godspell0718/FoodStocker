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
        type: DataTypes.ENUM("P","I"),
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
