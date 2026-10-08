import db from "../database/db.js";

const tablasALimpiar = [
    "insumos_solicitud",
    "estado_solicitud",
    "solicitud",
    "perdidas",
    "entradas",
    "insumosproveedor",
    "insumos",
    "proveedores"
];

const tablasAConservar = [
    "responsables",
    "destino",
    "estados"
];

const limpiarBaseDeDatos = async () => {
    try {
        await db.authenticate();
        console.log("Conectado a la base de datos.");

        await db.query("SET FOREIGN_KEY_CHECKS = 0;");

        for (const tabla of tablasALimpiar) {
            await db.query(`TRUNCATE TABLE \`${tabla}\`;`);
            console.log(`Tabla vaciada y reiniciada: ${tabla}`);
        }

        await db.query("SET FOREIGN_KEY_CHECKS = 1;");

        console.log("\n--- RESUMEN ACTUAL DE REGISTROS ---");
        const [todasLasTablas] = await db.query("SHOW TABLES");
        for (const t of todasLasTablas) {
            const nombre = Object.values(t)[0];
            const [rows] = await db.query(`SELECT COUNT(*) AS total FROM \`${nombre}\``);
            const conservada = tablasAConservar.includes(nombre) ? " [CONSERVADA]" : " [LIMPIA]";
            console.log(`• ${nombre}: ${rows[0].total} registros${conservada}`);
        }

        console.log("\nLimpieza completada exitosamente.");
        process.exit(0);
    } catch (error) {
        console.error("Error durante la limpieza:", error);
        try {
            await db.query("SET FOREIGN_KEY_CHECKS = 1;");
        } catch (_) {}
        process.exit(1);
    }
};

limpiarBaseDeDatos();
