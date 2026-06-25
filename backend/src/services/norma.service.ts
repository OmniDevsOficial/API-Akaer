import prisma from "../prisma/client";
import { parseBrDate } from "../utils/validateDate";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import {
  createNormaNotasService,
  getNormaNotasService,
  parseNormaNotasInput,
  replaceNormaNotasService,
} from "./norma-nota.service";
import {
  getNormasRelacionadasIdsService,
  parseNormasRelacionadasInput,
  replaceNormasRelacionadasService,
} from "./norma-relacionada.service";

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

const resolveUploadPath = (filePath: string) => {
  const uploadsDir = path.resolve(__dirname, "../../uploads");
  const resolvedPath = path.resolve(filePath);

  if (!resolvedPath.startsWith(uploadsDir)) {
    throw new Error("Arquivo inválido");
  }

  if (!fs.existsSync(resolvedPath)) {
    throw new Error("Documento não encontrado");
  }

  return resolvedPath;
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
    normas_relacionadas_ids,
    criador_id,
  } = data;

  const codigoNormalizado = typeof codigo === "string" ? codigo.trim() : "";
  const revisaoNormalizada = typeof revisao === "string" ? revisao.trim() : "";

  if (!codigoNormalizado || !titulo || !orgao_emissor_id || !categoria_id || !data_publicacao || !revisaoNormalizada) {
    throw new Error("Campos obrigatórios não preenchidos: codigo, titulo, orgao_emissor_id, categoria_id, data_publicacao, revisao");
  }

  if (!criador_id) {
    throw new Error("Usuário criador não identificado.");
  }

  const sufixoRevisao = `-${revisaoNormalizada}`;
  const codigoBase = codigoNormalizado.endsWith(sufixoRevisao)
    ? codigoNormalizado.slice(0, -sufixoRevisao.length)
    : codigoNormalizado;

  // Garante que o código salvo sempre inclua o sufixo da revisão
  const codigoFinal = `${codigoBase}-${revisaoNormalizada}`;

  const codigoJaExiste = await prisma.norma.findUnique({
    where: { codigo: codigoFinal },
    select: { codigo: true }
  });

  if (codigoJaExiste) {
    throw new Error("Já existe uma norma cadastrada com este código");
  }

  const dataPublicacao = parseBrDate(String(data_publicacao), "data_publicacao");
  const notasNormalizadas = parseNormaNotasInput(notas);
  const palavrasChaveJson = parseJsonInput(palavras_chave, "palavras_chave");
  const normasRelacionadasIds = parseNormasRelacionadasInput(normas_relacionadas_ids);
  
  const arquivoPath = resolveUploadPath(filePath);

  const norma = await prisma.norma.create({
    data: {
      codigo: codigoFinal,
      codigo_base:     codigoBase,
      titulo,
      orgao_emissor_id: Number(orgao_emissor_id),
      categoria_id:     Number(categoria_id),
      etapa_projeto_id: etapa_projeto_id ? Number(etapa_projeto_id) : null,
      revisao:          revisaoNormalizada,
      is_vigente:       true,
      status,
      data_publicacao:  dataPublicacao,
      escopo: escopo ?? null,
      palavras_chave: palavrasChaveJson ?? [],
      arquivo:        arquivoPath,
      criador_id:     Number(criador_id),
    }
  });

  if (notasNormalizadas.length) {
    await createNormaNotasService(codigoFinal, notasNormalizadas);
  }

  if (normasRelacionadasIds.length) {
    await replaceNormasRelacionadasService(codigoFinal, normasRelacionadasIds);
  }

  return norma;
};

export const updateNormaService = async (codigo: string, data: any, newFilePath?: string) => {
  const existingNorma = await prisma.norma.findUnique({ where: { codigo } });

  if (!existingNorma) {
    throw new Error("Norma não encontrada");
  }

  if (existingNorma.status === "Obsoleta") {
    throw new Error("Normas obsoletas não podem ser editadas");
  }

  const hasNotas = Object.prototype.hasOwnProperty.call(data, "notas");
  const notasNormalizadas = hasNotas ? parseNormaNotasInput(data.notas) : [];
  const hasPalavrasChave = Object.prototype.hasOwnProperty.call(data, "palavras_chave");
  const palavrasChaveJson = hasPalavrasChave
    ? parseJsonInput(data.palavras_chave, "palavras_chave")
    : undefined;
  const hasNormasRelacionadasIds = Object.prototype.hasOwnProperty.call(data, "normas_relacionadas_ids");
  const normasRelacionadasIds = hasNormasRelacionadasIds
    ? parseNormasRelacionadasInput(data.normas_relacionadas_ids)
    : [];

  const updateData: Record<string, unknown> = {
    titulo:           data.titulo           ?? existingNorma.titulo,
    orgao_emissor_id: data.orgao_emissor_id ? Number(data.orgao_emissor_id) : existingNorma.orgao_emissor_id,
    categoria_id:     data.categoria_id     ? Number(data.categoria_id)     : existingNorma.categoria_id,
    etapa_projeto_id: data.etapa_projeto_id ? Number(data.etapa_projeto_id) : existingNorma.etapa_projeto_id,
    revisao:          data.revisao          ?? existingNorma.revisao,
    status:           data.status           ?? existingNorma.status,
    data_publicacao:  data.data_publicacao  ? parseBrDate(String(data.data_publicacao), "data_publicacao") : existingNorma.data_publicacao,
    arquivo:          newFilePath           ?? existingNorma.arquivo,
    escopo:           data.escopo           ?? existingNorma.escopo,
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

  if (hasNormasRelacionadasIds) {
    await replaceNormasRelacionadasService(codigo, normasRelacionadasIds);
  }

  if (newFilePath && existingNorma.arquivo && existingNorma.arquivo !== newFilePath) {
    if (fs.existsSync(existingNorma.arquivo)) {
      fs.unlinkSync(existingNorma.arquivo);
    }
  }

  const [notas, normasRelacionadasIdsAtualizadas] = await Promise.all([
    getNormaNotasService(codigo),
    getNormasRelacionadasIdsService(codigo),
  ]);

  return {
    ...updatedNorma,
    notas,
    normas_relacionadas_ids: normasRelacionadasIdsAtualizadas,
  };
};

const revisoesDaNorma = async (codigoBase: string, codigoVigente: string) => {
  const revisoes = await prisma.norma.findMany({
    where: {
      codigo_base: codigoBase,
      codigo: { not: codigoVigente },
    },
    orderBy: { revisao: "desc" },
    select: {
      id: true,
      codigo: true,
      codigo_base: true,
      titulo: true,
      revisao: true,
      status: true,
      arquivo: true,
      orgao_emissor: { select: { nome: true } },
      categoria: { select: { nome: true } },
      data_publicacao: true,
    },
  });

  return revisoes;
};

// ==========================================
// FUNÇÃO DE BUSCA AJUSTADA
// ==========================================
export const searchNormasService = async (
  texto: string,
  pagina: number,
  orgaos: number[]   = [],
  categorias: number[] = [],
  etapas: number[]   = [],
  status: string[]   = []
) => {
  const LIMITE_POR_PAGINA = 8;
  const termo = texto.trim().toLowerCase();

  const whereClause: any = {
    is_vigente: true,
  };

  if (orgaos.length > 0) whereClause.orgao_emissor_id = { in: orgaos };
  if (categorias.length > 0) whereClause.categoria_id = { in: categorias };
  if (etapas.length > 0) whereClause.etapa_projeto_id = { in: etapas };
  if (status.length > 0) whereClause.status = { in: status };

  const todasNormas = await prisma.norma.findMany({
    where: whereClause,
    orderBy: { titulo: "asc" },
    select: {
      id: true,
      codigo: true,
      codigo_base: true,
      titulo: true,
      status: true,
      revisao: true,
      data_publicacao: true,
      etapa_projeto_id: true,
      orgao_emissor: true,
      categoria: true,
      etapa_projeto: true,
      palavras_chave: true,
    },
  });

  const normasFiltradasPorTexto = termo ? todasNormas.filter(n => {
    const titulo = n.titulo.toLowerCase();
    const codigo = n.codigo.toLowerCase();
    const palavras = Array.isArray(n.palavras_chave) ? n.palavras_chave.join(' ').toLowerCase() : '';

    return titulo.includes(termo) || codigo.includes(termo) || palavras.includes(termo);
  }) : todasNormas;

  const total = normasFiltradasPorTexto.length;
  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE_POR_PAGINA));
  const skip = (pagina - 1) * LIMITE_POR_PAGINA;

  const normasPaginadas = normasFiltradasPorTexto.slice(skip, skip + LIMITE_POR_PAGINA);

  const itensComRevisoes = await Promise.all(
    normasPaginadas.map(async (norma) => {
      const revisoes = await revisoesDaNorma(norma.codigo_base, norma.codigo);
      return {
        ...norma,
        revisoes,
      };
    })
  );

  return {
    itens: itensComRevisoes,
    paginacao: {
      pagina,
      limite: LIMITE_POR_PAGINA,
      total,
      totalPaginas,
      temPaginaAnterior: pagina > 1,
      temProximaPagina: pagina < totalPaginas,
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

  const [notas, normasRelacionadasIds] = await Promise.all([
    getNormaNotasService(codigo),
    getNormasRelacionadasIdsService(codigo),
  ]);

  return {
    ...norma,
    notas,
    normas_relacionadas_ids: normasRelacionadasIds,
    palavras_chave: norma.palavras_chave ?? null,
  };
};

const getFileHash = (filePath: string) => {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash("sha256");
  hashSum.update(fileBuffer);
  return hashSum.digest("hex");
};

const getNextRevision = (currentRev: string | null): string => {
  if (!currentRev || !/^[A-Z]+$/.test(currentRev)) return "A";
  
  const nextCode = (s: string): string => {
    if (s === "") return "A";
    const last = s.slice(-1);
    if (last === "Z") return nextCode(s.slice(0, -1)) + "A";
    return s.slice(0, -1) + String.fromCharCode(last.charCodeAt(0) + 1);
  };
  
  return nextCode(currentRev);
};

export const createNormaRevisaoService = async (codigo: string, data: any, newFilePath?: string) => {
  if (!newFilePath) {
    throw new Error("Arquivo PDF é obrigatório para nova revisão");
  }

  const criador_id = data.criador_id;
  if (!criador_id) {
    throw new Error("Usuário criador não identificado.");
  }

  const existingNorma = await prisma.norma.findUnique({
    where: { codigo }
  });

  if (!existingNorma) {
    throw new Error("Norma não encontrada");
  }

  if (existingNorma.status === "Obsoleta") {
    throw new Error("A norma atual já está obsoleta");
  }

  const oldFilePath = path.resolve(existingNorma.arquivo);
  if (fs.existsSync(oldFilePath) && fs.existsSync(newFilePath)) {
    const oldHash = getFileHash(oldFilePath);
    const newHash = getFileHash(newFilePath);
    if (oldHash === newHash) {
      throw new Error("O PDF enviado é idêntico ao da revisão atual");
    }
  }

  const novaRevisao = getNextRevision(existingNorma.revisao);

  const novoCodigo = `${existingNorma.codigo_base}-${novaRevisao}`;

  const duplicateRevision = await prisma.norma.findFirst({
    where: { codigo_base: existingNorma.codigo_base, revisao: novaRevisao }
  });

  if (duplicateRevision) {
    throw new Error(`A revisão ${novaRevisao} já existe para esta norma`);
  }

  const [oldNotas, oldRelacionadas] = await Promise.all([
    getNormaNotasService(codigo),
    getNormasRelacionadasIdsService(codigo)
  ]);

  const [_, novaNorma] = await prisma.$transaction([
    prisma.norma.update({
      where: { id: existingNorma.id },
      data: { status: "Obsoleta", is_vigente: false }
    }),
    prisma.norma.create({
      data: {
        codigo: novoCodigo,
        codigo_base: existingNorma.codigo_base,
        titulo: existingNorma.titulo,
        orgao_emissor_id: existingNorma.orgao_emissor_id,
        categoria_id: existingNorma.categoria_id,
        etapa_projeto_id: existingNorma.etapa_projeto_id,
        escopo: existingNorma.escopo,
        palavras_chave: existingNorma.palavras_chave ? JSON.parse(JSON.stringify(existingNorma.palavras_chave)) : [],
        revisao: novaRevisao,
        is_vigente: true,
        status: "Ativa",
        data_publicacao: data.data_publicacao ? parseBrDate(String(data.data_publicacao), "data_publicacao") : existingNorma.data_publicacao,
        arquivo: newFilePath,
        criador_id: Number(criador_id),
      }
    })
  ]);

  if (oldNotas.length) {
    try {
      await createNormaNotasService(novaNorma.codigo, oldNotas);
    } catch (e) {}
  }

  if (oldRelacionadas.length) {
    try {
      await replaceNormasRelacionadasService(
        novaNorma.codigo, 
        oldRelacionadas.map(r => r.codigo)
      );
    } catch (e) {}
  }

  return novaNorma;
};