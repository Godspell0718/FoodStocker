import express from "express"
import cors from "cors"
import db from "./database/db.js"
import destinoRoutes from "./routes/destinoRoutes.js"
import entradasRoutes from "./routes/entradasRoutes.js"
import insumosProveedorRoutes from "./routes/insumosProveedorRoutes.js"
import insumosRouters from "./routes/insumosRouters.js" 
import pasantesRouters from "./routes/pasanteRouters.js"
import proveedoresRouters from "./routes/proveedoresRouters.js"
import salidasRoute from "./routes/salidasRoute.js"

import dotenv from "dotenv"

import entradasModel from "./models/entradasModel.js"
import insumosModel from "./models/insumosModel.js"
import proveedoresModel from "./models/proveedoresModel.js" 
import responsablesModel from "./models/responsablesModel.js"

dotenv.config();

const app = express()

app.use(express.json())
app.use(cors())

// ============================================
// ASOCIACIONES DE MODELOS
// ============================================
// ⚠️ IMPORTANTE: Las asociaciones deben ir ANTES de las rutas

// Entrada -> Insumo
entradasModel.belongsTo(insumosModel, {
    foreignKey: 'Id_Insumos',  
    as: 'insumo' 
});
insumosModel.hasMany(entradasModel, {
    foreignKey: 'Id_Insumos', 
    as: 'entradas' 
});

// Entrada -> Proveedor
entradasModel.belongsTo(proveedoresModel, {
    foreignKey: 'Id_Proveedor',
    as: 'proveedor'
});
proveedoresModel.hasMany(entradasModel, {
    foreignKey: 'Id_Proveedor',
    as: 'entradas'
});

// Entrada -> Responsable (Pasante)
entradasModel.belongsTo(responsablesModel, {
    foreignKey: 'Id_Pasante',
    as: 'pasante'
});

// Entrada -> Responsable (Instructor)
entradasModel.belongsTo(responsablesModel, {
    foreignKey: 'Id_Instructor',
    as: 'instructor'
});

// Responsable tiene muchas Entradas como Pasante
responsablesModel.hasMany(entradasModel, {
    foreignKey: 'Id_Pasante',
    as: 'entradas_como_pasante'
});

// Responsable tiene muchas Entradas como Instructor
responsablesModel.hasMany(entradasModel, {
    foreignKey: 'Id_Instructor',
    as: 'entradas_como_instructor'
});

// ============================================
// RUTAS
// ============================================

app.use("/api/destino", destinoRoutes)
app.use("/api/entradas", entradasRoutes)
app.use("/api/insumosproveedor", insumosProveedorRoutes)
app.use("/api/insumos", insumosRouters)
app.use("/api/pasantes", pasantesRouters)
app.use("/api/proveedores", proveedoresRouters)
app.use("/api/salidas", salidasRoute)

// ============================================
// CONEXIÓN A BASE DE DATOS
// ============================================

try{
    await db.authenticate()
    console.log("✅ Conexión a la base de datos exitosa")
}catch(error){
    console.error("❌ Error al conectar a la base de datos: ", error)
    process.exit(1)
}

app.get("/", (_req, res) => {
    res.send("Hola Mundo de Andrey")
})

// ============================================
// INICIAR SERVIDOR
// ============================================

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app