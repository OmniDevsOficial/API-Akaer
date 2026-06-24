import prisma from "../prisma/client";
import { buildTree } from "../utils/tree";

const NIVEL_MAXIMO = 3;

const SELECT_FIELDS = {
  id: true, parent_id: true, nome: true, nivel: true, ordem: true,
} as const;

export const listarCategoriasService = async () => {
  const flat = await prisma.categoria.findMany({
    where: { ativo: true },
    select: SELECT_FIELDS,
    orderBy: [{ nivel: 'asc' }, { ordem: 'asc' }],
  });
  return buildTree(flat);
};

export const criarCategoriaService = async (nome: string, parent_id?: number) => {
  let nivel = 1;
  let ordem = 1;

  if (parent_id !== undefined && parent_id !== null) {
    const parent = await prisma.categoria.findUnique({
      where: { id: parent_id },
      select: { nivel: true },
    });
    if (!parent) throw new Error('Categoria pai não encontrada');

    if (parent.nivel >= NIVEL_MAXIMO) throw new Error(`Limite de ${NIVEL_MAXIMO} níveis atingido`);

    nivel = parent.nivel + 1;

    const lastSibling = await prisma.categoria.findFirst({
      where: { parent_id },
      orderBy: { ordem: 'desc' },
      select: { ordem: true },
    });
    ordem = (lastSibling?.ordem ?? 0) + 1;
  } else {
    const lastRoot = await prisma.categoria.findFirst({
      where: { parent_id: null },
      orderBy: { ordem: 'desc' },
      select: { ordem: true },
    });
    ordem = (lastRoot?.ordem ?? 0) + 1;
  }

  return await prisma.categoria.create({
    data: { nome, parent_id: parent_id ?? null, nivel, ordem },
    select: SELECT_FIELDS,
  });
};

export const renomearCategoriaService = async (id: number, nome: string) => {
  return await prisma.categoria.update({
    where: { id },
    data: { nome },
    select: SELECT_FIELDS,
  });
};
