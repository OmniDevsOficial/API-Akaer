import { Router, Request, Response, NextFunction } from "express";
import {
	createSolicitacaoController,
	getSolicitacaoByIdController,
	listSolicitacoesController,
	updateStatusSolicitacaoController
} from "../controllers/solicitacao.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";
import { upload } from "../middlewares/upload";

const router = Router();

const handleUpload = (req: Request, res: Response, next: NextFunction) => {
	const uploadMiddleware = upload.single("file");

	uploadMiddleware(req, res, (err: any) => {
		if (err) {
			return res.status(400).json({ error: err.message });
		}
		next();
	});
};
router.get("/", authMiddleware, roleMiddleware(["ADMIN", "CHECKER", "VISUALIZADOR"]), listSolicitacoesController);
router.get("/:id", authMiddleware, roleMiddleware(["ADMIN", "CHECKER", "VISUALIZADOR"]), getSolicitacaoByIdController);
router.post("/", authMiddleware, roleMiddleware(["VISUALIZADOR", "CHECKER"]), handleUpload, createSolicitacaoController);
router.patch("/:id/status", authMiddleware, roleMiddleware(["ADMIN", "CHECKER"]), updateStatusSolicitacaoController);

export default router;