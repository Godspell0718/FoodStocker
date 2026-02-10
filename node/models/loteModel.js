import db from "../database/db.js";
import { DataTypes } from "sequelize";

const LoteModel = db.define('lote', {
    Id_Lote: {
        type: DataTypes.INTEGER,
        primaryKey: true, autoIncrement: true
    },
    Id_Almacen: {
        type: DataTypes.INTEGER,
        references: {
            model: 'almacen',
            key: 'Id_Almacen'
        }
    },
    createdAt: {
    type: DataTypes.DATE,
    field: "fech_lleg"
},
    updatedAt: {
    type: DataTypes.DATE,
    field: "updatedate"
}

}, {
    freezeTableName: true
})

export default LoteModel;
