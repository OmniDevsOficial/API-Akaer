import { Request, Response } from "express";
import { Role } from "@prisma/client";
import { atualizarUsuario, alternarStatusUsuario } from "../services/usuario.service";

const isRoleValida = (role: unknown): role is Role => {
  return typeof role === "string" && (Object.values(Role) as string[]).includes(role);
};

export const atualizarUsuarioController = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { nome, role } = req.body;

    if (!Number.isInteger(id)) {
      res.status(400).json({ error: "ID inválido." });
      return;
    }

    if (typeof nome !== "string" || !nome.trim()) {
      res.status(400).json({ error: "Nome é obrigatório." });
      return;
    }

    if (!isRoleValida(role)) {
      res.status(400).json({ error: "Role inválida." });
      return;
    }

    const usuario = await atualizarUsuario(id, {
      nome: nome.trim(),
      role,
    });

    res.status(200).json({
      message: "Usuário atualizado com sucesso.",
      usuario,
    });
  } catch (error: any) {
    const status = error.message === "Usuário não encontrado" ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
};

export const alternarStatusUsuarioController = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const usuarioLogadoId = (req as any).user?.id;

    if (!Number.isInteger(id)) {
      res.status(400).json({ error: "ID inválido." });
      return;
    }

    if (!usuarioLogadoId) {
      res.status(401).json({ error: "Acesso negado." });
      return;
    }

    const usuario = await alternarStatusUsuario(id, usuarioLogadoId);

    res.status(200).json({
      message: usuario.ativo ? "Usuário reativado com sucesso." : "Usuário desativado com sucesso.",
      usuario,
    });
  } catch (error: any) {
    const status =
      error.message === "Usuário não encontrado"
        ? 404
        : error.message === "O administrador não pode desativar a própria conta"
          ? 400
          : 400;

    res.status(status).json({ error: error.message });
  }
};
