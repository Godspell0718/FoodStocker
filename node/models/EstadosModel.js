import db from '../database/db.js'
import {DataTypes} from 'sequelize'
const EstadosModel = db.define('estados',{
    Id_estado:{type: DataTypes.NUMBER, primaryKey: true, autoIncrement: true},
    nom_estado: {type:DataTypes.STRING},
    createdat: {type:DataTypes.DATE},
    updatedat: {type:DataTypes.DATE},
},{
    freezeTableName: true,
})
export default EstadosModel;