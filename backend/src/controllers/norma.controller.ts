import { Request, Response } from "express";
import fs from "fs";
import { createNormaService } from "../services/norma.service";

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