import { useState, useEffect } from 'react';
import { Star, IdCard } from 'lucide-react';
import { LuGitPullRequestArrow } from "react-icons/lu";
import { Link } from "react-router-dom";
import Sidebar from '../../components/sidebar';
import api from '../../services/api';

interface NormaOuSolicitacao {
    id: number;
    titulo?: string;
    codigo?: string;
    tipo_solicitacao?: string;
    norma_id?: string;
    status?: string;
    data_publicacao?: string;
    data_criacao?: string;
    is_vigente?: boolean;
}

interface PerfilDados {
    nome: string;
    email: string;
    cargo: string;
    telefone: string;
    nivelAcesso: string;
    status: string;
    cadastradoEm: string;
    normas?: NormaOuSolicitacao[];
    solicitacoes?: NormaOuSolicitacao[];
}

type RoleAPI = 'ADMIN' | 'CHECKER' | 'VISUALIZADOR';

const mapRoleParaNivel = (role: RoleAPI): string => {
    const mapa: Record<RoleAPI, string> = {
        ADMIN: 'Administrador',
        CHECKER: 'Checker',
        VISUALIZADOR: 'Visualizador',
    };
    return mapa[role] ?? role;
};

function getIniciais(nome: string) {
    return nome.split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('');
}

function getMesAno(dataStr: string) {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const d = new Date(dataStr);
    if (isNaN(d.getTime())) return dataStr;
    return `${meses[d.getMonth()]} ${d.getFullYear()}`;
}

function Campo({ label, valor }: { label: string; valor: string }) {
    return (
        <div>
            <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">{label}</p>
            <div className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-white text-dark-title">
                {valor || '—'}
            </div>
        </div>
    );
}

function NivelBadge({ nivel }: { nivel: string }) {
    const cores: Record<string, string> = {
        Administrador: 'bg-purple-100 text-purple-700 border border-purple-500',
        Checker: 'bg-blue-100 text-blue-700',
        Visualizador: 'bg-gray-100 text-gray-600',
    };
    return (
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cores[nivel] ?? 'bg-gray-100 text-gray-600'}`}>
            {nivel}
        </span>
    );
}

/* Retorna os dados do perfil */
export default function Perfil() {
    const [dados, setDados] = useState<PerfilDados | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) { setLoading(false); return; }

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            api.get(`/api/usuarios/${payload.id}`)
                .then(async res => {
                    const u = res.data;
                    const nivel = mapRoleParaNivel(u.role);

                    // Buscar normas e solicitações do usuário
                    let normas, solicitacoes;
                    if (nivel === 'Administrador') {
                        const resNormas = await api.get(`/api/usuarios/${u.id}/normas`);
                        normas = resNormas.data;
                    } else {
                        const r = await api.get(`/api/usuarios/${payload.id}/solicitacoes`);
                        solicitacoes = r.data;
                    }

                    setDados({
                        nome: u.nome,
                        email: u.email,
                        cargo: u.cargo ?? '',
                        telefone: u.telefone ?? '',
                        nivelAcesso: nivel,
                        status: u.ativo ? 'Ativo' : 'Inativo',
                        cadastradoEm: u.criado_em,
                        normas,
                        solicitacoes,
                    });
                })
                .catch(() => alert('Erro ao carregar dados do perfil.'))
                .finally(() => setLoading(false));
        } catch {
            setLoading(false);
        }
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen w-full overflow-hidden bg-[#fbfbfb] font-dm">
                <Sidebar />
                <div className="flex flex-1 items-center justify-center">
                    <p className="text-sm text-gray-400">Carregando perfil...</p>
                </div>
            </div>
        );
    }

    if (!dados) return null;

    const iniciais = getIniciais(dados.nome);
    const tituloCardSolicitacoes = dados.nivelAcesso === 'Administrador' ? 'Normas Cadastradas' : 'Solicitações Criadas';
    const textoVazioSolicitacoes = dados.nivelAcesso === 'Administrador' || dados.nivelAcesso === 'Visualizador' || dados.nivelAcesso === 'Checker'
        ? 'Nenhuma Norma Foi Cadastrada Por Você'
        : 'Nenhuma Solicitação Foi Criada por Você';

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#fbfbfb] font-dm">
            <Sidebar />
            <div className="flex flex-col flex-1 h-full overflow-hidden">
                <main className="flex-1 min-h-0 overflow-y-auto p-8">
                    <p className="text-[#73203A] font-bold text-xs tracking-widest mb-1">CONTA</p>
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-semibold text-dark-title">Meu Perfil</h1>
                    </div>

                    <div className="bg-white border border-font-border rounded-xl p-5 mb-4 flex items-center gap-5">
                        <div className="w-14 h-14 rounded-xl bg-[#73203A] flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-lg font-bold">{iniciais}</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-base font-bold text-dark-title uppercase tracking-wide">{dados.nome}</p>
                            <p className="text-xs text-gray-medium -mt-1">{dados.email}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                                <NivelBadge nivel={dados.nivelAcesso} />
                                <div className="flex items-center gap-1 text-xs text-gray-medium border border-font-border rounded-full px-2.5 py-0.5">
                                    <Star size={10} className="text-yellow-400 fill-yellow-400" />
                                    {dados.cargo || '—'}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-green-700 border border-green-500 rounded-full px-2.5 py-0.5 bg-green-50">
                                    <Star size={10} className="text-green-500 fill-green-400" />
                                    Membro Desde {getMesAno(dados.cadastradoEm)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 bg-white border border-font-border rounded-xl p-5">
                            <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4 flex items-center gap-1.5">
                                <IdCard size={14} /> Informações Pessoais
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Campo label="Nome Completo" valor={dados.nome} />
                                </div>
                                <Campo label="E-mail" valor={dados.email} />
                                <Campo label="Número" valor={dados.telefone} />
                                <Campo label="Cargo" valor={dados.cargo} />
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">Nível de Acesso</p>
                                    <div className="border border-font-border rounded px-3 py-2 text-sm bg-white">
                                        <NivelBadge nivel={dados.nivelAcesso} />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">Status</p>
                                    <div className="border border-font-border rounded px-3 py-2 text-sm bg-white flex items-center gap-1.5">
                                        <span className={`w-1.5 h-1.5 rounded-full ${dados.status === 'Ativo' ? 'bg-green-500' : 'bg-red-400'}`} />
                                        <span className={`font-medium ${dados.status === 'Ativo' ? 'text-green-600' : 'text-red-500'}`}>{dados.status}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">Cadastrado Em</p>
                                    <div className="border border-font-border rounded px-3 py-2 text-sm text-dark-title bg-white">
                                        {new Date(dados.cadastradoEm).toLocaleDateString('pt-BR')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card de Normas e Solicitações */}
                        <div className="bg-white border border-font-border rounded-xl p-5">
                            {/* Título do Card */}
                            <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4 flex items-center gap-1.5">
                                <LuGitPullRequestArrow size={14} /> {tituloCardSolicitacoes}
                            </p>

                            {/* Lista de Normas e Solicitações */}
                            {((dados.normas?.length ?? 0) > 0 || (dados.solicitacoes?.length ?? 0) > 0) ? (
                                <ul className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                                    {(dados.normas ?? dados.solicitacoes ?? []).map((item: NormaOuSolicitacao, i: number) => (
                                        <li key={i}
                                            className="flex items-center justify-between gap-2 rounded-lg border border-font-border bg-[#fafafa] px-3 py-2.5 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                {/* Número de ordenação da Norma */}
                                                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-md bg-[#73203A]/10 flex items-center justify-center">
                                                    <span className="text-[9px] font-bold text-[#73203A]">{i + 1}</span>
                                                </span>

                                                {/* Permite navegar para a página de visualização da norma ou solicitação */}
                                                <Link to={`/normas/ver/${item.codigo}`}
                                                    className="text-xs font-medium text-dark-title leading-snug truncate hover:text-[#73203A] transition-colors"
                                                >
                                                    {item.titulo ?? item.tipo_solicitacao ?? `Item ${i + 1}`}
                                                </Link>
                                            </div>

                                            {/* Código da Norma */}
                                            {(item.codigo ?? item.norma_id) && (
                                                <span className="flex-shrink-0 text-[10px] font-semibold text-[#73203A] bg-[#73203A]/10 px-2 py-0.5 rounded-full">
                                                    {item.codigo ?? item.norma_id}
                                                </span>
                                            )}
                                        </li>

                                    ))}
                                </ul>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-32 gap-2">
                                    <p className="text-xs text-gray-medium text-center leading-relaxed">
                                        {textoVazioSolicitacoes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}