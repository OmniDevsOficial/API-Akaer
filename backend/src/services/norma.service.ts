import prisma from "../prisma/client";
import { parseBrDate } from "../utils/validateDate";

export const createNormaService = async (data: any, filePath: string) => {
  const { codigo, titulo, orgao_emissor_id, categoria_id, etapa_projeto_id, revisao, status, data_publicacao } = data;

  if (!codigo || !titulo || !orgao_emissor_id || !categoria_id || !data_publicacao) {
    throw new Error("Campos obrigatórios não preenchidos: codigo, titulo, orgao_emissor_id, categoria_id, data_publicacao");
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
      orgao_emissor_id: Number(orgao_emissor_id),
      categoria_id:     Number(categoria_id),
      etapa_projeto_id: etapa_projeto_id ? Number(etapa_projeto_id) : null,
      revisao:          revisao || null,
      status,
      data_publicacao:  dataPublicacao,
      arquivo:          filePath,
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
      titulo:           data.titulo           ?? existingNorma.titulo,
      orgao_emissor_id: data.orgao_emissor_id ? Number(data.orgao_emissor_id) : existingNorma.orgao_emissor_id,
      categoria_id:     data.categoria_id     ? Number(data.categoria_id)     : existingNorma.categoria_id,
      etapa_projeto_id: data.etapa_projeto_id ? Number(data.etapa_projeto_id) : existingNorma.etapa_projeto_id,
      revisao:          data.revisao          ?? existingNorma.revisao,
      status:           data.status           ?? existingNorma.status,
      data_publicacao:  data.data_publicacao  ? new Date(data.data_publicacao) : existingNorma.data_publicacao,
      arquivo:          data.arquivo          ?? existingNorma.arquivo,
    }
  });

  return updatedNorma;
};

export const searchNormasService = async (texto: string, pagina: number) => {
  const LIMITE_POR_PAGINA = 8;
  const termo = texto.trim();

  const whereClause = termo
    ? {
        OR: [
          { codigo:        { contains: termo } },
          { titulo:        { contains: termo } },
          { orgao_emissor: { nome: { contains: termo } } },
          { categoria:     { nome: { contains: termo } } },
        ],
      }
    : {};

  const skip = (pagina - 1) * LIMITE_POR_PAGINA;

  const [total, normas] = await Promise.all([
    prisma.norma.count({ where: whereClause }),
    prisma.norma.findMany({
      where: whereClause,
      orderBy: { titulo: "asc" },
      skip,
      take: LIMITE_POR_PAGINA,
      include: {
        orgao_emissor: true,
        categoria:     true,
        etapa_projeto: true,
      },
    }),
  ]);

  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE_POR_PAGINA));

  return {
    itens: normas,
    paginacao: {
      pagina,
      limite:           LIMITE_POR_PAGINA,
      total,
      totalPaginas,
      temPaginaAnterior: pagina > 1,
      temProximaPagina:  pagina < totalPaginas,
    },
  };
};