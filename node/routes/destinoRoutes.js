import express from "express"
import { getAllDestinos, getDestino, createDestino, updateDestino, deleteDestino } from "../controllers/destinoController.js";

const router = express.Router()

router.get("/", getAllDestinos);
router.get("/:id", getDestino);
router.post("/", createDestino);
router.put("/:id", updateDestino);
router.delete("/:id", deleteDestino);

export default router;