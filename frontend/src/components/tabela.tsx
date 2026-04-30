import { useEffect, useState } from "react";
import { FileText, Pencil, Globe } from "lucide-react";
import api from "@/services/api";
import { getUserRole } from '../utils/auth';
import PdfViewerModal from "./pdf-viewer-modal";
import { getNormaDetalhes } from "@/services/normaService";
import { type FiltrosSelecionados } from "./FilterAside/FilterAside";

interface Norma {
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

interface NormaSelecionadaPdf {
    codigo?: string;
    titulo?: string;
    status?: string;
    orgaoEmissor?: string;
    categoria?: string;
    revisao?: string | null;
    arquivo?: string | null;
    escopo?: string;
    palavrasChave?: string[];
}

interface NormasLeituraResponse {
    itens?: Norma[];
    paginacao?: {
        total?: number;
    };
}

interface TabelaNormasProps {
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
    const [normas, setNormas] = useState<Norma[]>([]);
    const [totalNormas, setTotalNormas] = useState(0);
    const [carregando, setCarregando] = useState(true);
    const [pdfModalAberto, setPdfModalAberto] = useState(false);
    const [normaSelecionadaPdf, setNormaSelecionadaPdf] = useState<NormaSelecionadaPdf | null>(null);
    const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);

    useEffect(() => {
        const carregarNormas = async () => {
            setCarregando(true);
            const textoBusca = searchText.trim();

            try {
                const response = await api.get<NormasLeituraResponse>('/normas/listar', {
                    params: {
                        page: 1,
                        texto:     textoBusca        || undefined,
                        orgao:     filtros?.orgao     ?? undefined,
                        categoria: filtros?.categoria ?? undefined,
                        etapa:     filtros?.etapa     ?? undefined,
                    },
                });

                const itens = Array.isArray(response.data?.itens) ? response.data.itens : [];
                const total = response.data?.paginacao?.total ?? itens.length;

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

    const abrirPdf = async (norma: Norma) => {
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
        setCarregandoDetalhes(true);

        try {
            const detalhes = await getNormaDetalhes(norma.codigo);

            setNormaSelecionadaPdf({
                codigo: detalhes.codigo,
                titulo: detalhes.titulo,
                status: detalhes.status,
                orgaoEmissor: detalhes.orgao_emissor?.nome,
                categoria: detalhes.categoria?.nome,
                revisao: detalhes.revisao,
                arquivo: detalhes.arquivo ?? null,
                escopo: detalhes.escopo ?? undefined,
                palavrasChave: detalhes.palavras_chave ?? undefined,
            });
        } catch (error) {
            console.error('Erro ao buscar detalhes da norma:', error);
        } finally {
            setCarregandoDetalhes(false);
        }
    };

    return (
        <div className="border border-font-border rounded-lg overflow-hidden">
            <table className="w-full">

                <thead>
                    <tr className="border-b border-font-border">
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">CÓDIGO</th>
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">NORMA</th>
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">ÓRGÃO</th>
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">CATEGORIA</th>
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">STATUS</th>
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">DOCUMENTO</th>

                        {isAdmin && (
                            <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">
                                AÇÕES
                            </th>
                        )}

                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">VISIB.</th>
                    </tr>
                </thead>

                <tbody>
                    {carregando ? (
                        <tr>
                            <td colSpan={isAdmin ? 8 : 7} className="px-6 py-6 text-sm text-gray-medium text-center">
                                Carregando normas...
                            </td>
                        </tr>
                    ) : normas.length === 0 ? (
                        <tr>
                            <td colSpan={isAdmin ? 8 : 7} className="px-6 py-6 text-sm text-gray-medium text-center">
                                Nenhuma norma encontrada.
                            </td>
                        </tr>
                    ) : normas.map(norma => (
                        <tr key={norma.id} className="border-b border-font-border last:border-none hover:bg-gray-50 transition-colors">

                            <td className="px-6 py-4 text-sm text-red-akaer font-semibold whitespace-nowrap">
                                {norma.codigo}
                            </td>

                            <td className="px-6 py-4">
                                <span className="block text-sm font-medium text-gray-900">{norma.titulo}</span>
                                <span className="block text-xs text-gray-medium">Categoria: {norma.categoria?.nome || norma.categoria_id?.nome}</span>
                            </td>

                            <td className="px-6 py-4 text-sm text-gray-700">{norma.orgao_emissor?.nome || norma.orgao_emissor_id?.nome}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{norma.categoria?.nome || norma.categoria_id?.nome}</td>

                            <td className="px-6 py-4">
                                <div className="flex items-center gap-1">
                                    <span className={`w-2 h-2 rounded-full ${statusColorClass(norma.status)}`}></span>
                                    <span className="text-sm text-gray-700">{norma.status}</span>
                                </div>
                            </td>

                            {/* Visualizaçao do PDF */}
                            <td className="px-10 py-4">
                                <button
                                    onClick={() => abrirPdf(norma)}
                                    disabled={carregandoDetalhes}
                                    title={norma.arquivo ? 'Visualizar PDF' : 'Sem PDF cadastrado'}
                                    className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-red-akaer transition-colors"
                                >
                                    <FileText size={15} />
                                    <span>PDF</span>
                                </button>
                            </td>

                            {isAdmin && (
                                <td className="px-6 py-4">
                                    <button className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-red-akaer transition-colors">
                                        <Pencil size={15} />
                                        <span>Editar</span>
                                    </button>
                                </td>
                            )}

                            {/* Visibilidade */}
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-1.5 text-sm text-gray-700">
                                    <Globe size={15} />
                                    <span>Público</span>
                                </div>
                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="px-6 py-3 border-t border-font-border">
                <span className="text-xs text-gray-medium">Exibindo {quantidadeExibida} de {quantidadeTotal} Normas</span>
            </div>

            <PdfViewerModal
                open={pdfModalAberto}
                onOpenChange={setPdfModalAberto}
                norma={normaSelecionadaPdf}
            />
        </div>
    );
}