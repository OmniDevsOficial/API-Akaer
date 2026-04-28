import prisma from "../prisma/client";
import { parseBrDate } from "../utils/validateDate";
import path from "path";
import fs from "fs";
import {
  createNormaNotasService,
  getNormaNotasService,
  parseNormaNotasInput,
  replaceNormaNotasService,
} from "./norma-nota.service";

const parseJsonInput = (input: unknown, fieldName: string): unknown => {
  if (input === undefined) return undefined;
  if (input === null || input === "") return null;

  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return null;
    try {
      return JSON.parse(trimmed);
    } catch {
      throw new Error(`${fieldName} deve ser um JSON valido`);
    }
  }

  if (["object", "number", "boolean"].includes(typeof input)) return input;

  throw new Error(`${fieldName} deve ser um JSON valido`);
};

export const createNormaService = async (data: any, filePath: string) => {
  const {
    codigo,
    titulo,
    orgao_emissor_id,
    categoria_id,
    etapa_projeto_id,
    revisao,
    status,
    data_publicacao,
    escopo,
    notas,
    palavras_chave,
  } = data;

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
  const notasNormalizadas = parseNormaNotasInput(notas);
  const palavrasChaveJson = parseJsonInput(palavras_chave, "palavras_chave");
  
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
      escopo: escopo ?? null,
      palavras_chave: palavrasChaveJson ?? null,
      arquivo:        filePath,
    }
  });

  if (notasNormalizadas.length) {
    await createNormaNotasService(codigo, notasNormalizadas);
  }

  return norma;
};

export const updateNormaService = async (codigo: string, data: any) => {
  const existingNorma = await prisma.norma.findUnique({ where: { codigo } });

  if (!existingNorma) {
    throw new Error("Norma não encontrada");
  }

  const hasNotas = Object.prototype.hasOwnProperty.call(data, "notas");
  const notasNormalizadas = hasNotas ? parseNormaNotasInput(data.notas) : [];
  const hasPalavrasChave = Object.prototype.hasOwnProperty.call(data, "palavras_chave");
  const palavrasChaveJson = hasPalavrasChave
    ? parseJsonInput(data.palavras_chave, "palavras_chave")
    : undefined;

  const updateData: Record<string, unknown> = {
    titulo:           data.titulo           ?? existingNorma.titulo,
    orgao_emissor_id: data.orgao_emissor_id ? Number(data.orgao_emissor_id) : existingNorma.orgao_emissor_id,
    categoria_id:     data.categoria_id     ? Number(data.categoria_id)     : existingNorma.categoria_id,
    etapa_projeto_id: data.etapa_projeto_id ? Number(data.etapa_projeto_id) : existingNorma.etapa_projeto_id,
    revisao:          data.revisao          ?? existingNorma.revisao,
    status:           data.status           ?? existingNorma.status,
    data_publicacao:  data.data_publicacao  ? new Date(data.data_publicacao) : existingNorma.data_publicacao,
    arquivo:          data.arquivo          ?? existingNorma.arquivo,
  };

  if (hasPalavrasChave) {
    updateData.palavras_chave = palavrasChaveJson ?? null;
  }

  const updatedNorma = await prisma.norma.update({
    where: { codigo },
    data: updateData,
  });

  if (hasNotas) {
    await replaceNormaNotasService(codigo, notasNormalizadas);
  }

  return updatedNorma;
};

export const searchNormasService = async (
  texto: string,
  pagina: number,
  orgao?: number,
  categoria?: number,
  etapa?: number
) => {
  const LIMITE_POR_PAGINA = 8;
  const termo = texto.trim();

  const whereClause: any = {};

  if (termo) {
    whereClause.OR = [
      { codigo: { contains: termo } },
      { titulo: { contains: termo } },
    ];
  }

  if (orgao) {
    whereClause.orgao_emissor_id = orgao;
  }

  if (categoria) {
    whereClause.categoria_id = categoria;
  }

  if (etapa) {
    whereClause.etapa_projeto_id = etapa;
  }

  const skip = (pagina - 1) * LIMITE_POR_PAGINA;

  const [total, normas] = await Promise.all([
    prisma.norma.count({ where: whereClause }),
    prisma.norma.findMany({
      where: whereClause,
      orderBy: { titulo: "asc" },
      skip,
      take: LIMITE_POR_PAGINA,
      select: {
        codigo: true,
        titulo: true,
        status: true,
        revisao: true,
        data_publicacao: true,
        etapa_projeto_id: true,
        orgao_emissor: true,
        categoria: true,
        etapa_projeto: true,
      },
    }),
  ]);

  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE_POR_PAGINA));

  return {
    itens: normas,
    paginacao: {
      pagina,
      limite:            LIMITE_POR_PAGINA,
      total,
      totalPaginas,
      temPaginaAnterior: pagina > 1,
      temProximaPagina:  pagina < totalPaginas,
    },
  };
};

export const getNormaDocumentoService = async (codigo: string) => {
  const norma = await prisma.norma.findUnique({
    where: { codigo },
    select: { arquivo: true }
  });

  if (!norma) {
    throw new Error("Norma não encontrada");
  }

  const uploadsDir = path.resolve(__dirname, "../../uploads");
  const arquivoPath = path.resolve(norma.arquivo);

  if (!arquivoPath.startsWith(uploadsDir)) {
    throw new Error("Arquivo inválido");
  }

  if (!fs.existsSync(arquivoPath)) {
    throw new Error("Documento não encontrado");
  }

  return {
    filePath: arquivoPath,
    fileName: path.basename(arquivoPath)
  };
};

export const getNormaByCodeService = async (codigo: string) => {
  const norma = await prisma.norma.findUnique({
    where: { codigo },
    select: {
      codigo: true,
      titulo: true,
      orgao_emissor_id: true,
      categoria_id: true,
      etapa_projeto_id: true,
      orgao_emissor: {
        select: { id: true, nome: true },
      },
      categoria: {
        select: { id: true, nome: true },
      },
      etapa_projeto: {
        select: { id: true, nome: true },
      },
      escopo: true,
      palavras_chave: true,
      arquivo: true,
      status: true,
      data_publicacao: true,
      revisao: true,
    }
  });

  if (!norma) {
    throw new Error("Norma não encontrada");
  }

  const notas = await getNormaNotasService(codigo);

  return {
    ...norma,
    notas,
    palavras_chave: norma.palavras_chave ?? null,
  };
};