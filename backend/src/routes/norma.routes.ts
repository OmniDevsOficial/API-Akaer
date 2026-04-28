import { Router } from "express";
import { createNorma, searchNormas, updateNorma, getNormaDocumento, getNormaByCode } from "../controllers/norma.controller";
import { upload } from "../middlewares/upload";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";

const router = Router();

router.get("/listar", authMiddleware, searchNormas);
router.get("/:codigo/documento", authMiddleware, getNormaDocumento);
router.post("/create", authMiddleware, roleMiddleware(["ADMIN"]), upload.single("file"), createNorma);
router.put("/:codigo", authMiddleware, roleMiddleware(["ADMIN"]), updateNorma);
router.get("/:codigo", getNormaByCode);

export default router;