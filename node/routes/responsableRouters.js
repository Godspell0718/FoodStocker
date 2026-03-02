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
// CRUD
// ======================
router.get("/", getAllResponsables);
router.get("/:id", getResponsableById);
router.put("/:id", updateResponsable);
router.delete("/:id", deleteResponsable);

// ======================
// AUTENTICACIÓN
// ======================
router.post("/register", registerResponsable);
router.post("/login", loginResponsable);

export default router;
