// routes/insumosRouters.js
import express from "express";
import { 
    getAllInsumos, 
    getInsumo, 
    createInsumo, 
    updateInsumo, 
    deletedInsumo,          // 🆕 Importar nueva función
    getInsumosConStock, 
    getInsumosConLotes      // 🆕 Importar nueva función
} from "../controllers/insumosController.js";

const router = express.Router(); 

// 🆕 Nuevas rutas (sin modificar las existentes)
router.get("/con-lotes", getInsumosConLotes);     // 🆕 Para ver lotes
router.get("/con-stock", getInsumosConStock);     // 🆕 Para ver stock

// Rutas existentes (no modificadas)
router.get("/", getAllInsumos);
router.get("/:id", getInsumo);
router.post("/", createInsumo);
router.put("/:id", updateInsumo);
router.delete("/:id", deletedInsumo);             // 🆕 Ruta DELETE

export default router;