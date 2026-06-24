import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { getUserRole } from "@/utils/auth";
import { Eye } from "lucide-react";
import type { FiltrosSelecionados } from "@/components/FilterAside/FilterAside";
import ModalAvaliacaoChecker from "./modalAvaliacaoChecker";
import AddStandardModal from "@/components/add-standard-modal";
import ReportErrorModal from "@/pages/Solicitacoes/ReportErrorModal";
import api from "@/services/api";

interface SolicitacaoApi {
    id: number;
    nome: string;
    role: string;
    status: string;
    tipo_solicitacao: string;
    norma_id: string | null;
    data_criacao: string;
}

export interface Solicitacao {
    id: number;
    tipo: string;
    criador: string;
    cargo: string;
    status: string;
    data_criacao: string;
}

interface RespostaSolicitacoes {
    data: SolicitacaoApi[];
    pagination: {
        limit: number,
        page: number,
        total: number,
        totalPages: number,
    };
}

export interface TabelaSolicitarProps {
    refreshTrigger?: number;
    searchText?: string;
    filtros?: FiltrosSelecionados;
    filtroStatus?: string;
    onContagensChange?: (contagens: Record<string, number>) => void;
}

const STATUS_PARAM_MAP: Record<string, string | undefined> = {
    pendente: "Pendente",
    aprovada: "Aprovada",
    concluida: "Concluida",
    reprovada: "Reprovada",
};

const TIPO_LABEL_MAP: Record<string, string> = {
    NOVA_NORMA: "Nova norma",
    NOVA_NOTA: "Nova nota",
    REPORTE_ERRO: "Reporte de erro",
};

const statusColorClass = (status: string) => {
    const corStatus: Record<string, string> = {
        'pendente': 'bg-gray-500',
        'aprovada': 'bg-orange-400',
        'concluida': 'bg-green-500',
        'reprovada': 'bg-red-akaer',
    };
    return corStatus[status.toLowerCase()] ?? 'bg-gray-300';
};

export default function TabelaSolicitar({
    filtroStatus = "todas",
    searchText = "",
    refreshTrigger,
    onContagensChange,
}: TabelaSolicitarProps) {
    const role = getUserRole();
    const isAdmin = role?.toLowerCase() === 'admin';
    const isChecker = role?.toLowerCase() === 'checker';
    const isViewer = role?.toLowerCase() === 'visualizador';
    const totalColunas = 7;

    const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
    const [carregando, setCarregando] = useState(true);

    const [modalCheckerAberto, setModalCheckerAberto] = useState(false);
    const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<Solicitacao | null>(null);
    // Adiciona estado separado pro modal de detalhes do admin
    const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
    const [solicitacaoDetalhes, setSolicitacaoDetalhes] = useState<Solicitacao | null>(null);
    // Abertura e conclusão para modal de cadastro de norma
    const [modalCadastroAberto, setModalCadastroAberto] = useState(false);
    const [solicitacaoParaConcluir, setSolicitacaoParaConcluir] = useState<Solicitacao | null>(null);
    // Abertura para modal de reportar erro
    const [modalReporteErro, setModalReporteErro] = useState(false)

    useEffect(() => {
        let ativo = true;

        const carregarSolicitacoes = async () => {
            setCarregando(true);
            try {
                const statusParam = STATUS_PARAM_MAP[filtroStatus.toLowerCase()];
                const response = await api.get<RespostaSolicitacoes>("/solicitacoes", {
                    params: statusParam ? { status: statusParam } : undefined,
                });

                if (!ativo) return;

                const dados = response.data.data.map((solicitacao) => ({
                    id: solicitacao.id,
                    tipo: TIPO_LABEL_MAP[solicitacao.tipo_solicitacao] ?? solicitacao.tipo_solicitacao,
                    criador: solicitacao.nome,
                    cargo: solicitacao.role,
                    status: solicitacao.status,
                    data_criacao: solicitacao.data_criacao,
                }));

                setSolicitacoes(dados);

                if (onContagensChange) {
                    const totais: Record<string, number> = { todas: dados.length };
                    dados.forEach(s => {
                        const key = s.status.toLowerCase();
                        totais[key] = (totais[key] ?? 0) + 1;
                    });
                    onContagensChange(totais);
                }
            } catch (error) {
                console.error("Erro ao carregar solicitacoes", error);
                if (ativo) setSolicitacoes([]);
            } finally {
                if (ativo) setCarregando(false);
            }
        };

        carregarSolicitacoes();
        return () => { ativo = false; };
    }, [filtroStatus, refreshTrigger]);

    const handleSucessoAvaliacao = (idAprovadoOuRejeitado: number) => {
        setSolicitacoes(prev => prev.filter(s => s.id !== idAprovadoOuRejeitado));
    };

    const solicitacoesFiltradas = solicitacoes
        .filter((s) => filtroStatus === 'todas' || s.status.toLowerCase() === filtroStatus)
        .filter((s) =>
            !searchText.trim() ||
            s.criador.toLowerCase().includes(searchText.toLowerCase()) ||
            s.tipo.toLowerCase().includes(searchText.toLowerCase())
        );

    const handleConcluirSolicitacao = (id: number) => {
        setSolicitacoes(prev =>
            prev.map(s => s.id === id ? { ...s, status: 'Concluída' } : s)
        );
    };

    // Helper para centralizar a lógica de ação dos botões
    const handleAvaliar = (s: Solicitacao, podeAvaliarChecker: boolean, podeAvaliarAdmin: boolean) => {
        if (podeAvaliarChecker) {
            setSolicitacaoSelecionada(s);
            setModalCheckerAberto(true);
        }
        if (podeAvaliarAdmin) {
            if (s.tipo === 'Nova norma') {
                setSolicitacaoParaConcluir(s);
                setModalCadastroAberto(true);
            } else {
                setSolicitacaoSelecionada(s);
                setModalCheckerAberto(true);
            }
        }
    };

    const handleDetalhes = (s: Solicitacao) => {
        setSolicitacaoDetalhes(s);
        setModalDetalhesAberto(true);
    };

    return (
        <div className="border border-font-border rounded-lg overflow-hidden">

            <ModalAvaliacaoChecker
                open={modalCheckerAberto}
                onOpenChange={setModalCheckerAberto}
                solicitacao={solicitacaoSelecionada}
                onSuccess={handleSucessoAvaliacao}
            />

            <ModalAvaliacaoChecker
                open={modalDetalhesAberto}
                onOpenChange={setModalDetalhesAberto}
                solicitacao={solicitacaoDetalhes}
                onSuccess={() => { }}
                modo="detalhes"
            />

            <AddStandardModal
                open={modalCadastroAberto}
                onOpenChange={setModalCadastroAberto}
                onSuccess={() => { }}
                solicitacaoId={solicitacaoParaConcluir?.id}
                onConcluir={handleConcluirSolicitacao}
            />

            <ReportErrorModal
                open={modalReporteErro}
                onOpenChange={setModalReporteErro}
                normas={[]}
            />

            {/* ── TABELA — visível só em sm+ ── */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="w-full min-w-[640px]">
                    <thead>
                        <tr className="border-b border-font-border">
                            <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">#</th>
                            <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">TIPO</th>
                            <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">CRIADOR</th>
                            <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">CARGO</th>
                            <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">STATUS</th>
                            <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">DATA DE CRIAÇÃO</th>
                            <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">AÇÕES</th>
                        </tr>
                    </thead>

                    <tbody>
                        {carregando ? (
                            <tr>
                                <td colSpan={totalColunas} className="px-6 py-6 text-sm text-gray-medium text-center">Carregando solicitações...</td>
                            </tr>
                        ) : solicitacoesFiltradas.length === 0 ? (
                            <tr>
                                <td colSpan={totalColunas} className="px-6 py-6 text-sm text-gray-medium text-center">
                                    <div className="w-full flex justify-center">
                                        <span>Nenhuma solicitação encontrada.</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            solicitacoesFiltradas.map((s) => {
                                const podeAvaliarChecker = isChecker && s.status.toLowerCase() === 'pendente';
                                const podeAvaliarAdmin = isAdmin && s.status.toLowerCase() === 'aprovada';
                                const mostrarBotaoAvaliar = podeAvaliarChecker || podeAvaliarAdmin;
                                const mostrarBotaoDetalhes = isViewer || (isAdmin && !podeAvaliarAdmin) || isChecker && s.status.toLowerCase() != 'pendente';

                                return (
                                    <tr
                                        key={s.id}
                                        className="border-b border-font-border last:border-none hover:bg-red-50/60 transition-colors bg-white"
                                    >
                                        <td className="px-6 py-4 text-sm text-red-akaer font-semibold">{s.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{s.tipo}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{s.criador}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{s.cargo}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                                                    <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${statusColorClass(s.status)}`} />
                                                    <span className="text-sm leading-none text-gray-700">{s.status}</span>
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {new Date(s.data_criacao).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            {mostrarBotaoAvaliar && (
                                                <button
                                                    className="flex items-center gap-1.5 bg-dark-title py-1.5 px-3 rounded-sm text-sm text-white hover:text-gray-medium transition-colors cursor-pointer"
                                                    onClick={() => handleAvaliar(s, podeAvaliarChecker, podeAvaliarAdmin)}
                                                >
                                                    <Check size={15} />
                                                    <span>Avaliar</span>
                                                </button>
                                            )}
                                            {mostrarBotaoDetalhes && (
                                                <button
                                                    className="flex items-center gap-1.5 border border-font-border py-1.5 px-3 rounded-sm text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                                                    onClick={() => handleDetalhes(s)}
                                                >
                                                    <Eye size={15} />
                                                    <span>Detalhes</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── CARDS — visível só em mobile ── */}
            <div className="sm:hidden">
                {carregando ? (
                    <div className="px-4 py-8 text-sm text-gray-medium text-center">
                        Carregando solicitações...
                    </div>
                ) : solicitacoesFiltradas.length === 0 ? (
                    <div className="px-4 py-8 text-sm text-gray-medium text-center">
                        Nenhuma solicitação encontrada.
                    </div>
                ) : (
                    <div className="flex flex-col divide-y divide-font-border">
                        {solicitacoesFiltradas.map((s) => {
                            const podeAvaliarChecker = isChecker && s.status.toLowerCase() === 'pendente';
                            const podeAvaliarAdmin = isAdmin && s.status.toLowerCase() === 'aprovada';
                            const mostrarBotaoAvaliar = podeAvaliarChecker || podeAvaliarAdmin;
                            const mostrarBotaoDetalhes = isViewer || (isAdmin && !podeAvaliarAdmin) || isChecker && s.status.toLowerCase() != 'pendente';

                            return (
                                <div
                                    key={s.id}
                                    className="bg-white px-4 py-4 flex flex-col gap-3 hover:bg-red-50/60 transition-colors"
                                >
                                    {/* Cabeçalho do card: ID + status */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-red-akaer">#{s.id}</span>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 border border-gray-200">
                                            <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${statusColorClass(s.status)}`} />
                                            <span className="text-sm leading-none text-gray-700">{s.status}</span>
                                        </span>
                                    </div>

                                    {/* Tipo */}
                                    <p className="text-sm font-medium text-gray-900">{s.tipo}</p>

                                    {/* Criador + cargo */}
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-sm text-gray-700">{s.criador}</span>
                                        <span className="text-xs text-gray-medium">{s.cargo}</span>
                                    </div>

                                    {/* Data */}
                                    <span className="text-xs text-gray-medium">
                                        {new Date(s.data_criacao).toLocaleDateString('pt-BR')}
                                    </span>

                                    {/* Ações */}
                                    {(mostrarBotaoAvaliar || mostrarBotaoDetalhes) && (
                                        <div className="flex gap-2 pt-1">
                                            {mostrarBotaoAvaliar && (
                                                <button
                                                    className="flex-1 flex items-center justify-center gap-1.5 bg-dark-title py-2 px-3 rounded-sm text-sm text-white hover:text-gray-medium transition-colors cursor-pointer"
                                                    onClick={() => handleAvaliar(s, podeAvaliarChecker, podeAvaliarAdmin)}
                                                >
                                                    <Check size={15} />
                                                    <span>Avaliar</span>
                                                </button>
                                            )}
                                            {mostrarBotaoDetalhes && (
                                                <button
                                                    className="flex-1 flex items-center justify-center gap-1.5 border border-font-border py-2 px-3 rounded-sm text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                                                    onClick={() => handleDetalhes(s)}
                                                >
                                                    <Eye size={15} />
                                                    <span>Detalhes</span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="px-6 py-3 border-t border-font-border">
                <span className="text-xs text-gray-medium">
                    Exibindo {solicitacoesFiltradas.length} de {solicitacoes.length} solicitações
                </span>
            </div>
        </div>
    );
}