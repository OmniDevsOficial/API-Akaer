import { Router } from "express";
import {
  getCategorias,
  createCategoria,
  updateCategoria
} from "../controllers/categoria.controller";

const router = Router();

router.get("/", getCategorias);
router.post("/", createCategoria);
router.patch("/:id", updateCategoria);

export default router;
