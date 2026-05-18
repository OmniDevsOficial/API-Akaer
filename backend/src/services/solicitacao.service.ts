import prisma from "../prisma/client";

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
