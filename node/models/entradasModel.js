import db from '../database/db.js';
import { DataTypes } from 'sequelize';

const entradaModel = db.define('entradas',{
    Id_Entradas:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Fec_Entrada:{
        type: DataTypes.DATE
    },
    Des_Entrada:{
        type: DataTypes.STRING
    },
    Can_Entrada:{
        type: DataTypes.INTEGER
    },
    Id_Almacen:{
        type: DataTypes.INTEGER,
        references: {
            model: 'Almacenes',
            key: 'Id_Almacen'
        }
    },
    Id_Insumo:{
        type: DataTypes.INTEGER,
        references: {
            model: 'Insumos',
            key: 'Id_Insumo'
        }
    },
    Id_Lote:{
        type: DataTypes.INTEGER,
        references: {
            model: 'Lotes',
            key: 'Id_Lote'
        }
    },
    createdAt: {
        type: DataTypes.DATE,
        field: "createdat" 
    },
    updatedAt: {
        type: DataTypes.DATE,
        field: "updatedat" 
    }
},{
    freezeTableName: true,
})

export default entradaModel;