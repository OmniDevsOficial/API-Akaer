import { Prisma, Role } from "@prisma/client";
import prisma from "../prisma/client";

type DadosSolicitacao = Record<string, Prisma.InputJsonValue>;
type TipoSolicitacao = "NOVA_NORMA" | "NOVA_NOTA" | "REPORTE_ERRO";
type SolicitacaoStatus = "Pendente" | "Reprovada" | "Aprovada" | "Concluida";

type SolicitacaoListagem = {
  id: number;
  nome: string;
  cargo: Role;
  role: Role;
  status: SolicitacaoStatus;
  tipo_solicitacao: TipoSolicitacao;
  norma_id: string | null;
  data_criacao: Date;
};

const STATUS_SOLICITACAO: SolicitacaoStatus[] = ["Pendente", "Reprovada", "Aprovada", "Concluida"];

export const criarSolicitacao = async (
  usuarioId: number,
  tipoSolicitacao: TipoSolicitacao,
  dados: DadosSolicitacao
) => {
  const normaId =
    typeof dados.norma_id === "string" && dados.norma_id.trim()
      ? dados.norma_id.trim()
      : null;

  return prisma.solicitacaoNorma.create({
    data: {
      tipo_solicitacao: tipoSolicitacao as any,
      norma_id: normaId,
      dados_propostos: dados,
      usuario_id: usuarioId,
      status: "Pendente" as any
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
    cargo: solicitacao.usuario.role,
    role: solicitacao.usuario.role,
    status: solicitacao.status as SolicitacaoStatus,
    tipo_solicitacao: solicitacao.tipo_solicitacao as TipoSolicitacao,
    norma_id: solicitacao.norma_id,
    data_criacao: solicitacao.data_criacao
  }));
};
