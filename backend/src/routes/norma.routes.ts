import { Router } from "express";
import { createNorma, getNormaById } from "../controllers/norma.controller";
import { upload } from "../middlewares/upload";

const router = Router();

router.post("/", upload.single("file"), createNorma);
router.get("/:id", getNormaById);

export default router;