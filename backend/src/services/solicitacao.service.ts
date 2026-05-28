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
  motivo_rejeicao: string | null;
};

type FiltrosListagemSolicitacao = {
  cargo?: string;
  criador?: string;
  limit: number;
  page: number;
  status?: string;
  tipo?: string;
  role?: string;       // ← adicionado para filtro por permissão
  usuarioId?: number;  // ← adicionado para filtro por permissão
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

const normalizarStatus = (status?: string): solicitacao_status | undefined => {
  const filtroStatus = status?.trim();
  return filtroStatus
    ? (STATUS_SOLICITACAO.find((v) => v === filtroStatus) as solicitacao_status | undefined)
    : undefined;
};

const normalizarTipo = (tipo?: string): tipo_solicitacao | undefined => {
  const filtroTipo = tipo?.trim().toUpperCase();
  return filtroTipo
    ? (TIPOS_SOLICITACAO.find((v) => v === filtroTipo) as tipo_solicitacao | undefined)
    : undefined;
};

const normalizarCargo = (cargo?: string): Role | undefined => {
  const filtroCargo = cargo?.trim().toUpperCase();
  return filtroCargo
    ? (Object.values(Role).find((v) => v === filtroCargo) as Role | undefined)
    : undefined;
};

const mapSolicitacaoListagem = (solicitacao: {
  id: number;
  status: solicitacao_status;
  tipo_solicitacao: tipo_solicitacao;
  norma_id: string | null;
  data_criacao: Date;
  usuario: { nome: string; role: Role };
}): SolicitacaoListagem => ({
  id: solicitacao.id,
  nome: solicitacao.usuario.nome,
  cargo: solicitacao.usuario.role,
  role: solicitacao.usuario.role,
  status: solicitacao.status as SolicitacaoStatus,
  tipo_solicitacao: solicitacao.tipo_solicitacao as TipoSolicitacao,
  norma_id: solicitacao.norma_id,
  data_criacao: solicitacao.data_criacao,
});

export const criarSolicitacao = async (usuarioId: number, tipo_solicitacao: any, dados: any) => {
  const norma_id = (tipo_solicitacao === "NOVA_NOTA" || tipo_solicitacao === "REPORTE_ERRO") ? dados.norma_id : null;

  await prisma.solicitacaoNorma.create({
    data: {
      tipo_solicitacao,
      dados_propostos: dados,
      usuario_id: usuarioId,
      status: "Pendente",
      norma_id,
    },
  });
};

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
    ...(filtros.role === "VISUALIZADOR" && filtros.usuarioId ? { usuario_id: filtros.usuarioId } : {}),
    usuario: {
      ...(cargo ? { role: cargo } : {}),
      ...(criador ? { nome: { contains: criador } } : {}),
    },
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
        usuario: { select: { nome: true, role: true } },
      },
    }),
  ]);

  return {
    data: solicitacoes.map(mapSolicitacaoListagem),
    pagination: {
      limit: filtros.limit,
      page: filtros.page,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / filtros.limit),
    },
  };
};

export const buscarSolicitacaoPorId = async (id: number): Promise<SolicitacaoDetalhe | null> => {
  const solicitacao = await prisma.solicitacaoNorma.findUnique({
    where: { id },
    select: {
      id: true,
      usuario_id: true,
      status: true,
      tipo_solicitacao: true,
      norma_id: true,
      dados_propostos: true,
      motivo_rejeicao: true,
      data_criacao: true,
      usuario: { select: { nome: true, role: true } },
    },
  });

  if (!solicitacao) return null;

  return {
    ...mapSolicitacaoListagem(solicitacao),
    usuario_id: solicitacao.usuario_id,
    dados_propostos: solicitacao.dados_propostos,
    motivo_rejeicao: solicitacao.motivo_rejeicao,
  };
};

export const atualizarStatusSolicitacao = async (
  id: number,
  status: SolicitacaoStatus,
  motivoRejeicao?: string,
  comoResolveu?: string
): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    // Busca a solicitação para obter tipo e dados
    const solicitacao = await tx.solicitacaoNorma.findUniqueOrThrow({
      where: { id },
      select: {
        tipo_solicitacao: true,
        norma_id: true,
        dados_propostos: true,
      },
    });

    // Monta o objeto de atualização
    const updateData: Record<string, unknown> = {
      status,
      ...(motivoRejeicao !== undefined ? { motivo_rejeicao: motivoRejeicao } : {}),
    };

    // Se estiver concluindo, executa ações específicas por tipo
    if (status === "Concluida") {
      const dados = (solicitacao.dados_propostos ?? {}) as Record<string, unknown>;

      if (solicitacao.tipo_solicitacao === "NOVA_NOTA") {
        const normaCodigo = solicitacao.norma_id;
        const textoNota = typeof dados.descricao === "string" ? dados.descricao.trim() : "";

        if (normaCodigo && textoNota) {
          // Calcula próxima ordem
          const ultimaNota = await tx.normaNota.findFirst({
            where: { norma_codigo: normaCodigo },
            orderBy: { ordem: "desc" },
            select: { ordem: true },
          });
          const proximaOrdem = (ultimaNota?.ordem ?? -1) + 1;

          await tx.normaNota.create({
            data: {
              norma_codigo: normaCodigo,
              texto: textoNota,
              ordem: proximaOrdem,
            },
          });
        }
      }

      if (solicitacao.tipo_solicitacao === "REPORTE_ERRO" && comoResolveu) {
        updateData.dados_propostos = { ...dados, como_resolveu: comoResolveu };
      }
    }

    // Atualiza tudo em um único update
    await tx.solicitacaoNorma.update({
      where: { id },
      data: updateData,
    });
  });
};