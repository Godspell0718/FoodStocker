import db from "../database/db.js";
import { DataTypes } from "sequelize";

const LoteModel = db.define('lote', {
    Id_Lote: {
        type: DataTypes.INTEGER,
        primaryKey: true, autoIncrement: true
    },
    Id_Insumo: {
        type: DataTypes.INTEGER,
        references: {
            model: 'insumos',
            key: 'Id_Insumo'
        }
    },
    
    Id_Almacen: {
        type: DataTypes.INTEGER,
        references: {
            model: 'almacen',
            key: 'Id_Almacen'
        }
    },

    Catidad_Dis_Insumo: {
    type: DataTypes.INTEGER,
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

export default LoteModel;
