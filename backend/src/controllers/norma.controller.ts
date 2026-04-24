import { Request, Response } from "express";
import { createNormaService, searchNormasService, updateNormaService, getNormaDocumentoService } from "../services/norma.service";
import fs from "fs";

export const createNorma = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Arquivo é obrigatório" });
    }

    const norma = await createNormaService(req.body, file.path);

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

    const norma = await updateNormaService(codigoParam, req.body);

    return res.status(200).json(norma);
  } catch (error: any) {
    if (error.message === "Norma não encontrada") {
      return res.status(404).json({ error: error.message });
    }

    return res.status(400).json({ error: error.message });
  }
};

export const searchNormas = async (req: Request, res: Response) => {
  try {
    const textoQuery = req.query.texto;
    const pageQuery = req.query.page;
    const orgaoQuery = req.query.orgao;
    const categoriaQuery = req.query.categoria;
    const etapaQuery = req.query.etapa;

    const texto = typeof textoQuery === "string" ? textoQuery : "";
    const orgao = typeof orgaoQuery === "string" ? Number(orgaoQuery) : undefined;
    const categoria = typeof categoriaQuery === "string" ? Number(categoriaQuery) : undefined;
    const etapa = typeof etapaQuery === "string" ? Number(etapaQuery) : undefined;

    const paginaRecebida = typeof pageQuery === "string" ? Number(pageQuery) : 1;
    const pagina = Number.isInteger(paginaRecebida) && paginaRecebida > 0 ? paginaRecebida : 1;

    const normas = await searchNormasService(texto, pagina, orgao, categoria, etapa);

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