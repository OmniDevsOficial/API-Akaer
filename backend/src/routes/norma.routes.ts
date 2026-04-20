import { Router } from "express";
import { createNorma, searchNormas, updateNorma } from "../controllers/norma.controller";
import { upload } from "../middlewares/upload";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";

const router = Router();

//Rotas principais para normas
router.get("/listar", authMiddleware, searchNormas);
router.post("/create", authMiddleware, roleMiddleware(["ADMIN"]), upload.single("file"), createNorma);
router.put("/:codigo", authMiddleware, roleMiddleware(["ADMIN"]), updateNorma);

// Rotas para buscar 

export default router;