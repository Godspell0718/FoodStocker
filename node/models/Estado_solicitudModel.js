import db from '../database/db.js'      
import {DataTypes} from 'sequelize'

const Estado_solicitudModel = db.define('estado_solicitud',{
    Id_estado_solicitud:{type: DataTypes.NUMBER, primaryKey: true, autoIncrement: true},
    Id_solicitud  : {type:DataTypes.NUMBER},
    Id_estado  : {type:DataTypes.NUMBER},
    fecha: {type:DataTypes.DATE},
    createdat: {type:DataTypes.DATE},
    updatedat: {type:DataTypes.DATE}
},{
    freezeTableName: true,
})

export default Estado_solicitudModel;