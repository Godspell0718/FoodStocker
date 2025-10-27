import db from '../Database/db.js'      
import {DataTypes} from 'sequelize'

const Salidas = db.define('salidas',{
    Id_Salida:{type: DataTypes.NUMBER, primaryKey: true, autoIncrement: true},
    Des_Salida  : {type:DataTypes.STRING},
    Fec_Salida  : {type:DataTypes.DATE},
    Id_Almacen  : {type:DataTypes.NUMBER},
    Id_Lote     : {type:DataTypes.NUMBER},
    Cant_Salida : {type:DataTypes.NUMBER},
    Id_Destino  : {type:DataTypes.NUMBER}
},{
freezeTableName: true,
})

export default Salidas;