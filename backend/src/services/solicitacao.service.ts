import { Prisma, Role, solicitacao_status, tipo_solicitacao } from "@prisma/client";
import prisma from "../prisma/client";

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

type SolicitacaoDetalhe = SolicitacaoListagem & {
  usuario_id: number;
  dados_propostos: Prisma.JsonValue | null;
};

type FiltrosListagemSolicitacao = {
  cargo?: string;
  criador?: string;
  limit: number;
  page: number;
  status?: string;
  tipo?: string;
};

type ResultadoPaginadoSolicitacoes = {
  data: SolicitacaoListagem[];
  pagination: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
};

const STATUS_SOLICITACAO: SolicitacaoStatus[] = ["Pendente", "Reprovada", "Aprovada", "Concluida"];
const TIPOS_SOLICITACAO: TipoSolicitacao[] = ["NOVA_NORMA", "NOVA_NOTA", "REPORTE_ERRO"];

export const criarSolicitacao = async (
  usuarioId: number,
  tipo_solicitacao: any,
  dados: any
) => {
  const norma_id = (tipo_solicitacao === "NOVA_NOTA" || tipo_solicitacao === "REPORTE_ERRO") ? dados.norma_id : null;

  await prisma.solicitacaoNorma.create({
    data: {
      tipo_solicitacao: tipo_solicitacao,
      dados_propostos: dados,
      usuario_id: usuarioId,
      status: "Pendente",
      norma_id: norma_id,
    }
  });
};

const normalizarStatus = (status?: string): solicitacao_status | undefined => {
  const filtroStatus = status?.trim();
  return filtroStatus
    ? (STATUS_SOLICITACAO.find((value) => value === filtroStatus) as solicitacao_status | undefined)
    : undefined;
};

const normalizarTipo = (tipo?: string): tipo_solicitacao | undefined => {
  const filtroTipo = tipo?.trim().toUpperCase();
  return filtroTipo
    ? (TIPOS_SOLICITACAO.find((value) => value === filtroTipo) as tipo_solicitacao | undefined)
    : undefined;
};

const normalizarCargo = (cargo?: string): Role | undefined => {
  const filtroCargo = cargo?.trim().toUpperCase();
  return filtroCargo
    ? (Object.values(Role).find((value) => value === filtroCargo) as Role | undefined)
    : undefined;
};

const mapSolicitacaoListagem = (solicitacao: {
  id: number;
  status: solicitacao_status;
  tipo_solicitacao: tipo_solicitacao;
  norma_id: string | null;
  data_criacao: Date;
  usuario: {
    nome: string;
    role: Role;
  };
}): SolicitacaoListagem => ({
  id: solicitacao.id,
  nome: solicitacao.usuario.nome,
  cargo: solicitacao.usuario.role,
  role: solicitacao.usuario.role,
  status: solicitacao.status as SolicitacaoStatus,
  tipo_solicitacao: solicitacao.tipo_solicitacao as TipoSolicitacao,
  norma_id: solicitacao.norma_id,
  data_criacao: solicitacao.data_criacao
});

export const listarSolicitacoes = async (
  filtros: FiltrosListagemSolicitacao
): Promise<ResultadoPaginadoSolicitacoes> => {
  const status = normalizarStatus(filtros.status);
  const tipo = normalizarTipo(filtros.tipo);
  const cargo = normalizarCargo(filtros.cargo);
  const criador = filtros.criador?.trim();

  const where: Prisma.SolicitacaoNormaWhereInput = {
    ...(status ? { status } : {}),
    ...(tipo ? { tipo_solicitacao: tipo } : {}),
    usuario: {
      ...(cargo ? { role: cargo } : {}),
      ...(criador ? { nome: { contains: criador } } : {})
    }
  };

  const [total, solicitacoes] = await Promise.all([
    prisma.solicitacaoNorma.count({ where }),
    prisma.solicitacaoNorma.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (filtros.page - 1) * filtros.limit,
      take: filtros.limit,
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
    })
  ]);

  return {
    data: solicitacoes.map(mapSolicitacaoListagem),
    pagination: {
      limit: filtros.limit,
      page: filtros.page,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / filtros.limit)
    }
  };
};

export const buscarSolicitacaoPorId = async (id: number): Promise<SolicitacaoDetalhe | null> => {
  const solicitacao = await prisma.solicitacaoNorma.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      tipo_solicitacao: true,
      norma_id: true,
      dados_propostos: true,
      data_criacao: true,
      usuario_id: true,
      usuario: {
        select: {
          nome: true,
          role: true
        }
      }
    }
  });

  if (!solicitacao) {
    return null;
  }

  return {
    ...mapSolicitacaoListagem(solicitacao),
    usuario_id: solicitacao.usuario_id,
    dados_propostos: solicitacao.dados_propostos
  };
};
