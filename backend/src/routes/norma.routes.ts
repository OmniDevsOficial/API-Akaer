import { Router, Request, Response, NextFunction } from "express";
import { createNorma, searchNormas, updateNorma, getNormaDocumento, getNormaByCode, getNormasRelacionadas, addNormaRelacionada, removeNormaRelacionada } from "../controllers/norma.controller";
import { upload } from "../middlewares/upload";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";

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

router.get("/listar", authMiddleware, searchNormas);
router.get("/:codigo/documento", authMiddleware, getNormaDocumento);
router.get("/:codigo", getNormaByCode);
router.get("/:codigo/relacionadas", authMiddleware, getNormasRelacionadas);
router.post("/create", authMiddleware, roleMiddleware(["ADMIN"]), handleUpload, createNorma);
router.post("/:codigo/relacionadas", authMiddleware, roleMiddleware(["ADMIN", "CHECKER"]), addNormaRelacionada);
router.put("/:codigo", authMiddleware, roleMiddleware(["ADMIN"]), handleUpload, updateNorma);
router.delete("/:codigo/relacionadas/:relacionadaCodigo", authMiddleware, roleMiddleware(["ADMIN", "CHECKER"]), removeNormaRelacionada);

export default router;