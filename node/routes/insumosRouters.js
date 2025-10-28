import express from "express";
import { getAllInsumos,getInsumo,createInsumo,updateInsumo,deletedInsumo } from "../controllers/insumosController.js";

const router = express.Router(); 

router.get("/", getAllInsumos);
router.get("/:id", getInsumo);
router.post("/", createInsumo);
router.put("/:id", updateInsumo);
router.delete("/:id", deletedInsumo);

export default router;