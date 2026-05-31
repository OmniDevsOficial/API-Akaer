import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";
import {
  alternarStatusUsuarioController,
  atualizarUsuarioController,
} from "../controllers/usuario.controller";

const usuarioRoutes = Router();

usuarioRoutes.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  atualizarUsuarioController as any
);

usuarioRoutes.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  alternarStatusUsuarioController as any
);

export default usuarioRoutes;
