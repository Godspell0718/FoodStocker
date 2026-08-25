import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// La configuración de la BD se lee del archivo .env
// En local usa .env (desarrollo), en el servidor usa el .env de producción
const db = new Sequelize(
    process.env.DB_NAME || "foodstocker",
    process.env.DB_USER || "root",
    process.env.DB_PASSWORD || "",
    {
        host: process.env.DB_HOST || "localhost",
        dialect: process.env.DB_DIALECT || "mysql",
        logging: process.env.NODE_ENV === "production" ? false : console.log
    }
);

export default db;