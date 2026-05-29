import { useEffect, useState } from "react";
import { FileText, Pencil, Eye, RefreshCw } from "lucide-react";
import { getUserRole } from '../utils/auth';
import { useNavigate } from "react-router-dom";
import { listarNormas, getNormaDetalhes } from "@/services/normaService";
import type { FiltrosSelecionados } from "@/components/FilterAside/FilterAside";
import PdfViewerModal from "./pdf-viewer-modal";
import UpdateVersionModal from "./update-version-modal";
// import api from "@/services/api";
// 1. Adicionar getNormaDetalhes ao import existente[cite: 2]

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

export interface NormaSelecionadaPdf {
    codigo?: string;
    titulo?: string;
    status?: string;
    orgaoEmissor?: string;
    categoria?: string;
    revisao?: string | null;
    arquivo?: string | null;
    escopo?: string;
    palavrasChave?: string[];
    normaRelacionada?: { codigo: string; titulo?: string | null }[];
}

export interface TabelaNormasProps {
    refreshTrigger?: number;
    searchText?: string;
    filtros?: FiltrosSelecionados;
}

const statusColorClass = (status: string) => {
    const normalizado = status.toLowerCase();
    return normalizado.includes('ativa') || normalizado.includes('ativo')
        ? 'bg-green-500'
        : 'bg-gray-400';
};


export default function TabelaNormas({ refreshTrigger = 0, searchText = '', filtros }: TabelaNormasProps) {

    const role = getUserRole();
    const isAdmin = role?.toLowerCase() === 'admin';
    const navigate = useNavigate();
    const [normas, setNormas] = useState<Norma[]>([]);
    const [totalNormas, setTotalNormas] = useState(0);
    const [carregando, setCarregando] = useState(true);
    const [pdfModalAberto, setPdfModalAberto] = useState(false);
    const [normaSelecionadaPdf, setNormaSelecionadaPdf] = useState<NormaSelecionadaPdf | null>(null);
    const [updateModalAberto, setUpdateModalAberto] = useState(false);
    const [normaSelecionadaUpdate, setNormaSelecionadaUpdate] = useState<Norma | null>(null);


    useEffect(() => {
        const carregarNormas = async () => {
            setCarregando(true);

            try {
                const data = await listarNormas({
                    page: 1,
                    texto: searchText.trim(),
                    filtros,
                });

                const itens = Array.isArray(data?.itens) ? data.itens : [];
                const total = data?.paginacao?.total ?? itens.length;

                setNormas(itens);
                setTotalNormas(total);
            } catch (error) {
                console.error('Erro ao listar normas:', error);
                setNormas([]);
                setTotalNormas(0);
            } finally {
                setCarregando(false);
            }
        };

        carregarNormas();
    }, [refreshTrigger, searchText, filtros]);

    const quantidadeExibida = normas.length;
    const quantidadeTotal = totalNormas || quantidadeExibida;

    // 2. Substituir a função abrirPdf por esta versão async[cite: 2]
    const abrirPdf = async (norma: Norma) => {
        // Monta os campos que já temos da listagem imediatamente[cite: 2]
        setNormaSelecionadaPdf({
            codigo: norma.codigo,
            titulo: norma.titulo,
            status: norma.status,
            orgaoEmissor: norma.orgao_emissor?.nome || norma.orgao_emissor_id?.nome,
            categoria: norma.categoria?.nome || norma.categoria_id?.nome,
            revisao: norma.revisao,
            arquivo: norma.arquivo ?? null,
        });
        setPdfModalAberto(true);

        // Busca os detalhes completos (escopo + palavras_chave) em paralelo[cite: 2]
        try {
            const detalhes = await getNormaDetalhes(norma.codigo);
            setNormaSelecionadaPdf((anterior) => ({
                ...anterior,
                escopo: detalhes.escopo ?? undefined,
                palavrasChave: detalhes.palavras_chave ?? undefined,
                normaRelacionada: detalhes.normas_relacionadas_ids ?? undefined,
            }));
        } catch (erro) {
            console.error("Erro ao buscar detalhes da norma para o painel:", erro);
        }
    };

    return (
        <div className="border border-font-border rounded-lg overflow-hidden">
            <table className="w-full">

                {/* Header da Tabela */}
                <thead>
                    <tr className="border-b border-font-border">
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">CÓDIGO</th>
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">NORMA</th>
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">ÓRGÃO</th>
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">CATEGORIA</th>
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">STATUS</th>
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">DOCUMENTO</th>
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">AÇÕES</th>
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">DETALHES</th>
                    </tr>
                </thead>

                {/* Linhas das normas */}
                <tbody>
                    {carregando ? (
                        <tr>
                            <td colSpan={8} className="px-6 py-6 text-sm text-gray-medium text-center">
                                Carregando normas...
                            </td>
                        </tr>
                    ) : normas.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="px-6 py-6 text-sm text-gray-medium text-center">
                                Nenhuma norma encontrada.
                            </td>
                        </tr>
                    ) : normas.map(norma => (
                        <tr
                            key={norma.id}
                            onClick={() => navigate(`/normas/ver/${encodeURIComponent(norma.codigo)}`)}
                            className="border-b border-font-border last:border-none hover:bg-red-50/60 transition-colors cursor-pointer"
                        >

                            {/* Código — vermelho no design */}
                            <td className="px-6 py-4 text-sm text-red-akaer font-semibold whitespace-nowrap">
                                {norma.codigo}
                            </td>

                            {/* Título */}
                            <td className="px-6 py-4">
                                <span className="block text-sm font-medium text-gray-900">{norma.titulo}</span>
                                <span className="block text-xs text-gray-medium">Revisão atual: {norma.revisao}</span>
                            </td>

                            <td className="px-6 py-4 text-sm text-gray-700">{norma.orgao_emissor?.nome || norma.orgao_emissor_id?.nome}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{norma.categoria?.nome || norma.categoria_id?.nome}</td>

                            {/* Status com bolinha colorida */}
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-1">
                                    <span className={`inline-block w-2 h-2 rounded-full ${statusColorClass(norma.status)}`}></span>
                                    <span className="leading-none text-sm text-gray-700">{norma.status}</span>
                                </div>
                            </td>

                            {/* Visualizaçao do PDF */}
                            <td className="px-10 py-4">
                                <button
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        abrirPdf(norma);
                                    }}
                                    title={'Visualizar PDF'}
                                    className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-red-akaer transition-colors"
                                >
                                    <FileText size={15} />
                                    <span>PDF</span>
                                </button>
                            </td>

                            {/* Botão de edição e visualização */}

                            <td className="px-6 py-4">
                                {isAdmin && (<>
                                    <button className="mb-[0.16rem] flex items-center gap-1.5 text-sm text-gray-700 hover:text-red-akaer transition-colors"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            navigate(`/normas/editar/${encodeURIComponent(norma.codigo)}`, {
                                                state: { norma }
                                            });
                                        }}>
                                        <Pencil size={15} />
                                        <span>Editar Norma</span>
                                    </button>
                                    <button className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-red-akaer transition-colors"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setNormaSelecionadaUpdate(norma);
                                            setUpdateModalAberto(true);
                                        }}
                                    >
                                        <RefreshCw size={15} />
                                        <span>Atualizar Revisão</span>
                                    </button>
                                </>)}
                            </td>

                            <td className="px-6 py-4">
                                <button className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-red-akaer transition-colors"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        navigate(`/normas/ver/${encodeURIComponent(norma.codigo)}`);
                                    }}
                                >
                                    <Eye size={15} />
                                    <span>Ver Norma</span>
                                </button>
                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Rodapé */}
            <div className="px-6 py-3 border-t border-font-border">
                <span className="text-xs text-gray-medium">Exibindo {quantidadeExibida} de {quantidadeTotal} Normas</span>
            </div>

            <PdfViewerModal
                open={pdfModalAberto}
                onOpenChange={setPdfModalAberto}
                norma={normaSelecionadaPdf}
            />

            <UpdateVersionModal
                open={updateModalAberto}
                onOpenChange={setUpdateModalAberto}
                norma={normaSelecionadaUpdate}
            />
        </div>
    );
}