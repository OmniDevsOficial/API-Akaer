import { Request, Response } from "express";
import {
  listarCategoriasService,
  criarCategoriaService,
  renomearCategoriaService
} from "../services/categoria.service";

export const getCategorias = async (req: Request, res: Response) => {
  try {
    const arvore = await listarCategoriasService();
    res.json(arvore);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createCategoria = async (req: Request, res: Response) => {
  try {
    const { nome, parent_id } = req.body;
    if (!nome) {
      return res.status(400).json({ error: "Nome da categoria é obrigatório" });
    }
    const categoria = await criarCategoriaService(nome.trim(), parent_id);
    res.status(201).json(categoria);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateCategoria = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { nome } = req.body;
    if (!nome) {
      return res.status(400).json({ error: "Nome da categoria é obrigatório" });
    }
    const categoria = await renomearCategoriaService(id, nome.trim());
    res.json(categoria);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
