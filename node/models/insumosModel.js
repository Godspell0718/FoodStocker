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
    Ref_Insumo: {

        type: DataTypes.ENUM('MP', 'IN', 'MR', 'PT', 'PP'),
        allowNull: false,
        defaultValue: 'MP'
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