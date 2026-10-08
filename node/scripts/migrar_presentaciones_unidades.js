/**
 * Migración: valor unitario en insumos, unidades en minúsculas, presentaciones,
 * tipo de solicitud y fecha de vencimiento opcional.
 *
 * Uso (desde la carpeta /node):   node scripts/migrar_presentaciones_unidades.js
 *
 * Es idempotente: se puede ejecutar varias veces sin dañar datos.
 */
import db from "../database/db.js";

const UNIDADES = "'kg','gr','ml','l','lbs','und'";

const columnaExiste = async (tabla, columna) => {
    const [rows] = await db.query(
        `SELECT COUNT(*) AS n FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        { replacements: [tabla, columna] }
    );
    return Number(rows[0].n) > 0;
};

/**
 * Pasa una columna ENUM de unidades a minúsculas.
 * MySQL no permite un ENUM con 'Kg' y 'kg' a la vez (son duplicados con collation
 * case-insensitive), por eso se pasa temporalmente por VARCHAR.
 */
const unidadesAMinusculas = async (tabla) => {
    console.log(`→ ${tabla}.Uni_medida a minúsculas`);
    await db.query(`ALTER TABLE \`${tabla}\` MODIFY \`Uni_medida\` VARCHAR(10) NOT NULL DEFAULT 'gr'`);
    await db.query(`UPDATE \`${tabla}\` SET \`Uni_medida\` = LOWER(TRIM(\`Uni_medida\`))`);
    // Cualquier valor raro que no esté en la lista pasa a 'gr' para no romper el ENUM
    await db.query(`UPDATE \`${tabla}\` SET \`Uni_medida\` = 'gr' WHERE \`Uni_medida\` NOT IN (${UNIDADES})`);
    await db.query(`ALTER TABLE \`${tabla}\` MODIFY \`Uni_medida\` ENUM(${UNIDADES}) NOT NULL DEFAULT 'gr'`);
};

const migrar = async () => {
    try {
        await db.authenticate();
        console.log("✅ Conectado. Iniciando migración...\n");

        // 1. Unidades de medida en minúsculas
        await unidadesAMinusculas("insumos");
        await unidadesAMinusculas("entradas");

        // 2. Referencia siempre en mayúsculas (por si quedó algún dato viejo)
        console.log("→ insumos.Ref_Insumo a mayúsculas");
        await db.query("UPDATE `insumos` SET `Ref_Insumo` = UPPER(`Ref_Insumo`)");

        // 3. Presentación del insumo (bulto, cubeta...) y su contenido
        if (!(await columnaExiste("insumos", "Tip_Presentacion"))) {
            console.log("→ Agregando insumos.Tip_Presentacion");
            await db.query("ALTER TABLE `insumos` ADD COLUMN `Tip_Presentacion` VARCHAR(30) NULL DEFAULT NULL AFTER `Ref_Insumo`");
        }
        if (!(await columnaExiste("insumos", "Can_Presentacion"))) {
            console.log("→ Agregando insumos.Can_Presentacion");
            await db.query("ALTER TABLE `insumos` ADD COLUMN `Can_Presentacion` INT NULL DEFAULT NULL AFTER `Tip_Presentacion`");
        }

        // 4. Tipo de solicitud
        if (!(await columnaExiste("solicitud", "Tip_solicitud"))) {
            console.log("→ Agregando solicitud.Tip_solicitud");
            await db.query("ALTER TABLE `solicitud` ADD COLUMN `Tip_solicitud` ENUM('PRESENTACION','CANTIDAD') NOT NULL DEFAULT 'CANTIDAD' AFTER `Id_Destino`");
        }

        // 5. Fecha de vencimiento opcional (NULL = N/A)
        console.log("→ entradas.Fec_Ven_Entrada permite NULL (N/A)");
        await db.query("ALTER TABLE `entradas` MODIFY `Fec_Ven_Entrada` DATE NULL DEFAULT NULL");

        console.log("\n✅ Migración completada correctamente.");
        process.exit(0);
    } catch (error) {
        console.error("\n❌ Error en la migración:", error);
        process.exit(1);
    }
};

migrar();
