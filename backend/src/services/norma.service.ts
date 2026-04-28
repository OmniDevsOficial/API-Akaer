import prisma from "../prisma/client";

export const createNormaService = async (data: any, filePath: string) => {
  const { titulo, numero, orgao, categoria, escopo, notas, palavrasChave } = data;

  if (!titulo || !numero || !orgao || !categoria) {
    throw new Error("Campos obrigatórios não preenchidos");
  }

  const norma = await prisma.norma.create({
    data: {
      titulo,
      numero,
      orgao,
      categoria,
      escopo: escopo ?? null,
      notas: notas ?? null,
      palavrasChave: palavrasChave ?? null,
      arquivo: filePath
    }
  });

  return norma;
};

export const getNormaByIdService = async (id: number) => {
  const norma = await prisma.norma.findUnique({
    where: { id },
    select: {
      id: true,
      titulo: true,
      numero: true,
      orgao: true,
      categoria: true,
      escopo: true,
      notas: true,
      palavrasChave: true,
      arquivo: true,
      status: true,
      createdAt: true
    }
  });

  if (!norma) {
    throw new Error("Norma não encontrada");
  }

  return {
    ...norma,
    notas: norma.notas ?? null,
    palavrasChave: norma.palavrasChave ?? null
  };
};