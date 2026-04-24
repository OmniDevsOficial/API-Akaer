import { Request, Response } from "express";
import {getOrgaosEmissoresService, getCategoriasService, getEtapasProjetoService, createOrgaoEmissorService, createCategoriaService, createEtapaProjetoService} from "../services/options.service";

export const getOrgaosEmissores = async (req: Request, res: Response) => {
  try {
    const data = await getOrgaosEmissoresService();
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const getCategorias = async (req: Request, res: Response) => {
  try {
    const data = await getCategoriasService();
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const getEtapasProjeto = async (req: Request, res: Response) => {
  try {
    const data = await getEtapasProjetoService();
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const createOrgaoEmissor = async (req: Request, res: Response) => {
  try {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ error: "Nome é obrigatório" });
    const data = await createOrgaoEmissorService(nome);
    return res.status(201).json(data);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const createCategoria = async (req: Request, res: Response) => {
  try {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ error: "Nome é obrigatório" });
    const data = await createCategoriaService(nome);
    return res.status(201).json(data);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const createEtapaProjeto = async (req: Request, res: Response) => {
  try {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ error: "Nome é obrigatório" });
    const data = await createEtapaProjetoService(nome);
    return res.status(201).json(data);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};
