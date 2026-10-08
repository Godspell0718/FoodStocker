import db from '../database/db.js';
import { DataTypes } from 'sequelize';

const entradaModel = db.define('entradas', {
    Id_Entradas: {
        type: DataTypes.INTEGER(5),
        primaryKey: true,
        autoIncrement: true
    },
    Fec_Ven_Entrada: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    Lote: {
        type: DataTypes.STRING(40),
        allowNull: false
    },
    Vlr_Unitario: {
        type: DataTypes.DECIMAL(10, 0),
        allowNull: true
    },
    Vlr_Total: {
        type: DataTypes.DECIMAL(10, 0),
        allowNull: true
    },
    Can_Inicial: {
        type: DataTypes.INTEGER(4),
        allowNull: false
    },
    Can_Salida: {
        type: DataTypes.INTEGER(4),
        allowNull: false
    },
    Estado: {
        type: DataTypes.ENUM('STOCK', 'AGOTADO', 'VENCIDO'),
        allowNull: false,
        defaultValue: 'STOCK'
    },
    Id_Proveedor: {
        type: DataTypes.INTEGER(5),
        allowNull: false,
        references: {
            model: 'proveedores',
            key: 'Id_Proveedor'
        }
    },
    Id_Pasante: {
        type: DataTypes.INTEGER(5),
        allowNull: false,
        references: {
            model: 'responsables',
            key: 'Id_Responsable'
        }
    },
    Id_Instructor: {
        type: DataTypes.INTEGER(5),
        allowNull: false,
        references: {
            model: 'responsables',
            key: 'Id_Responsable'
        }
    },
    Id_Insumos: {
        type: DataTypes.INTEGER(5),
        allowNull: false,
        references: {
            model: 'insumos',
            key: 'Id_Insumos'
        }
    },
    Observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
    },
    Uni_medida: {
        type: DataTypes.ENUM('kg', 'gr', 'ml', 'l', 'lbs', 'und'),
        allowNull: false, 
        defaultValue: 'gr',
        set(valor) {
            this.setDataValue('Uni_medida', valor == null ? valor : String(valor).trim().toLowerCase());
        }
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

export default entradaModel;