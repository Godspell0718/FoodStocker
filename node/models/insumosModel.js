import db from '../database/db.js';
import { DataTypes } from 'sequelize';

const insumoModel = db.define('insumos', {
    Id_Insumos: {
        type: DataTypes.INTEGER(5),
        primaryKey: true,
        autoIncrement: true
    },
    Nom_Insumo: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    Tip_Insumo: {
        type: DataTypes.ENUM('lacteos', 'carnicos', 'chocolateria', 'panaderia', 'bebidas', 'condimentos',
        'especias', 'frutas', 'verduras', 'granos', 'cereales', 'aceites', 'salsas', 'enlatados', 'congelados'),
        allowNull: false
    },
    Can_Insumo: {
        type: DataTypes.INTEGER(10),
        allowNull: false
    },
    peso: {
        type: DataTypes.DECIMAL(10, 1),
        allowNull: false
    },
    Uni_Med_Insumo: {
        type: DataTypes.ENUM('gr', 'kg', 'ml', 'L', 'lbs'),
        allowNull: false,
        defaultValue: 'gr'
    },
    Ref_Insumo: {
        type: DataTypes.ENUM('MP', 'IN'),
        allowNull: false,
        defaultValue: 'MP'
    },
    Codigo_Insumo: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    createdat: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    updatedat: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    }
}, {
    freezeTableName: true,
    timestamps: false
});

export default insumoModel;