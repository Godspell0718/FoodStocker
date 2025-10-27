import db from "../database/db.js";
import { DataTypes } from 'sequelize';

const Almacen = db.define('almacen', {
    Id_Almacen: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Nom_almacen: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Est_almacen: {
        type: DataTypes.ENUM('activo', 'inactivo'),
        allowNull: false
    }
}, {
    freezeTableName: true,
    timestamps: true
});

export default Almacen;