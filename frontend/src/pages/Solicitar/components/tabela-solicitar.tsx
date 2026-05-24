import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { getUserRole } from "@/utils/auth";
import type { FiltrosSelecionados } from "@/components/FilterAside/FilterAside";
import { Eye } from "lucide-react";
import ModalAvaliacaoChecker from "./modalAvaliacaoChecker";
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

export interface TabelaSolicitarProps {
    refreshTrigger?: number;
    searchText?: string;
    filtros?: FiltrosSelecionados;
    filtroStatus?: string;
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
        'aprovada': 'bg-green-500',
        'concluida': 'bg-green-500',
        'reprovada': 'bg-red-akaer',
    };
    return corStatus[status.toLowerCase()] ?? 'bg-gray-300';
};

export default function TabelaSolicitar({
    filtroStatus = "todas",
    searchText = "",
    refreshTrigger,
}: TabelaSolicitarProps) {
    const role = getUserRole();
    const isAdmin = role?.toLowerCase() === 'admin';
    const isChecker = role?.toLowerCase() === 'checker';
    const mostraColunas = isAdmin || isChecker;

    const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
    const [carregando, setCarregando] = useState(true);

    const [modalCheckerAberto, setModalCheckerAberto] = useState(false);
    const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<Solicitacao | null>(null);
    // Adiciona estado separado pro modal de detalhes do admin
    const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
    const [solicitacaoDetalhes, setSolicitacaoDetalhes] = useState<Solicitacao | null>(null);

    useEffect(() => {
        let ativo = true;

        const carregarSolicitacoes = async () => {
            setCarregando(true);
            try {
                const statusParam = STATUS_PARAM_MAP[filtroStatus.toLowerCase()];
                const response = await api.get<SolicitacaoApi[]>("/solicitacoes", {
                    params: statusParam ? { status: statusParam } : undefined,
                });

                if (!ativo) return;

                const dados = response.data.map((solicitacao) => ({
                    id: solicitacao.id,
                    tipo: TIPO_LABEL_MAP[solicitacao.tipo_solicitacao] ?? solicitacao.tipo_solicitacao,
                    criador: solicitacao.nome,
                    cargo: solicitacao.role,
                    status: solicitacao.status,
                    data_criacao: solicitacao.data_criacao,
                }));

                setSolicitacoes(dados);
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

            <table className="w-full">
                <thead>
                    <tr className="border-b border-font-border">
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">#</th>
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">TIPO</th>
                        {mostraColunas && <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">CRIADOR</th>}
                        {mostraColunas && <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">CARGO</th>}
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">STATUS</th>
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">DATA DE CRIAÇÃO</th>
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">AÇÕES</th>
                    </tr>
                </thead>

                <tbody>
                    {carregando ? (
                        <tr>
                            <td colSpan={mostraColunas ? 7 : 5} className="px-6 py-6 text-sm text-gray-medium text-center">Carregando solicitações...</td>
                        </tr>
                    ) : solicitacoesFiltradas.length === 0 ? (
                        <tr>
                            <td colSpan={mostraColunas ? 7 : 5} className="px-6 py-6 text-sm text-gray-medium text-center">Nenhuma solicitação encontrada.</td>
                        </tr>
                    ) : (
                        solicitacoesFiltradas.map((s) => {
                            const podeAvaliarChecker = isChecker && s.status.toLowerCase() === 'pendente';
                            const podeAvaliarAdmin = isAdmin && s.status.toLowerCase() === 'aprovada';
                            const mostrarBotaoAvaliar = podeAvaliarChecker || podeAvaliarAdmin;
                            const mostrarBotaoDetalhes = isAdmin && !podeAvaliarAdmin;

                            return (
                                <tr
                                    key={s.id}
                                    className="border-b border-font-border last:border-none hover:bg-red-50/60 transition-colors"
                                >
                                    <td className="px-6 py-4 text-sm text-red-akaer font-semibold">{s.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{s.tipo}</td>
                                    {mostraColunas && <td className="px-6 py-4 text-sm text-gray-700">{s.criador}</td>}
                                    {mostraColunas && <td className="px-6 py-4 text-sm text-gray-700">{s.cargo}</td>}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${statusColorClass(s.status)}`} />
                                            <span className="text-sm leading-none text-gray-700">{s.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {new Date(s.data_criacao).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        {mostrarBotaoAvaliar && (
                                            <button
                                                className="flex items-center gap-1.5 bg-dark-title py-1.5 px-3 rounded-sm text-sm text-white hover:text-gray-medium transition-colors cursor-pointer"
                                                onClick={() => {
                                                    if (podeAvaliarChecker) {
                                                        setSolicitacaoSelecionada(s);
                                                        setModalCheckerAberto(true);
                                                    }
                                                    if (podeAvaliarAdmin && s.status != 'aprovada') {
                                                        // .
                                                    }
                                                }}
                                            >
                                                <Check size={15} />
                                                <span>Avaliar</span>
                                            </button>
                                        )}
                                        {mostrarBotaoDetalhes && (
                                            <button className="flex items-center gap-1.5 border border-font-border py-1.5 px-3 rounded-sm text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                                                onClick={() => {
                                                    setSolicitacaoDetalhes(s);
                                                    setModalDetalhesAberto(true);
                                                }}
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

            <div className="px-6 py-3 border-t border-font-border">
                <span className="text-xs text-gray-medium">
                    Exibindo {solicitacoesFiltradas.length} de {solicitacoes.length} solicitações
                </span>
            </div>
        </div>
    );
}