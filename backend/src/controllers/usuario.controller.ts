import { Request, Response } from "express";
import { Role } from "@prisma/client";
import { atualizarUsuario, alternarStatusUsuario, criarUsuario, listarUsuarios, buscarUsuarioPorId } from "../services/usuario.service";

const isRoleValida = (role: unknown): role is Role => {
  return (
    typeof role === "string" &&
    (Object.values(Role) as string[]).includes(role)
  );
};

export const criarUsuarioController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, email, cargo, telefone, role, senha } = req.body;

    if (!nome || !email || !cargo || !role || !senha) {
      res.status(400).json({ error: "Campos obrigatórios: nome, email, cargo, role, senha." });
      return;
    }

    if (!isRoleValida(role)) {
      res.status(400).json({ error: "Role inválida." });
      return;
    }

    const usuario = await criarUsuario({
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      cargo: cargo.trim(),
      telefone: telefone ? telefone.trim() : "",
      role,
      senhaHash: senha,
    });

    res.status(201).json({
      message: "Usuário criado com sucesso.",
      usuario,
    });
  } catch (error: any) {
    const status = error.message === "Email já cadastrado" ? 409 : 400;
    res.status(status).json({ error: error.message });
  }
};

export const atualizarUsuarioController = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { nome, role, cargo, telefone, senha } = req.body;

    if (!Number.isInteger(id)) {
      res.status(400).json({ error: "ID inválido." });
      return;
    }

    if (typeof nome !== "string" || !nome.trim()) {
      res.status(400).json({ error: "Nome é obrigatório." });
      return;
    }

    if (typeof cargo !== "string" || !cargo.trim()) {
      res.status(400).json({ error: "Cargo é obrigatório." });
      return;
    }

    if (!isRoleValida(role)) {
      res.status(400).json({ error: "Role inválida." });
      return;
    }

    const usuario = await atualizarUsuario(id, {
      nome: nome.trim(),
      role,
      cargo: cargo.trim(),
      telefone: telefone?.trim() ?? "",
      senha: senha?.trim() || undefined,
    });

    res.status(200).json({ message: "Usuário atualizado com sucesso.", usuario });
  } catch (error: any) {
    const status = error.message === "Usuário não encontrado" ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
};

export const alternarStatusUsuarioController = async (
  req: Request,
  res: Response
): Promise<void> => {
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
      message: usuario.ativo
        ? "Usuário reativado com sucesso."
        : "Usuário desativado com sucesso.",
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

export const listarUsuariosController = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await listarUsuarios();
    res.json(users);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const buscarPerfilController = async (req: Request, res: Response): Promise<void> => {
  try {
    const targetId = parseInt(req.params.id as string, 10);

    if (isNaN(targetId)) {
      res.status(400).json({ error: "ID de usuário inválido." });
      return;
    }

    const userReq = (req as any).user;

    if (userReq.role !== "ADMIN" && userReq.id !== targetId) {
      res.status(403).json({ error: "Acesso negado." });
      return;
    }

    const user = await buscarUsuarioPorId(targetId);
    res.json(user);
  } catch (error: any) {
    if (error.message === "Usuário não encontrado") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
};