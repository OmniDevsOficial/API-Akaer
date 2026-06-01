import { Role } from "@prisma/client";
import prisma from "../prisma/client";
import bcrypt from "bcrypt";

type UsuarioGerenciado = {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  telefone: string | null;
  role: Role;
  ativo: boolean;
  criado_em: Date;
};

const selecionarUsuario = {
  id: true, nome: true, email: true,
  cargo: true, telefone: true,
  role: true, ativo: true, criado_em: true,
} as const;

const mapearUsuario = (usuario: UsuarioGerenciado) => ({
  id: usuario.id,
  nome: usuario.nome,
  email: usuario.email,
  cargo: usuario.cargo,
  telefone: usuario.telefone,
  role: usuario.role,
  ativo: usuario.ativo,
  criado_em: usuario.criado_em,
});

export const listarUsuarios = async () => {
  const usuarios = await prisma.user.findMany({
    select: selecionarUsuario,
    orderBy: { criado_em: "desc" },
  });
  return usuarios.map(mapearUsuario);
};

export const buscarUsuarioPorId = async (id: number) => {
  const usuario = await prisma.user.findUnique({
    where: { id },
    select: selecionarUsuario,
  });
  if (!usuario) throw new Error("Usuário não encontrado");
  return mapearUsuario(usuario);
};

export const criarUsuario = async (dados: {
  nome: string,
  email: string,
  cargo: string,
  telefone: string,
  role: Role,
  senhaHash: string
}) => {
  const emailExistente = await prisma.user.findUnique({
    where: { email: dados.email },
  });

  if (emailExistente) {
    throw new Error("Email já cadastrado");
  }

  const senhaHash = await bcrypt.hash(dados.senhaHash, 10);

  const usuario = await prisma.user.create({
    data: {
      nome: dados.nome,
      email: dados.email,
      cargo: dados.cargo,
      telefone: dados.telefone ?? null,
      role: dados.role,
      password: senhaHash,
    },
    select: selecionarUsuario,
  });

  return mapearUsuario(usuario);
};

export const atualizarUsuario = async (
  id: number,
  dados: { nome: string; role: Role; cargo: string; telefone: string; senha?: string }
) => {
  const usuario = await prisma.user.findUnique({
    where: { id },
    select: selecionarUsuario,
  });

  if (!usuario) throw new Error("Usuário não encontrado");

  // Só faz hash e atualiza a senha se ela foi enviada
  const senhaAtualizada = dados.senha
    ? await bcrypt.hash(dados.senha, 10)
    : undefined;

  const usuarioAtualizado = await prisma.user.update({
    where: { id },
    data: {
      nome: dados.nome,
      role: dados.role,
      cargo: dados.cargo,
      telefone: dados.telefone,
      ...(senhaAtualizada && { password: senhaAtualizada }),
    },
    select: selecionarUsuario,
  });

  return mapearUsuario(usuarioAtualizado);
};

export const alternarStatusUsuario = async (
  id: number,
  usuarioLogadoId: number
) => {
  const usuario = await prisma.user.findUnique({
    where: { id },
    select: selecionarUsuario,
  });

  if (!usuario) {
    throw new Error("Usuário não encontrado");
  }

  if (id === usuarioLogadoId && usuario.ativo) {
    throw new Error("O administrador não pode desativar a própria conta");
  }

  const usuarioAtualizado = await prisma.user.update({
    where: { id },
    data: { ativo: !usuario.ativo },
    select: selecionarUsuario,
  });

  return mapearUsuario(usuarioAtualizado);
};