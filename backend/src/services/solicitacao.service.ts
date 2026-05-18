import { Prisma } from "@prisma/client";
import prisma from "../prisma/client";

type SolicitacaoListagem = {
  id: number;
  nome: string;
  cargo: string | null;
  role: string;
  status: string;
};

export const criarSolicitacao = async (
  usuarioId: number,
  tipo_solicitacao: string,
  dados: any
) => {
  //temporário (esperando o BD (prisma as any)) para evitar erro de tipagem no TypeScript.
  const novaSolicitacao = await (prisma as any).solicitacao.create({
    data: {
      tipo: tipo_solicitacao,
      dados: dados,
      usuario_id: usuarioId,
      status: "Pendente"
    }
  });

  return novaSolicitacao;
};

export const listarSolicitacoes = async (status?: string): Promise<SolicitacaoListagem[]> => {
  const filtroStatus = status?.trim();
  const whereClause = filtroStatus
    ? Prisma.sql`WHERE s.status = ${filtroStatus}`
    : Prisma.empty;

  const solicitacoes = await prisma.$queryRaw<SolicitacaoListagem[]>(Prisma.sql`
    SELECT
      s.id,
      u.nome,
      NULL AS cargo,
      u.role,
      s.status
    FROM solicitacao s
    INNER JOIN users u ON u.id = s.usuario_id
    ${whereClause}
    ORDER BY s.id DESC
  `);

  return solicitacoes;
};
