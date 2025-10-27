import express from "express";
import { getAllAlmacen,getAlmacen,createAlmacen,updateAlmacen,deleteAlmacen } from "../controll/controll_almacen.js";

const router = express.Router(); 

router.get("/", getAllAlmacen);
router.get("/:id", getAlmacen);
router.post("/", createAlmacen);
router.put("/:id", updateAlmacen);
router.delete("/:id", deleteAlmacen);

export default router;
