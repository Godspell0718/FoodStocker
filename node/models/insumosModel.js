import db from "../database/db.js";
import { DataTypes } from 'sequelize';

const Insumo = db.define('insumos', {
    Id_Insumos: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Nom_insumo: {
        type: DataTypes.STRING(40)
    },
    Vlr_insumo: {
        type: DataTypes.INTEGER
    },
    Tip_producto: {
        type: DataTypes.ENUM('lácteos', 'cárnicos', 'chocolatería', 
        'panadería', 'bebidas', 'aseo', 'aseo personal', 'otros'),
        allowNull: false
    },
    Id_Lote: {
        type: DataTypes.INTEGER,
        references: {
            model: 'lote',
            key: 'Id_Lote'
        }
    },
    Marc_insumo: {
        type: DataTypes.STRING(30)
    }
}, {
    freezeTableName: true,
    timestamps: true
});

export default Insumo; 