import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { buscarSolicitacaoPorId, criarSolicitacao, listarSolicitacoes, atualizarStatusSolicitacao } from "../services/solicitacao.service";

type DadosSolicitacao = Record<string, Prisma.InputJsonValue>;
type TipoSolicitacao = "NOVA_NORMA" | "NOVA_NOTA" | "REPORTE_ERRO";
type SolicitacaoStatus = "Pendente" | "Reprovada" | "Aprovada" | "Concluida";

const TIPOS_SOLICITACAO: TipoSolicitacao[] = ["NOVA_NORMA", "NOVA_NOTA", "REPORTE_ERRO"];
const STATUS_SOLICITACAO: SolicitacaoStatus[] = ["Pendente", "Reprovada", "Aprovada", "Concluida"];
const ROLES_PERMITIDAS = ["ADMIN", "VISUALIZADOR", "CHECKER"];

const isTipoSolicitacao = (valor: unknown): valor is TipoSolicitacao =>
  typeof valor === "string" && TIPOS_SOLICITACAO.includes(valor as TipoSolicitacao);

const isDadosSolicitacao = (valor: unknown): valor is DadosSolicitacao =>
  typeof valor === "object" && valor !== null && !Array.isArray(valor);

const getTextoCampo = (valor: Prisma.InputJsonValue | undefined): string | null =>
  typeof valor === "string" && valor.trim() ? valor.trim() : null;

const normalizarDadosSolicitacao = (
  tipoSolicitacao: TipoSolicitacao,
  dados: DadosSolicitacao
): DadosSolicitacao => {
  const normaId =
    getTextoCampo(dados.norma_id) ??
    getTextoCampo(dados.normaId) ??
    getTextoCampo(dados.normaRelacionada);

  if (tipoSolicitacao === "NOVA_NOTA") {
    const descricao = getTextoCampo(dados.descricao) ?? getTextoCampo(dados.conteudoSugerido);

    return {
      ...dados,
      ...(normaId ? { norma_id: normaId } : {}),
      ...(descricao ? { descricao } : {}),
    };
  }

  if (tipoSolicitacao === "REPORTE_ERRO") {
    const descricao = getTextoCampo(dados.descricao) ?? getTextoCampo(dados.detalhesErro);

    return {
      ...dados,
      ...(normaId ? { norma_id: normaId } : {}),
      ...(descricao ? { descricao } : {}),
    };
  }

  return dados;
};

const parseDadosSolicitacao = (valor: unknown): DadosSolicitacao | null => {
  if (isDadosSolicitacao(valor)) {
    return valor;
  }

  if (typeof valor !== "string") {
    return null;
  }

  try {
    const parsed = JSON.parse(valor);
    return isDadosSolicitacao(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const adicionarArquivoSolicitacao = (
  tipoSolicitacao: TipoSolicitacao,
  dados: DadosSolicitacao,
  arquivo?: Express.Multer.File
): DadosSolicitacao => {
  if (tipoSolicitacao !== "NOVA_NORMA" || !arquivo) {
    return dados;
  }

  const dadosNorma = dados.dados_norma;

  if (typeof dadosNorma !== "object" || dadosNorma === null || Array.isArray(dadosNorma)) {
    return {
      ...dados,
      dados_norma: { arquivo: arquivo.path },
    };
  }

  return {
    ...dados,
    dados_norma: {
      ...(dadosNorma as Record<string, Prisma.InputJsonValue>),
      arquivo: arquivo.path,
    },
  };
};

export const createSolicitacaoController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tipo_solicitacao, dados } = req.body;
    const tipoSolicitacao = typeof tipo_solicitacao === "string" ? tipo_solicitacao : undefined;
    const dadosSolicitacao = parseDadosSolicitacao(dados);
    const usuarioId = (req as any).user?.id;

    if (!tipoSolicitacao || dados === undefined) {
      res.status(400).json({ error: "Campos solicitacao e dados são obrigatórios." });
      return;
    }

    if (!usuarioId) {
      res.status(401).json({ error: "Usuário não autenticado." });
      return;
    }

    if (!isTipoSolicitacao(tipoSolicitacao)) {
      res.status(400).json({ error: "Solicitacao inválida." });
      return;
    }

    if (!dadosSolicitacao) {
      res.status(400).json({ error: "Campo dados inválido." });
      return;
    }

    const dadosNormalizados = normalizarDadosSolicitacao(tipoSolicitacao, dadosSolicitacao);
    const dadosComArquivo = adicionarArquivoSolicitacao(tipoSolicitacao, dadosNormalizados, req.file);

    if (tipoSolicitacao === "NOVA_NORMA") {
      const { solicitante, referencia, utilidade } = dadosComArquivo;
      if (!solicitante || !referencia || !utilidade) {
        res.status(400).json({ error: "Para uma nova norma, os campos solicitante, referencia e utilidade são obrigatórios." });
        return;
      }
    } else if (tipoSolicitacao === "NOVA_NOTA" || tipoSolicitacao === "REPORTE_ERRO") {
      const { solicitante, norma_id, descricao } = dadosComArquivo;
      if (!solicitante || !norma_id || !descricao) {
        res.status(400).json({ error: "Para uma nova nota ou relato de erro, o ID da norma, nome do solicitante e a descrição/texto são obrigatórios e não podem ser vazios." });
        return;
      }
    }

    await criarSolicitacao(usuarioId, tipoSolicitacao, dadosComArquivo);

    res.status(201).json({ message: "Solicitação enviada com sucesso." });
  } catch (error) {
    console.error("Erro ao criar a solicitação:", error);
    res.status(500).json({ error: "Erro interno do servidor ao registrar a solicitação." });
  }
};

export const listSolicitacoesController = async (req: Request, res: Response): Promise<void> => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const tipo = typeof req.query.tipo === "string" ? req.query.tipo
      : typeof req.query.tipo_solicitacao === "string" ? req.query.tipo_solicitacao : undefined;
    const criador = typeof req.query.criador === "string" ? req.query.criador
      : typeof req.query.nome === "string" ? req.query.nome : undefined;
    const cargo = typeof req.query.cargo === "string" ? req.query.cargo
      : typeof req.query.role === "string" ? req.query.role : undefined;
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);

    const usuarioId = (req as any).user?.id;
    const role = (req as any).user?.role;

    if (!usuarioId || !role) {
      res.status(401).json({ error: "Usuário não autenticado." });
      return;
    }

    // ← validações antes da chamada ao service
    if (tipo && !TIPOS_SOLICITACAO.includes(tipo.toUpperCase() as TipoSolicitacao)) {
      res.status(400).json({ error: "Tipo de solicitação inválido." });
      return;
    }

    if (cargo && !ROLES_PERMITIDAS.includes(cargo.toUpperCase())) {
      res.status(400).json({ error: "Cargo inválido." });
      return;
    }

    if (!Number.isInteger(page) || page < 1) {
      res.status(400).json({ error: "Parâmetro page inválido." });
      return;
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      res.status(400).json({ error: "Parâmetro limit inválido." });
      return;
    }

    // ← uma única declaração, assinatura nova com role e usuarioId
    const solicitacoes = await listarSolicitacoes({ status, tipo, criador, cargo, page, limit, role, usuarioId });

    res.status(200).json(solicitacoes);
  } catch (error) {
    console.error("Erro ao listar as solicitações:", error);
    res.status(500).json({ error: "Erro interno do servidor ao listar as solicitações." });
  }
};

export const getSolicitacaoByIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: "Id inválido." });
      return;
    }

    const solicitacao = await buscarSolicitacaoPorId(id);

    if (!solicitacao) {
      res.status(404).json({ error: "Solicitação não encontrada." });
      return;
    }

    res.status(200).json(solicitacao);
  } catch (error) {
    console.error("Erro ao buscar a solicitação:", error);
    res.status(500).json({ error: "Erro interno do servidor ao buscar a solicitação." });
  }
};

// Atualizar status da solicitação
export const updateStatusSolicitacaoController = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: "Id inválido." });
      return;
    }

    if (!status || !STATUS_SOLICITACAO.includes(status as SolicitacaoStatus)) {
      res.status(400).json({ error: "Status inválido." });
      return;
    }

    const solicitacao = await buscarSolicitacaoPorId(id);

    if (!solicitacao) {
      res.status(404).json({ error: "Solicitação não encontrada." });
      return;
    }

    await atualizarStatusSolicitacao(id, status as SolicitacaoStatus);

    res.status(200).json({ message: "Status atualizado com sucesso." });
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    res.status(500).json({ error: "Erro interno do servidor ao atualizar o status." });
  }
};