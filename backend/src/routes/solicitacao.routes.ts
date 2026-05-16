import { Router } from "express";
import { createSolicitacaoController } from "../controllers/solicitacao.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";

const router = Router();
// Ver se vai mudar o "CHECKER" para "TECNICO" ou se vai adicionar uma role nova
router.post("/", authMiddleware, roleMiddleware(["VISUALIZADOR", "CHECKER"]), createSolicitacaoController);

export default router;
