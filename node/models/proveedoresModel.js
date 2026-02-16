import db from "../database/db.js";
import { DataTypes } from "sequelize";

const ProveedorModel = db.define("proveedores", {
  Id_Proveedor: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Nom_Proveedor: {
    type: DataTypes.STRING,
  },
  Raz_Social: {
    type: DataTypes.STRING,
  },
  Nit_Proveedor: {
    type: DataTypes.STRING,
  },
  Tel_Proveedor: {
    type: DataTypes.STRING,
  },
  Cor_Proveedor: {
    type: DataTypes.STRING,
  },
  Dir_Proveedor: {
    type: DataTypes.STRING,
  },
  createdAt: {
    type: DataTypes.DATE,
    field: "createdat"
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: "updatedat"
  }
}, {
  freezeTableName: true,
  timestamps: true
});

export default ProveedorModel;
