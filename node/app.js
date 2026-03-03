import dotenv from "dotenv"
import express from 'express';
import cors from "cors"
import db from "./database/db.js"
import destinoRoutes from "./routes/destinoRoutes.js"
import entradasRoutes from "./routes/entradasRoutes.js"
import insumosProveedorRoutes from "./routes/insumosProveedorRoutes.js"
import insumosRouters from "./routes/insumosRouters.js" 
import responsableRouters from "./routes/responsableRouters.js"
import proveedoresRouters from "./routes/proveedoresRouters.js"
import SolicitudRoutes from "./routes/SolicitudRoutes.js"
import EstadosRoutes from "./routes/EstadosRoutes.js"
import Estado_solicitudRoutes from "./routes/Estados_solcitudRoutes.js"
import solicitudInsumosRoutes from "./routes/solicitudInsumosRoutes.js";
import Estado_solicitudModel from "./models/Estado_solicitudModel.js"
import EstadosModel from "./models/EstadosModel.js";
import SolicitudModel from "./models/SolicitudModel.js";
import entradasModel from "./models/entradasModel.js"
import insumosModel from "./models/insumosModel.js"
import proveedoresModel from "./models/proveedoresModel.js" 
import responsablesModel from "./models/responsableModel.js"
import InsumosSolicitudModel from './models/insumosSolicitudModel.js';

dotenv.config();

const app = express()

app.use(express.json())
app.use(cors())

// ============================================
// ASOCIACIONES DE MODELOS
// ============================================
// ⚠️ IMPORTANTE: Las asociaciones deben ir ANTES de las rutas
//Solicitud -> Estado_solicitud

// ... justo después de tus otras asociaciones (ej. entradas - insumos)

// Asociaciones de insumos_solicitud
SolicitudModel.hasMany(InsumosSolicitudModel, {
    foreignKey: 'Id_solicitud',
    as: 'insumos_solicitados'
});
InsumosSolicitudModel.belongsTo(SolicitudModel, {
    foreignKey: 'Id_solicitud',
    as: 'solicitud'
});

InsumosSolicitudModel.belongsTo(insumosModel, {
    foreignKey: 'Id_insumos',
    as: 'insumo'
});
insumosModel.hasMany(InsumosSolicitudModel, {
    foreignKey: 'Id_insumos',
    as: 'solicitudes_insumo'
});

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
app.use("/api/responsables", responsableRouters)
app.use("/api/proveedores", proveedoresRouters)
app.use("/api/solicitudes", SolicitudRoutes)
app.use("/api/estados", EstadosRoutes)
app.use("/api/estado_solicitud", Estado_solicitudRoutes)
app.use("/api/solicitud-insumos", solicitudInsumosRoutes)
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
    res.send("Hola Mundo de NPC'S")
})

// ============================================
// INICIAR SERVIDOR
// ============================================

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app