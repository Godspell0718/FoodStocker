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
    // Unidad de medida: siempre en minúsculas
    Uni_medida: {
        type: DataTypes.ENUM('kg', 'gr', 'ml', 'l', 'lbs', 'und'),
        allowNull: false,
        defaultValue: 'gr',
        set(valor) {
            this.setDataValue('Uni_medida', valor == null ? valor : String(valor).trim().toLowerCase());
        }
    },
    // Referencia: siempre en mayúsculas
    Ref_Insumo: {
        type: DataTypes.ENUM('MP', 'IN', 'MR', 'PT', 'PP'),
        allowNull: false,
        defaultValue: 'MP',
        set(valor) {
            this.setDataValue('Ref_Insumo', valor == null ? valor : String(valor).trim().toUpperCase());
        }
    },
    // Presentación comercial (ej. bulto, cubeta) y cuánto trae en Uni_medida.
    // Se usa para las solicitudes "por presentación completa".
    Tip_Presentacion: {
        type: DataTypes.STRING(30),
        allowNull: true,
        defaultValue: null
    },
    Can_Presentacion: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
    },
    Descripcion: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
    Estado: {
        type: DataTypes.ENUM('ACTIVO', 'INACTIVO'),
        defaultValue: 'ACTIVO',
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