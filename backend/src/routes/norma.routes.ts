import { Router } from "express";
import { createNorma } from "../controllers/norma.controller";
import { upload } from "../middlewares/upload";

const router = Router();

router.post("/", upload.single("file"), createNorma);

export default router;