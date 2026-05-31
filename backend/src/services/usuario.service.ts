import { Role } from "@prisma/client";
import prisma from "../prisma/client";

type UsuarioGerenciado = {
  id: number;
  nome: string;
  email: string;
  role: Role;
  ativo: boolean;
  criado_em: Date;
};

const selecionarUsuario = {
  id: true,
  nome: true,
  email: true,
  role: true,
  ativo: true,
  criado_em: true,
} as const;

const mapearUsuario = (usuario: UsuarioGerenciado) => ({
  id: usuario.id,
  nome: usuario.nome,
  email: usuario.email,
  role: usuario.role,
  ativo: usuario.ativo,
  criado_em: usuario.criado_em,
});

export const atualizarUsuario = async (
  id: number,
  dados: { nome: string; role: Role }
) => {
  const usuario = await prisma.user.findUnique({
    where: { id },
    select: selecionarUsuario,
  });

  if (!usuario) {
    throw new Error("Usuário não encontrado");
  }

  const usuarioAtualizado = await prisma.user.update({
    where: { id },
    data: {
      nome: dados.nome,
      role: dados.role,
    },
    select: selecionarUsuario,
  });

  return mapearUsuario(usuarioAtualizado);
};

export const alternarStatusUsuario = async (id: number, usuarioLogadoId: number) => {
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
    data: {
      ativo: !usuario.ativo,
    },
    select: selecionarUsuario,
  });

  return mapearUsuario(usuarioAtualizado);
};
