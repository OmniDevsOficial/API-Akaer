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

export const listarSolicitacoes = async (status?: string): Promise<SolicitacaoListagem[]> => {
  const filtroStatus = status?.trim();
  const statusValido = filtroStatus
    ? STATUS_SOLICITACAO.find((value) => value === filtroStatus)
    : undefined;

  const solicitacoes = await prisma.solicitacaoNorma.findMany({
    where: statusValido ? { status: statusValido as any } : undefined,
    orderBy: { id: "desc" },
    select: {
      id: true,
      status: true,
      tipo_solicitacao: true,
      norma_id: true,
      data_criacao: true,
      usuario: {
        select: {
          nome: true,
          role: true
        }
      }
    }
  });

  return solicitacoes.map((solicitacao) => ({
    id: solicitacao.id,
    nome: solicitacao.usuario.nome,
    role: solicitacao.usuario.role,
    status: solicitacao.status as SolicitacaoStatus,
    tipo_solicitacao: solicitacao.tipo_solicitacao as TipoSolicitacao,
    norma_id: solicitacao.norma_id,
    data_criacao: solicitacao.data_criacao
  }));
};
