import express from "express"
import cors from "cors"
import db from "./database/db.js"
import pasantesrouters from "./routes/pasanteRouters.js"
import proveedoresRouters from "./routes/proveedoresRouters.js"
import entradasRoutes from "./routes/entradasRoutes.js"
import insumosProveedorRoutes from "./routes/insumosProveedorRoutes.js"
import dotenv from "dotenv"

dotenv.config();

const app = express()

app.use(express.json())
app.use(cors())

app.use("/api/pasantes", pasantesrouters)
app.use("/api/proveedores", proveedoresRouters)
app.use("/api/entradas", entradasRoutes)
app.use("/api/insumosproveedor", insumosProveedorRoutes)



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