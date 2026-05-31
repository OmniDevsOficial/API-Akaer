import { useEffect, useState, useCallback } from "react";
import { FileText, Pencil, Eye, ChevronRight, RefreshCw } from "lucide-react";
import { getUserRole } from '../utils/auth';
import { useNavigate } from "react-router-dom";
import { listarNormas, getNormaDetalhes } from "@/services/normaService";
import type { FiltrosSelecionados } from "@/components/FilterAside/FilterAside";
import type { RevisaoNorma } from "@/services/normaService";
import PdfViewerModal from "./pdf-viewer-modal";
import UpdateVersionModal from "./update-version-modal";

export interface Norma {
    id: number;
    codigo: string;
    codigo_base?: string;
    titulo: string;
    arquivo?: string;
    revisao?: string | null;
    orgao_emissor?: { nome: string };
    orgao_emissor_id?: { nome: string };
    categoria?: { nome: string };
    categoria_id?: { nome: string };
    status: string;
    revisoes?: RevisaoNorma[];
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
    ordem: 'recentes' | 'antigas' | 'az' | 'za';
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



interface AccordionRevisoesProps {
    revisoes: RevisaoNorma[];
    onAbrirPdfRevisao: (revisao: RevisaoNorma) => void;
}

function AccordionRevisoes({ revisoes, onAbrirPdfRevisao }: AccordionRevisoesProps) {
    const navigate = useNavigate();

    if (revisoes.length === 0) return null;

    return (
        <>
            {revisoes.map((rev, idx) => (
                <tr
                    key={rev.id ?? idx}
                    className="accordion-row-in bg-[#f7f7f7] border-b border-font-border last:border-none"
                    style={{ animationDelay: `${idx * 40}ms` }}
                >
                    {/* Indentação */}
                    <td className="pl-4 py-2.5">
                    </td>

                    {/* CÓDIGO */}
                    <td className="px-3 py-3 text-sm text-gray-400 font-semibold whitespace-nowrap">
                        {rev.codigo_base || rev.codigo}
                        <span className="font-normal block text-xs text-gray-400/70">Revisão: <span className="font-semibold text-red-akaer/60">{rev.revisao}</span></span>
                    </td>

                    {/* NORMA (título + revisão) */}
                    <td className="px-3 py-3">
                        <span className="block text-sm font-medium text-gray-400">{rev.titulo}</span>
                    </td>

                    {/* ÓRGÃO — dash para obsoletas */}
                    <td className="px-3 py-3 text-sm text-gray-400">{rev.orgao_emissor?.nome || '-'}</td>

                    {/* CATEGORIA — dash para obsoletas */}
                    <td className="px-3 py-3 text-sm text-gray-400">{rev.categoria?.nome || '-'}</td>

                    {/* STATUS */}
                    <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                                <span className={`inline-block w-2 h-2 rounded-full ${statusColorClass(rev.status)}`} />
                                <span className="leading-none text-sm text-gray-400">{rev.status}</span>
                            </span>
                        </div>
                    </td>

                    {/* DOCUMENTO */}
                    <td className="px-3 py-3">
                        {rev.arquivo ? (
                            <button
                                onClick={() => onAbrirPdfRevisao(rev)}
                                title="Visualizar PDF"
                                className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-akaer transition-colors whitespace-nowrap"
                            >
                                <FileText size={14} />
                                <span>PDF</span>
                            </button>
                        ) : (
                            <span className="text-xs text-gray-300">—</span>
                        )}
                    </td>

                    {/* AÇÕES — dash para obsoletas */}
                    <td className="px-0 py-3 text-sm text-gray-400">-</td>

                    {/* DETALHES */}
                    <td className="px-3 py-3">
                        <button
                            className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-akaer transition-colors whitespace-nowrap"
                            onClick={() => navigate(`/normas/ver/${encodeURIComponent(rev.codigo)}`)}
                        >
                            <Eye size={14} />
                            <span>Ver Norma</span>
                        </button>
                    </td>
                </tr>
            ))}
        </>
    );
}

// Linha principal da norma 

interface NormaRowProps {
    norma: Norma;
    isAdmin: boolean;
    onAbrirPdf: (norma: Norma) => void;
    onAbrirPdfRevisao: (revisao: RevisaoNorma) => void;
    onEditar: (norma: Norma) => void;
    onAtualizarRevisao: (norma: Norma) => void;
}

function NormaRow({ norma, isAdmin, onAbrirPdf, onAbrirPdfRevisao, onEditar, onAtualizarRevisao }: NormaRowProps) {
    const navigate = useNavigate();
    const [accordionAberto, setAccordionAberto] = useState(false);

    const revisoes = norma.revisoes ?? [];
    const temRevisoes = revisoes.length > 0;

    const toggleAccordion = () => {
        if (temRevisoes) {
            setAccordionAberto((prev) => !prev);
        }
    };

    return (
        <>
            <tr
                onClick={toggleAccordion}
                className={`border-b border-font-border last:border-none hover:bg-red-50/60 transition-colors ${
                    temRevisoes ? 'cursor-pointer' : ''
                } ${accordionAberto ? 'bg-red-50/40' : ''}`}
            >
                {/* Chevron trigger — só aparece se tem revisões */}
                <td className="pl-4 pr-0 py-3">
                    {temRevisoes && (
                        <div
                            title={accordionAberto ? 'Fechar histórico' : 'Ver histórico de revisões'}
                            className={`flex items-center justify-center w-5 h-5 rounded transition-colors ${accordionAberto ? 'text-red-akaer' : 'text-gray-400 hover:text-gray-700'
                                }`}
                        >
                            <ChevronRight
                                size={16}
                                className={`transition-transform duration-300 ease-in-out ${accordionAberto ? 'rotate-90' : 'rotate-0'
                                    }`}
                            />
                        </div>
                    )}
                </td>

                {/* CÓDIGO */}
                <td className="px-3 py-3 text-sm text-red-akaer font-semibold whitespace-nowrap">
                    {norma.codigo_base || norma.codigo}
                    <span className="font-normal block text-xs text-gray-medium">Revisão atual: <span className="font-semibold text-red-akaer">{norma.revisao}</span></span>
                </td>

                {/* NORMA (título + revisão) */}
                <td className="px-3 py-3">
                    <span className="block text-sm font-medium text-gray-900">{norma.titulo}</span>
                    
                </td>

                {/* ÓRGÃO */}
                <td className="px-3 py-3 text-sm text-gray-700">{norma.orgao_emissor?.nome || norma.orgao_emissor_id?.nome}</td>

                {/* CATEGORIA */}
                <td className="px-3 py-3 text-sm text-gray-700">{norma.categoria?.nome || norma.categoria_id?.nome}</td>

                {/* STATUS */}
                <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                            <span className={`inline-block w-2 h-2 rounded-full ${statusColorClass(norma.status)}`} />
                            <span className="leading-none text-sm text-gray-700">{norma.status}</span>
                        </span>
                    </div>
                </td>

                {/* DOCUMENTO */}
                <td className="px-3 py-3">
                    <button
                        onClick={(e) => { e.stopPropagation(); onAbrirPdf(norma); }}
                        title="Visualizar PDF"
                        className="flex items-center gap-1 text-sm text-gray-700 hover:text-red-akaer transition-colors whitespace-nowrap"
                    >
                        <FileText size={14} />
                        <span>PDF</span>
                    </button>
                </td>

                {/* AÇÕES */}
                <td className="px-0 py-4">
                    {isAdmin && (<>
                        <button className="mb-[0.16rem] flex items-center gap-1 text-sm text-gray-700 hover:text-red-akaer transition-colors whitespace-nowrap"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditar(norma);
                            }}>
                            <Pencil size={14} />
                            <span>Editar Norma</span>
                        </button>
                        <button className="flex items-center gap-1 text-sm text-gray-700 hover:text-red-akaer transition-colors whitespace-nowrap"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAtualizarRevisao(norma);
                            }}
                        >
                            <RefreshCw size={14} />
                            <span>Atualizar Revisão</span>
                        </button>
                    </>)}
                </td>

                {/* DETALHES */}
                <td className="px-3 py-3">
                    <button className="flex items-center gap-1 text-sm text-gray-700 hover:text-red-akaer transition-colors whitespace-nowrap"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/normas/ver/${encodeURIComponent(norma.codigo)}`);
                        }}
                    >
                        <Eye size={14} />
                        <span>Ver Norma</span>
                    </button>
                </td>
            </tr>

            {accordionAberto && temRevisoes && (
                <AccordionRevisoes
                    revisoes={revisoes}
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
    ordem,
}: TabelaNormasProps) {
    const navigate = useNavigate();
    const role = getUserRole();
    const isAdmin = role?.toLowerCase() === 'admin';

    const [normas, setNormas] = useState<Norma[]>([]);
    const [totalNormas, setTotalNormas] = useState(0);
    const [carregando, setCarregando] = useState(true);
    const [pdfModalAberto, setPdfModalAberto] = useState(false);
    const [normaSelecionadaPdf, setNormaSelecionadaPdf] = useState<NormaSelecionadaPdf | null>(null);
    const [updateModalAberto, setUpdateModalAberto] = useState(false);
    const [normaSelecionadaUpdate, setNormaSelecionadaUpdate] = useState<Norma | null>(null);

    // Função de fetch extraída para poder ser reutilizada no onSuccess
    const fetchNormas = useCallback(async () => {
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
    }, [searchText, filtros]);


    // useEffect existente passa a usar fetchNormas
    useEffect(() => {
        fetchNormas();
    }, [fetchNormas, refreshTrigger]);

    // Handler para abrir o modal com a norma certa
    const handleAtualizarRevisao = (norma: Norma) => {
        setNormaSelecionadaUpdate(norma);
        setUpdateModalAberto(true);
    };


    const normasFiltradas = normas.filter((norma) => {
        if (!searchText.trim()) return true;

        const textoBusca = searchText.toLowerCase();
        // Garante que não vai quebrar se a norma vier sem título ou código
        const titulo = norma.titulo ? norma.titulo.toLowerCase() : '';
        const codigo = norma.codigo ? norma.codigo.toLowerCase() : '';

        return titulo.includes(textoBusca) || codigo.includes(textoBusca);
    });

    // ORDENAR OS DADOS FILTRADOS
    const normasOrdenadas = [...normasFiltradas].sort((a, b) => {
        if (ordem === 'az') {
            return a.titulo.localeCompare(b.titulo);
        }
        if (ordem === 'za') {
            return b.titulo.localeCompare(a.titulo);
        }
        if (ordem === 'recentes') {
            // Se não tem data, o ID maior é o cadastro mais novo
            return b.id - a.id;
        }
        if (ordem === 'antigas') {
            // ID menor é o cadastro mais velho
            return a.id - b.id;
        }

        return 0;
    });

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

    const handleEditar = (norma: Norma) => {
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
    };

    return (
        <div className="border border-font-border rounded-lg overflow-x-auto">
            <table className="w-full min-w-[920px]">
                <thead>
                    <tr className="border-b border-font-border">
                        <th className="w-10" />
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-3 py-3 whitespace-nowrap">CÓDIGO</th>
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-3 py-3 whitespace-nowrap">NORMA</th>
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-3 py-3 whitespace-nowrap">ÓRGÃO</th>
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-3 py-3 whitespace-nowrap">CATEGORIA</th>
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-3 py-3 whitespace-nowrap">STATUS</th>
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-3 py-3 whitespace-nowrap">DOCUMENTO</th>
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-0 py-3 whitespace-nowrap">AÇÕES</th>
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-3 py-3 whitespace-nowrap">DETALHES</th>
                    </tr>
                </thead>

                <tbody>
                    {carregando ? (
                        <tr>
                            <td colSpan={9} className="px-6 py-6 text-sm text-gray-medium text-center">
                                Carregando normas...
                            </td>
                        </tr>
                    ) : normas.length === 0 ? (
                        <tr>
                            <td colSpan={9} className="px-6 py-6 text-sm text-gray-medium text-center">
                                Nenhuma norma encontrada.
                            </td>
                        </tr>
                    ) : (
                        normasOrdenadas.map((norma) => (
                            <NormaRow
                                key={norma.id}
                                norma={norma}
                                isAdmin={isAdmin}
                                onAbrirPdf={abrirPdf}
                                onAbrirPdfRevisao={abrirPdfRevisao}
                                onEditar={handleEditar}
                                onAtualizarRevisao={handleAtualizarRevisao}
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

            <UpdateVersionModal
                open={updateModalAberto}
                onOpenChange={setUpdateModalAberto}
                norma={normaSelecionadaUpdate}
                onSuccess={fetchNormas}
            />
        </div>
    );
}