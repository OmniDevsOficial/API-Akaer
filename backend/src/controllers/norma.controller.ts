import { Request, Response } from "express";
import { createNormaService, searchNormasService, updateNormaService, getNormaDocumentoService, getNormaByCodeService, createNormaRevisaoService } from "../services/norma.service";
import { getNormasRelacionadasIdsService, addNormaRelacionadaService, removeNormaRelacionadaService } from "../services/norma-relacionada.service";
import fs from "fs";

export const createNorma = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const arquivoExistente = typeof req.body.arquivo_existente === "string"
      ? req.body.arquivo_existente.trim()
      : "";

    const filePath = file?.path || (arquivoExistente || undefined);

    if (!filePath) {
      return res.status(400).json({ error: "Arquivo é obrigatório" });
    }

    const criador_id = (req as any).user?.id;
    const norma = await createNormaService({ ...req.body, criador_id }, filePath);

    return res.status(201).json(norma);
  } catch (error: any) {
    const message = error?.message ?? "Erro ao cadastrar norma";
    const isDuplicateCodigo = message.includes("Já existe uma norma cadastrada com este código");

    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(isDuplicateCodigo ? 409 : 400).json({ error: message });
  }
};

export const updateNorma = async (req: Request, res: Response) => {
  try {
    const codigoParam = req.params.codigo;

    if (typeof codigoParam !== "string") {
      return res.status(400).json({ error: "Código da norma inválido" });
    }

    const file = req.file;

    const norma = await updateNormaService(codigoParam, req.body, file?.path);

    return res.status(200).json(norma);
  } catch (error: any) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (error.message === "Norma não encontrada") {
      return res.status(404).json({ error: error.message });
    }

    return res.status(400).json({ error: error.message });
  }
};

// Converte um query param (string | string[] | undefined) em number[]
const parseNumericArray = (value: unknown): number[] => {
  if (!value) return [];
  const arr = Array.isArray(value) ? value : [value];
  return arr
    .map((v) => Number(v))
    .filter((n) => !isNaN(n) && n > 0);
};

// Converte um query param em string[]
const parseStringArray = (value: unknown): string[] => {
  if (!value) return [];
  const arr = Array.isArray(value) ? value : [value];
  return arr.map((v) => String(v).trim()).filter(Boolean);
};

export const searchNormas = async (req: Request, res: Response) => {
  try {
    const textoQuery = req.query.texto;
    const pageQuery  = req.query.page;

    const texto = typeof textoQuery === "string" ? textoQuery : "";

    const paginaRecebida = typeof pageQuery === "string" ? Number(pageQuery) : 1;
    const pagina = Number.isInteger(paginaRecebida) && paginaRecebida > 0 ? paginaRecebida : 1;

    const orgaos     = parseNumericArray(req.query.orgao);
    const categorias = parseNumericArray(req.query.categoria);
    const etapas     = parseNumericArray(req.query.etapa);
    const status     = parseStringArray(req.query.status);

    const normas = await searchNormasService(texto, pagina, orgaos, categorias, etapas, status);

    return res.status(200).json(normas);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const getNormaDocumento = async (req: Request, res: Response) => {
  try {
    const { codigo } = req.params;

    if (!codigo || typeof codigo !== "string") {
      return res.status(400).json({ error: "Código da norma inválido" });
    }

    const { filePath, fileName } = await getNormaDocumentoService(codigo);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(fileName)}"`);

    return res.sendFile(filePath);
  } catch (error: any) {
    if (
      error.message === "Norma não encontrada" ||
      error.message === "Documento não encontrado"
    ) {
      return res.status(404).json({ error: error.message });
    } else if (error.message === "Arquivo inválido") {
      return res.status(403).json({ error: error.message });
    }

    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};

export const getNormaByCode = async (req: Request, res: Response) => {
  try {
    const { codigo } = req.params;

    if (!codigo || typeof codigo !== "string") {
      return res.status(400).json({ error: "Código inválido" });
    }

    const norma = await getNormaByCodeService(codigo);

    return res.status(200).json(norma);
  } catch (error: any) {
    if (error.message === "Norma não encontrada") {
      return res.status(404).json({ error: error.message });
    }

    return res.status(400).json({ error: error.message });
  }
};

export const getNormasRelacionadas = async (req: Request, res: Response) => {
  try {
    const { codigo } = req.params;

    if (!codigo || typeof codigo !== "string") {
      return res.status(400).json({ error: "Código da norma inválido" });
    }

    const normasRelacionadas = await getNormasRelacionadasIdsService(codigo);

    return res.status(200).json(normasRelacionadas);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const addNormaRelacionada = async (req: Request, res: Response) => {
  try {
    const { codigo } = req.params;
    const { relacionadaCodigo } = req.body;

    if (!codigo || typeof codigo !== "string") {
      return res.status(400).json({ error: "Código da norma origem inválido" });
    }

    if (!relacionadaCodigo || typeof relacionadaCodigo !== "string") {
      return res.status(400).json({ error: "Código da norma relacionada inválido" });
    }

    const relacionadas = await addNormaRelacionadaService(codigo, relacionadaCodigo);

    return res.status(201).json(relacionadas);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const removeNormaRelacionada = async (req: Request, res: Response) => {
  try {
    const { codigo, relacionadaCodigo } = req.params;

    if (!codigo || typeof codigo !== "string") {
      return res.status(400).json({ error: "Código da norma origem inválido" });
    }

    if (!relacionadaCodigo || typeof relacionadaCodigo !== "string") {
      return res.status(400).json({ error: "Código da norma relacionada inválido" });
    }

    const relacionadas = await removeNormaRelacionadaService(codigo, relacionadaCodigo);

    return res.status(200).json(relacionadas);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const createNormaRevisao = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Arquivo PDF é obrigatório para nova revisão" });
    }

    const codigoParam = req.params.codigo;
    if (typeof codigoParam !== "string") {
      return res.status(400).json({ error: "Código da norma inválido" });
    }

    const criador_id = (req as any).user?.id;
    const novaNorma = await createNormaRevisaoService(codigoParam, { ...req.body, criador_id }, file.path);

    return res.status(201).json(novaNorma);
  } catch (error: any) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    const status = error?.message?.includes("O PDF enviado é idêntico") ? 409 : 400;
    return res.status(status).json({ error: error.message });
  }
};