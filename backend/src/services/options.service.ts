import prisma from "../prisma/client";

export const getOrgaosEmissoresService = async () => {
  return await prisma.orgaoEmissor.findMany({
    orderBy: { nome: "asc" },
    select: { id: true, nome: true }
  });
};

export const getCategoriasService = async () => {
  return await prisma.categoria.findMany({
    orderBy: { nome: "asc" },
    select: { id: true, nome: true }
  });
};

export const getEtapasProjetoService = async () => {
  return await prisma.etapaProjeto.findMany({
    orderBy: { nome: "asc" },
    select: { id: true, nome: true }
  });
};

export const createOrgaoEmissorService = async (nome: string) => {
  const existing = await prisma.orgaoEmissor.findUnique({
    where: { nome }
  });
  if (existing) {
    throw new Error("Órgão emissor já existe");
  }

  return await prisma.orgaoEmissor.create({
    data: { nome }
  });
};

export const createCategoriaService = async (nome: string) => {
  const existing = await prisma.categoria.findUnique({
    where: { nome }
  });
  if (existing) {
    throw new Error("Categoria já existe");
  }

  return await prisma.categoria.create({
    data: { nome }
  });
};

export const createEtapaProjetoService = async (nome: string) => {
  const existing = await prisma.etapaProjeto.findUnique({
    where: { nome }
  });
  if (existing) {
    throw new Error("Etapa do projeto já existe");
  }

  return await prisma.etapaProjeto.create({
    data: { nome }
  });
};
