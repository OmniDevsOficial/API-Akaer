import { Router } from "express";
import { getOrgaosEmissores, getCategorias, getEtapasProjeto, createOrgaoEmissor, createCategoria, createEtapaProjeto } from "../controllers/options.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";

const router = Router();

router.get("/orgaos-emissores", authMiddleware, getOrgaosEmissores);
router.post("/orgaos-emissores", authMiddleware, roleMiddleware(["ADMIN"]), createOrgaoEmissor);

router.get("/categorias", authMiddleware, getCategorias);
router.post("/categorias", authMiddleware, roleMiddleware(["ADMIN"]), createCategoria);

router.get("/etapas-projeto", authMiddleware, getEtapasProjeto);
router.post("/etapas-projeto", authMiddleware, roleMiddleware(["ADMIN"]), createEtapaProjeto);

export default router;
