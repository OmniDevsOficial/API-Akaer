import prisma from "../prisma/client";
import { parseBrDate } from "../utils/validateDate";

export const createNormaService = async (data: any, filePath: string) => {
  const { codigo, titulo, orgao_emissor, categoria, etapa_projeto, revisao, status, data_publicacao } = data;

  if (!codigo || !titulo || !orgao_emissor || !categoria || !data_publicacao) {
    throw new Error("Campos obrigatórios não preenchidos: codigo, titulo, orgao_emissor, categoria, data_publicacao");
  }

  const codigoJaExiste = await prisma.norma.findUnique({
    where: { codigo },
    select: { codigo: true }
  });

  if (codigoJaExiste) {
    throw new Error("Já existe uma norma cadastrada com este código");
  }

  const dataPublicacao = parseBrDate(String(data_publicacao), "data_publicacao");

  const norma = await prisma.norma.create({
    data: {
      codigo,
      titulo,
      orgao_emissor,
      categoria,
      etapa_projeto: etapa_projeto || null,
      revisao: revisao || null,
      status,
      data_publicacao: dataPublicacao,
      arquivo: filePath,
    }
  });

  return norma;
};
