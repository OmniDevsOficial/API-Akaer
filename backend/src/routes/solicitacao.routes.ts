import { Router } from "express";
import { createSolicitacaoController } from "../controllers/solicitacao.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";

const router = Router();
router.post("/", authMiddleware, roleMiddleware(["VISUALIZADOR", "CHECKER"]), createSolicitacaoController);

export default router;
