import { Request, Response } from "express";
import { criarSolicitacao } from "../services/solicitacao.service";

export const createSolicitacaoController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tipo_solicitacao, dados } = req.body;
    const usuarioId = (req as any).user?.id;

    if (!tipo_solicitacao || !dados) {
      res.status(400).json({ error: "Campos solicitacao e dados são obrigatórios." });
      return;
    }

    if (tipo_solicitacao === "NOVA_NORMA") {
      const { titulo, arquivo, orgao_emissor, categoria } = dados;
      if (!titulo || !arquivo || !orgao_emissor || !categoria) {
        res.status(400).json({ error: "Para uma nova norma, os campos titulo, arquivo, orgao emissor e categoria são obrigatórios." });
        return;
      }
    } else if (tipo_solicitacao === "NOVA_NOTA" || tipo_solicitacao === "REPORTE_ERRO") {
      const { norma_id, descricao } = dados;
      if (!norma_id || !descricao || String(descricao).trim() === "") {
        res.status(400).json({ error: "Para uma nova nota ou relato de erro, o ID da norma e a descrição/texto são obrigatórios e não podem ser vazios." });
        return;
      }
    } else {
      res.status(400).json({ error: "Solicitacao inválida." });
      return;
    }

    await criarSolicitacao(usuarioId, tipo_solicitacao, dados);

    res.status(201).json({ message: "Solicitação enviada com sucesso." });
  } catch (error) {
    console.error("Erro ao criar a solicitação:", error);
    res.status(500).json({ error: "Erro interno do servidor ao registrar a solicitação." });
  }
};
