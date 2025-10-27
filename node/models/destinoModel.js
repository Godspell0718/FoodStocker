import db from "../database/db.js";
import { DataTypes } from "sequelize";

const DestinoModel = db.define('destino', {
    Id_Destino: {
        type: DataTypes.INTEGER,
        primaryKey: true, autoIncrement: true
    },
    Nom_Destino: {
        type: DataTypes.STRING
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
    freezeTableName: true
})

export default DestinoModel;

