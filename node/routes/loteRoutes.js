import express from "express"
import { getAllLotes, getLote, createLote, updateLote, deleteLote } from "../controllers/loteController.js";

const router = express.Router()

router.get("/", getAllLotes);
router.get("/:id", getLote);
router.post("/", createLote);
router.put("/:id", updateLote);
router.delete("/:id", deleteLote);

export default router;