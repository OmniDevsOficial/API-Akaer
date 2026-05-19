import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { getUserRole } from '@/utils/auth';
/* import { useNavigate } from "react-router-dom"; */
import type { FiltrosSelecionados } from "@/components/FilterAside/FilterAside";

// INTEGRAÇÃO: reflete o contrato esperado do endpoint /solicitar
export interface Solicitacao {
    id: number;
    tipo: string;
    criador: string;
    cargo: string;
    status: string;
    data_criacao: string; // não sei se está vindo formatado, tem que conferir
}

// remover mock quando endpoint /solicitar estiver disponível para integração
// Substituir por: const data = await api.get('/solicitar');
const dado_moa: Solicitacao[] = [
    { id: 1, tipo: 'Revisão', criador: 'João Silva', cargo: 'Engenheiro', status: 'Pendente', data_criacao: '2024-05-01T10:00:00Z' },
    { id: 2, tipo: 'Cadastro', criador: 'Ana Souza', cargo: 'Analista', status: 'Aprovada', data_criacao: '2024-05-03T14:30:00Z' },
    { id: 3, tipo: 'Cancelamento', criador: 'Pedro Lima', cargo: 'Técnico', status: 'Reprovada', data_criacao: '2024-05-06T09:00:00Z' },
];

export interface TabelaSolicitarProps {
    refreshTrigger?: number;
    searchText?: string;
    filtros?: FiltrosSelecionados;
    filtroStatus?: string;
}

const statusColorClass = (status: string) => {
    const corStatus: Record<string, string> = {
        'pendente': 'bg-gray-500',
        'aprovada': 'bg-green-500',
        'concluida': 'bg-green-500',
        'reprovada': 'bg-red-akaer',
    };
    return corStatus[status.toLowerCase()] ?? 'bg-gray-300';
};

export default function TabelaSolicitar({ filtroStatus = 'todas', searchText = '', }: TabelaSolicitarProps) {
    const role = getUserRole();
    const isAdmin = role?.toLowerCase() === 'admin';
    /* const navigate = useNavigate(); */
    const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        setCarregando(true);
        // substituir por chamada ao endpoint /solicitar
        setTimeout(() => {
            setSolicitacoes(dado_moa);
            setCarregando(false);
        }, 300);
    }, []);

    const solicitacoesFiltradas = solicitacoes
        .filter((s) => filtroStatus === 'todas' || s.status.toLowerCase() === filtroStatus)
        .filter((s) =>
            !searchText.trim() ||
            s.criador.toLowerCase().includes(searchText.toLowerCase()) ||
            s.tipo.toLowerCase().includes(searchText.toLowerCase())
        );

    return (
        <div className="border border-font-border rounded-lg overflow-hidden">
            <table className="w-full">
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
                            <td colSpan={7} className="px-6 py-6 text-sm text-gray-medium text-center">Carregando solicitações...</td>
                        </tr>
                    ) : solicitacoesFiltradas.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-6 text-sm text-gray-medium text-center">Nenhuma solicitação encontrada.</td>
                        </tr>
                    ) : solicitacoesFiltradas.map((s) => (
                        <tr
                            key={s.id}
                            className="border-b border-font-border last:border-none hover:bg-red-50/60 transition-colors"
                        >
                            <td className="px-6 py-4 text-sm text-red-akaer font-semibold">{s.id}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{s.tipo}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{s.criador}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{s.cargo}</td>
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
                                {isAdmin && (
                                    <button
                                        className="flex items-center gap-1.5 bg-dark-title py-1.5 px-3 rounded-sm text-sm text-white hover:text-gray-medium transition-colors cursor-pointer"
                                        onClick={() => { }}
                                    >
                                        <Check size={15} />
                                        <span>Avaliar</span>
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
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