import express from "express";
import {
  getAllResponsables,
  getResponsableById,
  registerResponsable,
  loginResponsable,
  updateResponsable,
  deleteResponsable
} from "../controllers/responsableController.js";

const router = express.Router();

// ======================
// CRUD (REST CORRECTO)
// ======================
router.get("/", getAllResponsables);
router.get("/:id", getResponsableById);
router.post("/", registerResponsable); // 🔥 CAMBIO CLAVE
router.put("/:id", updateResponsable);
router.delete("/:id", deleteResponsable);

// ======================
// AUTENTICACIÓN
// ======================
router.post("/login", loginResponsable);

export default router;