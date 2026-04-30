import api from "./api";

// retorna do GET /normas/:codigo
export interface NormaDetalhes {
  codigo: string;
  titulo: string;
  status: string;
  revisao: string | null;
  escopo: string | null;
  palavras_chave: string[] | null;
  orgao_emissor: { id: number; nome: string } | null;
  categoria: { id: number; nome: string } | null;
  etapa_projeto: { id: number; nome: string } | null;
  arquivo: string | null;
  data_publicacao: string;
  notas: { id: number; texto: string; ordem: number }[];
}

/**
 * Endpoint: GET /normas/:codigo
 */
export const getNormaDetalhes = async (codigo: string): Promise<NormaDetalhes> => {
  const response = await api.get<NormaDetalhes>(`/normas/${encodeURIComponent(codigo)}`);
  return response.data;
};