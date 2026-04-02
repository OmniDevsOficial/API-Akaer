import prisma from "../prisma/client";

export const createNormaService = async (data: any, filePath: string) => {
  const { titulo, numero, orgao, categoria } = data;

  if (!titulo || !numero || !orgao || !categoria) {
    throw new Error("Campos obrigatórios não preenchidos");
  }

  const norma = await prisma.norma.create({
    data: {
      titulo,
      numero,
      orgao,
      categoria,
      arquivo: filePath
    }
  });

  return norma;
};