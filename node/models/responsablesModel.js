import db from "../database/db.js";
import { DataTypes } from "sequelize";

const ResponsableModel = db.define("Responsables", {
    Id_Responsable: {
        type: DataTypes.INTEGER(5),
        primaryKey: true,
        autoIncrement: true
    },
    Nom_Responsable: {
        type: DataTypes.STRING(30)
    },
    Tip_Responsable: {
        type: DataTypes.ENUM('P', 'I'),
        allowNull: false
    },
    Tel_Responsable: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    Cor_Responsable: {
        type: DataTypes.STRING(35),
        allowNull: false
    },
    Doc_Responsable: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
    createdat: {  
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW  
    },
    updatedat: {  
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,  
        onUpdate: DataTypes.NOW  
    }
}, {
    freezeTableName: true,
    timestamps: false,
    tableName: 'Responsables' 
});

export default ResponsableModel;
