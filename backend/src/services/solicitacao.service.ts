import prisma from "../prisma/client";

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

  return novaSolicitacao;
};
