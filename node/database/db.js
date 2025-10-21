import {Sequelize} from "sequelize";

const db = new Sequelize("foodstocker", "root", "",{
    host: "localhost",
    dialect: "mysql"
})
export default db