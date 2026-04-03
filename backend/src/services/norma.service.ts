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

export const updateNormaService = async (codigo: string, data: any) => {
  const existingNorma = await prisma.norma.findUnique({ where: { codigo } });

  if (!existingNorma) {
    throw new Error("Norma não encontrada");
  }

  const updatedNorma = await prisma.norma.update({
    where: { codigo },
    data: {
      titulo: data.titulo ?? existingNorma.titulo,
      orgao_emissor: data.orgao_emissor ?? existingNorma.orgao_emissor,
      categoria: data.categoria ?? existingNorma.categoria,
      etapa_projeto: data.etapa_projeto ?? existingNorma.etapa_projeto,
      revisao: data.revisao ?? existingNorma.revisao,
      status: data.status ?? existingNorma.status,
      data_publicacao: data.data_publicacao ? new Date(data.data_publicacao) : existingNorma.data_publicacao,
      arquivo: data.arquivo ?? existingNorma.arquivo,
    }
  });

  return updatedNorma;
};
