import prisma from "../prisma/client";

export const createNormaService = async (data: any, filePath: string) => {
  const { codigo, titulo, orgao_emissor, categoria, etapa_projeto, revisao, status, data_publicacao } = data;

  if (!codigo || !titulo || !orgao_emissor || !categoria || !data_publicacao) {
    throw new Error("Campos obrigatórios não preenchidos: codigo, titulo, orgao_emissor, categoria, data_publicacao");
  }

  const norma = await prisma.norma.create({
    data: {
      codigo,
      titulo,
      orgao_emissor,
      categoria,
      etapa_projeto: etapa_projeto || null,
      revisao: revisao || null,
      status: status || "Ativa",
      data_publicacao: new Date(data_publicacao),
      arquivo: filePath,
    }
  });

  return norma;
};
