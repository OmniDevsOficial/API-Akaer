import { Router } from "express";
import { createSolicitacaoController, listSolicitacoesController } from "../controllers/solicitacao.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";

const router = Router();
router.get("/", authMiddleware, roleMiddleware(["ADMIN", "CHECKER"]), listSolicitacoesController);
router.post("/", authMiddleware, roleMiddleware(["VISUALIZADOR", "CHECKER"]), createSolicitacaoController);

export default router;
