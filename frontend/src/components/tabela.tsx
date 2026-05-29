import { useEffect, useState, useRef } from "react";
import { FileText, Pencil, Eye, ChevronRight } from "lucide-react";
import { getUserRole } from '../utils/auth';
import { useNavigate } from "react-router-dom";
import { listarNormas, getNormaDetalhes, getRevisoesNorma } from "@/services/normaService";
import type { FiltrosSelecionados } from "@/components/FilterAside/FilterAside";
import type { RevisaoNorma } from "@/services/normaService";
import PdfViewerModal from "./pdf-viewer-modal";

//os dados do accordeon estão mocados em backend/src/routes/norma.routes.ts

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


if (typeof document !== 'undefined' && !document.getElementById('accordion-row-style')) {
    const style = document.createElement('style');
    style.id = 'accordion-row-style';
    style.textContent = `
        @keyframes accordionRowIn {
            from { opacity: 0; transform: translateY(-4px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        .accordion-row-in {
            animation: accordionRowIn 200ms ease both;
        }
    `;
    document.head.appendChild(style);
}

const statusColorClass = (status: string) => {
    const normalizado = status.toLowerCase();
    return normalizado.includes('ativa') || normalizado.includes('ativo')
        ? 'bg-green-500'
        : 'bg-gray-400';
};

// Larguras fixas das colunas 
const COL_CHEVRON = 'w-10';
const COL_CODIGO = 'w-28';
const COL_TITULO = '';
const COL_ORGAO = '';
const COL_CATEGORIA = 'w-40';
const COL_STATUS = 'w-36';
const COL_DOC = 'w-36';
const COL_ACOES = 'w-56';

// Accordion de revisões 

interface AccordionRevisoesProps {
    codigoPai: string;
    isAdmin: boolean;
    onAbrirPdfRevisao: (revisao: RevisaoNorma) => void;
}

function AccordionRevisoes({ codigoPai, isAdmin, onAbrirPdfRevisao }: AccordionRevisoesProps) {
    const navigate = useNavigate();
    const [revisoes, setRevisoes] = useState<RevisaoNorma[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(false);
    const jaCarregou = useRef(false);

    useEffect(() => {
        if (jaCarregou.current) return;
        jaCarregou.current = true;

        const carregar = async () => {
            setCarregando(true);
            setErro(false);
            try {
                const dados = await getRevisoesNorma(codigoPai);
                setRevisoes(Array.isArray(dados) ? dados : []);
            } catch {
                setErro(true);
                setRevisoes([]);
            } finally {
                setCarregando(false);
            }
        };

        carregar();
    }, [codigoPai]);


    const linhaInfo = (conteudo: React.ReactNode) => (
        <tr className="bg-[#f7f7f7] border-b border-font-border">
            <td colSpan={7} className="pl-14 pr-6 py-3">{conteudo}</td>
        </tr>
    );

    if (carregando) return linhaInfo(
        <span className="text-xs text-gray-medium animate-pulse">Carregando histórico de revisões...</span>
    );
    if (erro) return linhaInfo(
        <span className="text-xs text-red-400">Não foi possível carregar o histórico de revisões.</span>
    );
    if (revisoes.length === 0) return linhaInfo(
        <span className="text-xs text-gray-medium">Nenhuma revisão anterior encontrada para esta norma.</span>
    );

    return (
        <>
            {revisoes.map((rev, idx) => {
                const isObsoleta =
                    rev.status?.toLowerCase().includes('obsoleta') ||
                    rev.status?.toLowerCase().includes('obsoleto');

                return (
                    <tr
                        key={rev.id ?? idx}
                        className="accordion-row-in bg-[#f7f7f7] border-b border-font-border last:border-none"
                        style={{ animationDelay: `${idx * 40}ms` }}
                    >
                        {/* Indentação */}
                        <td className={`${COL_CHEVRON} pl-4 py-3`}>
                            <div className="w-0.5 h-5 bg-gray-200 rounded-full mx-auto" />
                        </td>

                        {/* CÓDIGO */}
                        <td className={`${COL_CODIGO} px-4 py-3 text-sm text-gray-400 font-semibold whitespace-nowrap`}>
                            {rev.codigo}
                        </td>

                        {/* TÍTULO */}
                        <td className={`${COL_TITULO} px-6 py-3`}>
                            <span className="block text-sm font-medium text-gray-400">{rev.titulo}</span>
                            {rev.revisao && (
                                <span className="block text-xs text-gray-400/70">Revisão: {rev.revisao}</span>
                            )}
                        </td>

                        {/* ÓRGÃO EMISSOR */}
                        <td className={`${COL_ORGAO} px-6 py-3`}>
                            <span className="block text-sm font-medium text-gray-400">{rev.orgao_emissor?.nome}</span>
                            <span className="block text-xs text-gray-400/70">{rev.orgao_emissor_id?.nome ?? "—"}</span>
                        </td>

                        {/* CATEGORIA */}
                        <td className={`${COL_CATEGORIA} px-6 py-3`}>
                            <span className="text-sm text-gray-400 truncate block">
                                {rev.categoria?.nome ?? rev.categoria_id?.nome ?? '—'}
                            </span>
                        </td>

                        {/* STATUS */}
                        <td className={`${COL_STATUS} px-6 py-3`}>
                            {isObsoleta ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                                    Obsoleta
                                </span>
                            ) : (
                                <div className="flex items-center gap-1.5">
                                    <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${statusColorClass(rev.status)}`} />
                                    <span className="text-sm text-gray-400">{rev.status}</span>
                                </div>
                            )}
                        </td>

                        {/* DOCUMENTO */}
                        <td className={`${COL_DOC} px-6 py-3`}>
                            {rev.arquivo ? (
                                <button
                                    onClick={() => onAbrirPdfRevisao(rev)}
                                    title="Visualizar PDF"
                                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-akaer transition-colors"
                                >
                                    <FileText size={14} />
                                    <span>PDF</span>
                                </button>
                            ) : (
                                <span className="text-xs text-gray-300">—</span>
                            )}
                        </td>

                        {/* AÇÕES */}
                        <td className={`${COL_ACOES} px-6 py-3 text-right whitespace-nowrap`}>
                            <button
                                onClick={() => navigate(`/normas/ver/${encodeURIComponent(rev.codigo)}`)}
                                className="inline-flex items-center gap-1.5 text-sm text-gray-400 border border-gray-200 rounded-sm px-3 py-1.5 hover:border-gray-300 hover:text-gray-600 transition-colors bg-white"
                            >
                                <Eye size={13} />
                                <span>Ver</span>
                            </button>
                        </td>
                    </tr>
                );
            })}
        </>
    );
}

// Linha principal da norma 

interface NormaRowProps {
    norma: Norma;
    isAdmin: boolean;
    onAbrirPdf: (norma: Norma) => void;
    onAbrirPdfRevisao: (revisao: RevisaoNorma) => void;
}

function NormaRow({ norma, isAdmin, onAbrirPdf, onAbrirPdfRevisao }: NormaRowProps) {
    const navigate = useNavigate();
    const [accordionAberto, setAccordionAberto] = useState(false);

    const toggleAccordion = (e: React.MouseEvent) => {
        e.stopPropagation();
        setAccordionAberto((prev) => !prev);
    };

    return (
        <>
            <tr
                className={`border-b border-font-border last:border-none transition-colors ${accordionAberto ? 'bg-red-50/40' : ''
                    }`}
            >
                {/* Chevron trigger */}
                <td className={`${COL_CHEVRON} pl-4 pr-0 py-4`}>
                    <button
                        onClick={toggleAccordion}
                        title={accordionAberto ? 'Fechar histórico' : 'Ver histórico de revisões'}
                        className={`flex items-center justify-center w-5 h-5 rounded transition-colors ${accordionAberto ? 'text-red-akaer' : 'text-gray-400 hover:text-gray-700'
                            }`}
                    >
                        <ChevronRight
                            size={16}
                            className={`transition-transform duration-300 ease-in-out ${accordionAberto ? 'rotate-90' : 'rotate-0'
                                }`}
                        />
                    </button>
                </td>

                {/* CÓDIGO */}
                <td className={`${COL_CODIGO} px-4 py-4 text-sm text-red-akaer font-semibold whitespace-nowrap`}>
                    {norma.codigo}
                </td>

                {/* TÍTULO */}
                <td className={`${COL_TITULO} px-6 py-4`}>
                    <span className="block text-sm font-medium text-gray-900">{norma.titulo}</span>
                    <span className="block text-xs text-gray-medium">Revisão atual: {norma.revisao}</span>
                </td>

                {/* ÓRGÃO EMISSOR */}
                <td className={`${COL_ORGAO} px-6 py-4`}>
                    <span className="block text-sm font-medium text-gray-900">{norma.orgao_emissor?.nome}</span>
                    <span className="block text-sm font-medium text-gray-900">{norma.orgao_emissor_id?.nome}</span>
                </td>

                {/* CATEGORIA */}
                <td className={`${COL_CATEGORIA} px-6 py-4`}>
                    <span className="text-sm text-gray-700 truncate block">
                        {norma.categoria?.nome ?? norma.categoria_id?.nome ?? '—'}
                    </span>
                </td>

                {/* STATUS */}
                <td className={`${COL_STATUS} px-6 py-4`}>
                    <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                            <span className={`inline-block w-2 h-2 rounded-full ${statusColorClass(norma.status)}`} />
                            <span className="leading-none text-sm text-gray-700">{norma.status}</span>
                        </span>
                    </div>
                </td>

                {/* DOCUMENTO */}
                <td className={`${COL_DOC} px-6 py-4`}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onAbrirPdf(norma); }}
                        title="Visualizar PDF"
                        className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-red-akaer transition-colors"
                    >
                        <FileText size={15} />
                        <span>PDF</span>
                    </button>
                </td>

                {/* AÇÕES */}
                <td className={`${COL_ACOES} px-6 py-4 text-right whitespace-nowrap`}>
                    {isAdmin ? (
                        <div className="inline-flex items-center gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/normas/ver/${encodeURIComponent(norma.codigo)}`);
                                }}
                                className="inline-flex items-center gap-1.5 text-sm text-gray-700 border border-gray-300 rounded-sm px-3 py-1.5 hover:border-gray-400 hover:text-gray-900 transition-colors bg-white"
                            >
                                <Eye size={13} />
                                <span>Ver</span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/normas/editar/${encodeURIComponent(norma.codigo)}`, {
                                        state: {
                                            norma: {
                                                id: norma.id,
                                                codigo: norma.codigo,
                                                titulo: norma.titulo,
                                                revisao: norma.revisao,
                                                status: norma.status,
                                                arquivo: norma.arquivo,
                                                orgaoEmissor: norma.orgao_emissor?.nome ?? norma.orgao_emissor_id?.nome,
                                                categoria: norma.categoria?.nome ?? norma.categoria_id?.nome,
                                            }
                                        }
                                    });
                                }}
                                className="inline-flex items-center gap-1.5 text-sm text-gray-700 border border-gray-300 rounded-sm px-3 py-1.5 hover:border-gray-400 hover:text-gray-900 transition-colors bg-white"
                            >
                                <Pencil size={13} />
                                <span>Editar</span>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/normas/ver/${encodeURIComponent(norma.codigo)}`);
                            }}
                            className="inline-flex items-center gap-1.5 text-sm text-gray-700 border border-gray-300 rounded-sm px-3 py-1.5 hover:border-gray-400 hover:text-gray-900 transition-colors bg-white"
                        >
                            <Eye size={13} />
                            <span>Ver</span>
                        </button>
                    )}
                </td>
            </tr>

            {accordionAberto && (
                <AccordionRevisoes
                    codigoPai={norma.codigo}
                    isAdmin={isAdmin}
                    onAbrirPdfRevisao={onAbrirPdfRevisao}
                />
            )}
        </>
    );
}

// Componente principal 

export default function TabelaNormas({
    refreshTrigger = 0,
    searchText = '',
    filtros,
}: TabelaNormasProps) {
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

    const abrirPdf = async (norma: Norma) => {
        setNormaSelecionadaPdf({
            codigo: norma.codigo,
            titulo: norma.titulo,
            status: norma.status,
            orgaoEmissor: norma.orgao_emissor?.nome ?? norma.orgao_emissor_id?.nome,
            categoria: norma.categoria?.nome ?? norma.categoria_id?.nome,
            revisao: norma.revisao,
            arquivo: norma.arquivo ?? null,
        });
        setPdfModalAberto(true);

        try {
            const detalhes = await getNormaDetalhes(norma.codigo);
            setNormaSelecionadaPdf((anterior) => ({
                ...anterior,
                escopo: detalhes.escopo ?? undefined,
                palavrasChave: detalhes.palavras_chave ?? undefined,
                normaRelacionada: detalhes.normas_relacionadas_ids ?? undefined,
            }));
        } catch (erro) {
            console.error('Erro ao buscar detalhes da norma para o painel:', erro);
        }
    };

    const abrirPdfRevisao = async (revisao: RevisaoNorma) => {
        setNormaSelecionadaPdf({
            codigo: revisao.codigo,
            titulo: revisao.titulo,
            status: revisao.status,
            orgaoEmissor: revisao.orgao_emissor?.nome ?? revisao.orgao_emissor_id?.nome,
            categoria: revisao.categoria?.nome ?? revisao.categoria_id?.nome,
            revisao: revisao.revisao,
            arquivo: revisao.arquivo ?? null,
        });
        setPdfModalAberto(true);

        try {
            const detalhes = await getNormaDetalhes(revisao.codigo);
            setNormaSelecionadaPdf((anterior) => ({
                ...anterior,
                escopo: detalhes.escopo ?? undefined,
                palavrasChave: detalhes.palavras_chave ?? undefined,
                normaRelacionada: detalhes.normas_relacionadas_ids ?? undefined,
            }));
        } catch (erro) {
            console.error('Erro ao buscar detalhes da revisão para o painel:', erro);
        }
    };

    return (
        <div className="border border-font-border rounded-lg overflow-hidden">
            <table className="w-full table-fixed">
                <colgroup>
                    <col className={COL_CHEVRON} />
                    <col className={COL_CODIGO} />
                    <col className={COL_TITULO} />
                    <col className={COL_ORGAO} />
                    <col className={COL_CATEGORIA} />
                    <col className={COL_STATUS} />
                    <col className={COL_DOC} />
                    <col className={COL_ACOES} />
                </colgroup>

                <thead>
                    <tr className="border-b border-font-border">
                        <th className="w-10" />
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-4 py-3">
                            CÓDIGO
                        </th>
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">
                            TÍTULO
                        </th>
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">
                            ÓRGÃO EMISSOR
                        </th>
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">
                            CATEGORIA
                        </th>
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">
                            STATUS
                        </th>
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">
                            DOCUMENTO
                        </th>
                        <th className="text-center text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">
                            AÇÕES
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {carregando ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-6 text-sm text-gray-medium text-center">
                                Carregando normas...
                            </td>
                        </tr>
                    ) : normas.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-6 text-sm text-gray-medium text-center">
                                Nenhuma norma encontrada.
                            </td>
                        </tr>
                    ) : (
                        normas.map((norma) => (
                            <NormaRow
                                key={norma.id}
                                norma={norma}
                                isAdmin={isAdmin}
                                onAbrirPdf={abrirPdf}
                                onAbrirPdfRevisao={abrirPdfRevisao}
                            />
                        ))
                    )}
                </tbody>
            </table>

            <div className="px-6 py-3 border-t border-font-border">
                <span className="text-xs text-gray-medium">
                    Exibindo {quantidadeExibida} de {quantidadeTotal} Normas
                </span>
            </div>

            <PdfViewerModal
                open={pdfModalAberto}
                onOpenChange={setPdfModalAberto}
                norma={normaSelecionadaPdf}
            />
        </div>
    );
}