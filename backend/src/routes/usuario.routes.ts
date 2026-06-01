import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";
import {
  listarUsuariosController,
  alternarStatusUsuarioController,
  atualizarUsuarioController,
  criarUsuarioController,
  buscarPerfilController
} from "../controllers/usuario.controller";

const usuarioRoutes = Router();

// Listagem de usuários
usuarioRoutes.get(
  "/", 
  authMiddleware, 
  roleMiddleware(["ADMIN"]), 
  listarUsuariosController as any
);

// Buscar perfil do usuário
usuarioRoutes.get(
  "/:id", 
  authMiddleware, 
  buscarPerfilController as any
);

// Criar usuário
usuarioRoutes.post(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  criarUsuarioController as any
);

// Edição de usuário
usuarioRoutes.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  atualizarUsuarioController as any
);

// Alternância de status (Ativar/Desativar)
usuarioRoutes.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  alternarStatusUsuarioController as any
);

export default usuarioRoutes;