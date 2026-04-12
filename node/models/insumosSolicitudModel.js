import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";
  
   const insumosSolicitudModel = sequelize.define("insumos_solicitud", {
       Id_insumo_solicitud: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
       Id_solicitud:        { type: DataTypes.INTEGER, allowNull: false },
       Id_insumos:          { type: DataTypes.INTEGER, allowNull: false },
       Id_Entradas: { type: DataTypes.INTEGER, allowNull: false },
       cantidad_solicitada: { type: DataTypes.INTEGER, allowNull: false }
   }, { tableName: "insumos_solicitud", timestamps: true });
  
   export default insumosSolicitudModel;