import api from "@/services/api";
import type { FiltrosSelecionados } from "@/components/FilterAside/FilterAside";

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

export interface Norma {
    id: number;
    codigo: string;
    titulo: string;
    arquivo?: string;
    revisao?: string | null;
    orgao_emissor?: { nome: string };
    orgao_emissor_id?: { nome: string };
    categoria?: { nome: string };
    categoria_id?: { nome: string };
    status: string;
}

export interface NormasLeituraResponse {
    itens?: Norma[];
    paginacao?: {
        total?: number;
    };
}

interface ListarNormasParams {
    page?: number;
    texto?: string;
    filtros?: FiltrosSelecionados;
}

// Serializa arrays como ?orgao=1&orgao=2 (sem colchetes)
// para que o Express leia como string[] em req.query
const serializarParams = (params: Record<string, unknown>): string => {
    return Object.entries(params)
        .flatMap(([key, value]) => {
            if (value === undefined || value === null) return [];
            if (Array.isArray(value)) {
                return value.map((v) => `${key}=${encodeURIComponent(v)}`);
            }
            return [`${key}=${encodeURIComponent(String(value))}`];
        })
        .join("&");
};

export async function listarNormas({
    page = 1,
    texto,
    filtros,
}: ListarNormasParams): Promise<NormasLeituraResponse> {
    const params: Record<string, unknown> = {
        page,
        texto: texto || undefined,
        orgao: filtros?.orgaos,
        categoria: filtros?.categorias,
        etapa: filtros?.etapas,
        status: filtros?.status,
    };

    const response = await api.get<NormasLeituraResponse>("/normas/listar", {
        params,
        paramsSerializer: serializarParams,
    });

    return response.data;
}