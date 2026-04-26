import { Request, Response } from "express";
import { createNormaService, getNormaByIdService } from "../services/norma.service";

export const createNorma = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Arquivo é obrigatório" });
    }

    const norma = await createNormaService(req.body, file.path);

    return res.status(201).json(norma);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const getNormaById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const norma = await getNormaByIdService(id);

    return res.status(200).json(norma);
  } catch (error: any) {
    if (error.message === "Norma não encontrada") {
      return res.status(404).json({ error: error.message });
    }

    return res.status(400).json({ error: error.message });
  }
};