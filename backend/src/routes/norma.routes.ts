import { Router } from "express";
import { createNorma, updateNorma } from "../controllers/norma.controller";
import { upload } from "../middlewares/upload";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";

const router = Router();

router.post("/", authMiddleware, roleMiddleware(["admin"]), upload.single("file"), createNorma);
router.put("/:codigo", authMiddleware, roleMiddleware(["admin"]), updateNorma);

export default router;