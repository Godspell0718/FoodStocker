import express from "express";
import { 
  getAllProveedores, getProveedor, createProveedor, updateProveedor, deleteProveedor 
} from "../controllers/proveedoresController.js";

const router = express.Router();

router.get("/", getAllProveedores);
router.get("/:id", getProveedor);
router.post("/", createProveedor);
router.put("/:id", updateProveedor);
router.delete("/:id", deleteProveedor);

export default router;
