import express from "express";
import { getAllresponsables, getResponsables, createResponsable, updateResponsable, deleteResponsable } from "../controllers/responsableController.js";

const router = express.Router();

router.get("/", getAllresponsables);     
router.get("/:id", getResponsables);        
router.post("/", createResponsable);       
router.put("/:id", updateResponsable);      
router.delete("/:id", deleteResponsable);   

export default router;
