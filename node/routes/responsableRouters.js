import express from "express";
import {
  getAllResponsables,
  getResponsableById,
  registerResponsable,
  loginResponsable,
  updateResponsable,
  deleteResponsable
} from "../controllers/responsableController.js";

import { optionalAuthMiddleware } from "../middleware/usersmiddleware.js";

const router = express.Router();

// ======================
// CRUD (REST CORRECTO)
// ======================
router.get("/", getAllResponsables);
router.get("/:id", getResponsableById);
router.post("/", registerResponsable);
router.put("/:id", optionalAuthMiddleware, updateResponsable);
router.delete("/:id", optionalAuthMiddleware, deleteResponsable);

// ======================
// AUTENTICACIÓN
// ======================
router.post("/login", loginResponsable);

export default router;