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

// dados mocados para teste de visualização de normas obsoletas.
router.get("/:codigo/revisoes", authMiddleware, (req: Request, res: Response) => {
  const { codigo } = req.params;

  const revisoesMock = [
    {
      id: 901,
      codigo: `${codigo}-REV-A`,
      titulo: `${codigo} — Revisão A (Obsoleta)`,
      revisao: "A",
      status: "Obsoleta",
      arquivo: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      categoria: { nome: "Qualidade" },
      data_publicacao: "2021-03-15",
    },
    {
      id: 902,
      codigo: `${codigo}-REV-B`,
      titulo: `${codigo} — Revisão B (Obsoleta)`,
      revisao: "B",
      status: "Obsoleta",
      arquivo: null,
      categoria: { nome: "Qualidade" },
      data_publicacao: "2022-07-20",
    },
    {
      id: 903,
      codigo: `${codigo}-REV-C`,
      titulo: `${codigo} — Revisão C (Obsoleta)`,
      revisao: "C",
      status: "Obsoleta",
      arquivo: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      categoria: { nome: "Manutenção" },
      data_publicacao: "2023-11-01",
    },
  ];

  res.json(revisoesMock);
});

router.get("/listar", authMiddleware, searchNormas);
router.get("/:codigo/documento", authMiddleware, getNormaDocumento);
router.get("/:codigo", getNormaByCode);
router.get("/:codigo/relacionadas", authMiddleware, getNormasRelacionadas);
router.post("/create", authMiddleware, roleMiddleware(["ADMIN"]), handleUpload, createNorma);
router.post("/:codigo/relacionadas", authMiddleware, roleMiddleware(["ADMIN", "CHECKER"]), addNormaRelacionada);
router.put("/:codigo", authMiddleware, roleMiddleware(["ADMIN"]), handleUpload, updateNorma);
router.delete("/:codigo/relacionadas/:relacionadaCodigo", authMiddleware, roleMiddleware(["ADMIN", "CHECKER"]), removeNormaRelacionada);

export default router;