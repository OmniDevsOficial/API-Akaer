import { Request, Response } from "express";
import { createNormaService, updateNormaService } from "../services/norma.service";
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