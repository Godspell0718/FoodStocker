import express from "express";
import { getAllAlmacen,getAlmacen,createAlmacen,updateAlmacen,deleteAlmacen } from "../controllers/almacenController.js";

const router = express.Router(); 

router.get("/", getAllAlmacen);
router.get("/:id", getAlmacen);
router.post("/", createAlmacen);
router.put("/:id", updateAlmacen);
router.delete("/:id", deleteAlmacen);

export default router;
