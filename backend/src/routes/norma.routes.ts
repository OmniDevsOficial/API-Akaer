import { Router, Request, Response, NextFunction } from "express";
import { createNorma, searchNormas, updateNorma, getNormaDocumento, getNormaByCode } from "../controllers/norma.controller";
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
router.post("/create", authMiddleware, roleMiddleware(["ADMIN"]), handleUpload, createNorma);
router.put("/:codigo", authMiddleware, roleMiddleware(["ADMIN"]), updateNorma);
router.get("/:codigo", getNormaByCode);

export default router;