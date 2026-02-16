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
    Tip_Destino: {
        type: DataTypes.STRING
    },
    createdat: {
        type: DataTypes.DATE,
        field: "createdat"
    },
    updatedat: {
        type: DataTypes.DATE,
        field: "updatedat"
    }
}, {
    freezeTableName: true
})

export default DestinoModel;

