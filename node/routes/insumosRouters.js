import express from "express";
import { getAllInsumos, getInsumo, createInsumo, updateInsumo, deletedInsumo, getInsumosConStock, getInsumosConLotes } from "../controllers/insumosController.js";


const router = express.Router(); 
router.get("/con-lotes", getInsumosConLotes);
router.get("/con-stock", getInsumosConStock);
router.get("/", getAllInsumos);
router.get("/:id", getInsumo);
router.post("/", createInsumo);
router.put("/:id", updateInsumo);
router.delete("/:id", deletedInsumo);

export default router;