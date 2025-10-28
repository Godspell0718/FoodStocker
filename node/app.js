import express from "express"
import cors from "cors"
import db from "./database/db.js"
import almacenRouters from "/routes/almacenRouters.js" 
import destinoRoutes from "/routes/destinoRoutes.js"
import entradasRoutes from "./routes/entradasRoutes.js"
import insumosProveedorRoutes from "./routes/insumosProveedorRoutes.js"
import insumosRouters from "/routes/insumosRouters.js" 
import loteRoutes from "/routes/loteRoutes.js"
import pasantesRouters from "./routes/pasanteRouters.js"
import proveedoresRouters from "./routes/proveedoresRouters.js"
import salidasRoute from "/routes/salidasRoute.js"

import dotenv from "dotenv"

dotenv.config();

const app = express()

app.use(express.json())
app.use(cors())

app.use("/api/almacen", almacenRouters)
app.use("/api/destino", destinoRoutes)
app.use("/api/entradas", entradasRoutes)
app.use("/api/insumosproveedor", insumosProveedorRoutes)
app.use("/api/insumos", insumosRouters)
app.use("/api/lote", loteRoutes)
app.use("/api/pasantes", pasantesRouters)
app.use("/api/proveedores", proveedoresRouters)
app.use("/api/salidas", salidasRoute)


try{
    await db.authenticate()
    console.log("Conexion a la base de datos exitosa")
}catch(error){
    console.error("Error al concetar a la base de datos: ", error)
    process.exit(1)
}
app.get("/", (_req, res) => {
    res.send("Hola Mundo de Andrey")
})


const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


export default app