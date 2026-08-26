import db from "./db.js";
import responsableModel from "../models/responsableModel.js";
import insumoModel from "../models/insumosModel.js";
import ProveedorModel from "../models/proveedoresModel.js";
import DestinoModel from "../models/destinoModel.js";
import entradaModel from "../models/entradasModel.js";
import SolicitudModel from "../models/SolicitudModel.js";
import perdidaModel from "../models/perdidasModel.js";

const syncDatabase = async () => {
    try {
        console.log("🔄 Conectando y actualizando esquema de la base de datos...");
        await db.authenticate();
        
        // Intentar alter automático con Sequelize
        await db.sync({ alter: true });
        console.log("✅ Esquema de base de datos sincronizado correctamente con Sequelize.");

        // Fallbacks SQL directos por si alguna tabla no soporta alter enum directamente
        const tablesToUpdate = ['responsables', 'insumos', 'proveedores', 'destino'];
        for (const table of tablesToUpdate) {
            try {
                await db.query(`
                    ALTER TABLE \`${table}\` 
                    ADD COLUMN IF NOT EXISTS \`Estado\` ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO';
                `);
            } catch (err) {
                // Si la columna ya existe o varía sintaxis, continuar
            }
        }
        console.log("✅ Comprobación de columnas 'Estado' completada.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error al sincronizar la base de datos:", error);
        process.exit(1);
    }
};

syncDatabase();
