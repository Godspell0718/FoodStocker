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
  Tip_Proveedor: {          // Natural o Empresa
    type: DataTypes.STRING,
  },
  Tel_Proveedor: {
    type: DataTypes.STRING,
  },
  Cor_Proveedor: {
    type: DataTypes.STRING,
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
  freezeTableName: true,
  timestamps: true
});

export default ProveedorModel;
