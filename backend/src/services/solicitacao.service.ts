import { Prisma, Role } from "@prisma/client";
import prisma from "../prisma/client";

type DadosSolicitacao = Record<string, Prisma.InputJsonValue>;
type TipoSolicitacao = "NOVA_NORMA" | "NOVA_NOTA" | "REPORTE_ERRO";
type SolicitacaoStatus = "Pendente" | "Reprovada" | "Aprovada" | "Concluida";

type SolicitacaoListagem = {
  id: number;
  nome: string;
  role: Role;
  status: SolicitacaoStatus;
  tipo_solicitacao: TipoSolicitacao;
  norma_id: string | null;
  data_criacao: Date;
};

const STATUS_SOLICITACAO: SolicitacaoStatus[] = ["Pendente", "Reprovada", "Aprovada", "Concluida"];

export const criarSolicitacao = async (
  usuarioId: number,
  tipo_solicitacao: any,
  dados: any
) => {
  const norma_id = (tipo_solicitacao === "NOVA_NOTA" || tipo_solicitacao === "REPORTE_ERRO") ? dados.norma_id : null;

  const novaSolicitacao = await prisma.solicitacaoNorma.create({
    data: {
      tipo_solicitacao: tipo_solicitacao,
      dados_propostos: dados,
      usuario_id: usuarioId,
      status: "Pendente",
      norma_id: norma_id,
    }
  });
};

export const listarSolicitacoes = async (
  status?: string,
  role?: string,
  usuarioId?: number
): Promise<SolicitacaoListagem[]> => {
  const filtroStatus = status?.trim();
  const statusValido = filtroStatus
    ? STATUS_SOLICITACAO.find((value) => value === filtroStatus)
    : undefined;

  const solicitacoes = await prisma.solicitacaoNorma.findMany({
    where: {
      ...(role === "VISUALIZADOR" && { usuario_id: usuarioId }),
      ...(statusValido && { status: statusValido as any }),
    },
    orderBy: { id: "desc" },
    select: {
      id: true,
      usuario_id: true,
      status: true,
      tipo_solicitacao: true,
      norma_id: true,
      data_criacao: true,
      usuario: {
        select: { nome: true, role: true }
      }
    }
  });

  return solicitacoes.map((s) => ({
    id: s.id,
    usuario_id: s.usuario_id,
    nome: s.usuario.nome,
    role: s.usuario.role,
    status: s.status as SolicitacaoStatus,
    tipo_solicitacao: s.tipo_solicitacao as TipoSolicitacao,
    norma_id: s.norma_id,
    data_criacao: s.data_criacao
  }));
};
