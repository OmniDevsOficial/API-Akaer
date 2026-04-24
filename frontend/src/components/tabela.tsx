import { useEffect, useState } from "react";
import { TfiPencilAlt, TfiWorld } from "react-icons/tfi";
import { FaRegFilePdf } from "react-icons/fa6";
import api from "@/services/api";
import { getUserRole } from '../utils/auth';
import { Button } from "./ui/button";
import PdfViewerModal from "./pdf-viewer-modal";

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
}

const statusColorClass = (status: string) => {
    const normalizado = status.toLowerCase();
    return normalizado.includes('ativa') || normalizado.includes('ativo')
        ? 'bg-green-500'
        : 'bg-gray-400';
};

export default function TabelaNormas({ refreshTrigger = 0, searchText = '' }: TabelaNormasProps) {

    const role = getUserRole();
    const isAdmin = role?.toLowerCase() === 'admin';
    const [normas, setNormas] = useState<Norma[]>([]);
    const [totalNormas, setTotalNormas] = useState(0);
    const [carregando, setCarregando] = useState(true);
    const [pdfModalAberto, setPdfModalAberto] = useState(false);
    const [normaSelecionadaPdf, setNormaSelecionadaPdf] = useState<NormaSelecionadaPdf | null>(null);

    useEffect(() => {
        const carregarNormas = async () => {
            setCarregando(true);
            const textoBusca = searchText.trim();

            try {
                const response = await api.get<NormasLeituraResponse>('/normas/listar', {
                    params: {
                        page: 1,
                        texto: textoBusca || undefined,
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
    }, [refreshTrigger, searchText]);

    const quantidadeExibida = normas.length;
    const quantidadeTotal = totalNormas || quantidadeExibida;

    const abrirPdf = (norma: Norma) => {
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

                        {isAdmin && (
                            <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">
                                AÇÕES
                            </th>
                        )}

                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">VISIB.</th>

                    </tr>
                </thead>

                {/* Linhas das normas */}
                <tbody>
                    {carregando ? (
                        <tr>
                            <td colSpan={isAdmin ? 7 : 6} className="px-6 py-6 text-sm text-gray-medium text-center">
                                Carregando normas...
                            </td>
                        </tr>
                    ) : normas.length === 0 ? (
                        <tr>
                            <td colSpan={isAdmin ? 7 : 6} className="px-6 py-6 text-sm text-gray-medium text-center">
                                Nenhuma norma encontrada.
                            </td>
                        </tr>
                    ) : normas.map(norma => (
                        <tr key={norma.id} className="border-b border-font-border last:border-none hover:bg-gray-50 transition-colors">

                            {/* Código — vermelho no design */}
                            <td className="px-6 py-4 text-sm text-red-akaer font-semibold whitespace-nowrap">
                                {norma.codigo}
                            </td>

                            {/* Título + descrição empilhados */}
                            <td className="px-6 py-4">
                                <span className="block text-sm font-medium text-gray-900">{norma.titulo}</span>
                                <span className="block text-xs text-gray-medium">Categoria: {norma.categoria?.nome || norma.categoria_id?.nome}</span>
                                {/* Colocar este acima como campo de palavra-chave */}
                            </td>

                            <td className="px-6 py-4 text-sm text-gray-700">{norma.orgao_emissor?.nome || norma.orgao_emissor_id?.nome}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{norma.categoria?.nome || norma.categoria_id?.nome}</td>

                            {/* Status com bolinha colorida */}
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-1">
                                    <span className={`w-2 h-2 rounded-full ${statusColorClass(norma.status)}`}></span>
                                    <span className="text-sm text-gray-700">{norma.status}</span>
                                </div>
                            </td>

                            {/* Visualizaçao do PDF */}
                            <td className="py-4 px-6">
                                <Button
                                    size={'icon'}
                                    onClick={() => abrirPdf(norma)}
                                    title={norma.arquivo ? 'Visualizar PDF' : 'Norma sem PDF cadastrado'}
                                    className="ml-6"
                                >
                                    <FaRegFilePdf className="ml-[4px]"/>
                                </Button>
                            </td>

                            {/* Botões de ação */}
                            {isAdmin && (
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1 text-gray-700 hover:text-red-akaer transition-colors cursor-pointer">
                                        <TfiPencilAlt className="p-1  text-2xl" />
                                        <span className="text-sm">Editar</span>
                                    </div>
                                </td>
                            )}

                            {/* Visibilidade */}
                            <td className="px-6 py-4 text-sm text-gray-700">
                                <div className="flex items-center gap-1">
                                    <TfiWorld />
                                    <span>Público</span>
                                </div>
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
        </div>
    );
}