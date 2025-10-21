import express from "express";
import { getAllPasantes, getPasante, createPasante, updatePasante, deletePasante } from "../controllers/pasantecontroler.js";

const router = express.Router();

router.get("/", getAllPasantes);     
router.get("/:id", getPasante);        
router.post("/", createPasante);       
router.put("/:id", updatePasante);      
router.delete("/:id", deletePasante);   

export default router;
