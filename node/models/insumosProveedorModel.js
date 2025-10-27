import db from '../database/db.js';
import { DataTypes } from 'sequelize';

const InsumosProveedorModel = db.define('InsumosProveedores',{
    Id_InsumoProveedor:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Id_Insumo:{
        type: DataTypes.INTEGER,
        references: {
            model: 'Insumos',
            key: 'Id_Insumo'
        }
    },
    Id_Proveedor:{
        type: DataTypes.INTEGER,
        references: {
            model: 'Proveedores',
            key: 'Id_Proveedor'
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