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
      const { solicitante, referencia, utilidade } = dados;
      if (!solicitante || !referencia || !utilidade) {
        res.status(400).json({ error: "Para uma nova norma, os campos solicitante, referencia e utilidade são obrigatórios." });
        return;
      }
    } else if (tipo_solicitacao === "NOVA_NOTA" || tipo_solicitacao === "REPORTE_ERRO") {
      const { solicitante, norma_id, descricao } = dados;
      if (!solicitante || !norma_id || !descricao) {
        res.status(400).json({ error: "Para uma nova nota ou relato de erro, o ID da norma, nome do solicitante e a descrição/texto são obrigatórios e não podem ser vazios." });
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
