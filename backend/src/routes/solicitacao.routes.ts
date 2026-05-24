import { Router } from "express";
import {
  createSolicitacaoController,
  getSolicitacaoByIdController,
  listSolicitacoesController
} from "../controllers/solicitacao.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";

const router = Router();
router.get("/", authMiddleware, roleMiddleware(["ADMIN", "CHECKER"]), listSolicitacoesController);
router.get("/:id", authMiddleware, roleMiddleware(["ADMIN", "CHECKER"]), getSolicitacaoByIdController);
router.post("/", authMiddleware, roleMiddleware(["VISUALIZADOR", "CHECKER"]), createSolicitacaoController);

export default router;
