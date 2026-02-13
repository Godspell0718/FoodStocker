import express from 'express';
import cors from "cors"
import db from "./database/db.js"
<<<<<<< HEAD
import destinoRoutes from "./routes/destinoRoutes.js"
import entradasRoutes from "./routes/entradasRoutes.js"
import insumosProveedorRoutes from "./routes/insumosProveedorRoutes.js"
import insumosRouters from "./routes/insumosRouters.js" 
import responsableRouters from "./routes/responsableRouters.js"
import proveedoresRouters from "./routes/proveedoresRouters.js"
import salidasRoute from "./routes/salidasRoute.js"
=======
import dotenv from 'dotenv'
import solicitudRoutes from './routes/SolicitudRoutes.js'
import estado_solicitudRoutes from './routes/Estados_solcitudRoutes.js'
import estadosRoutes from './routes/EstadosRoutes.js'
>>>>>>> 6172372 (Realice mis tablas Solicitud, Estados y Estados_Solicitud)



import entradasModel from "./models/entradasModel.js"
import insumosModel from "./models/insumosModel.js"
import proveedoresModel from "./models/proveedoresModel.js" 
import responsablesModel from "./models/responsablesModel.js"

dotenv.config();

const app = express()

app.use(express.json())
app.use(cors())

<<<<<<< HEAD
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
=======
<<<<<<< HEAD
>>>>>>> 6c29f31 (Realice mis tablas Solicitud, Estados y Estados_Solicitud)

app.use("/api/destino", destinoRoutes)
app.use("/api/entradas", entradasRoutes)
app.use("/api/insumosproveedor", insumosProveedorRoutes)
app.use("/api/insumos", insumosRouters)
app.use("/api/responsables", responsableRouters)
app.use("/api/proveedores", proveedoresRouters)
app.use("/api/salidas", salidasRoute)

// ============================================
// CONEXIÓN A BASE DE DATOS
// ============================================

try{
=======
app.use('/api/solicitudes', solicitudRoutes)
app.use('/api/estado_solicitud', estado_solicitudRoutes)
app.use('/api/Estados', estadosRoutes)
try {
>>>>>>> 6172372 (Realice mis tablas Solicitud, Estados y Estados_Solicitud)
    await db.authenticate()
<<<<<<< HEAD
    console.log("✅ Conexión a la base de datos exitosa")
}catch(error){
    console.error("❌ Error al conectar a la base de datos: ", error)
=======
    console.log("Conexion a la base de datos exitosa")
} catch (error) {
    console.error("Error al concetar a la base de datos: ", error)
>>>>>>> 6c29f31 (Realice mis tablas Solicitud, Estados y Estados_Solicitud)
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
<<<<<<< HEAD
    console.log(`🚀 Server running on http://localhost:${PORT}`);
=======
    console.log(`Server running on http://localhost:${PORT}`);
>>>>>>> 6c29f31 (Realice mis tablas Solicitud, Estados y Estados_Solicitud)
});
<<<<<<< HEAD

<<<<<<< HEAD
=======


=======
>>>>>>> 6172372 (Realice mis tablas Solicitud, Estados y Estados_Solicitud)
>>>>>>> 6c29f31 (Realice mis tablas Solicitud, Estados y Estados_Solicitud)
export default app