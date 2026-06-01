import { useState, useEffect } from 'react';
import { Star, IdCard } from 'lucide-react';
import { LuGitPullRequestArrow } from "react-icons/lu";
import Sidebar from '../../components/sidebar';
import api from '../../services/api';

interface PerfilDados {
    nome: string;
    email: string;
    cargo: string;
    telefone: string;
    nivelAcesso: string;
    status: string;
    cadastradoEm: string;
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

export default function Perfil() {
    const [dados, setDados] = useState<PerfilDados | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) { setLoading(false); return; }

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            api.get(`/api/usuarios/${payload.id}`)
                .then(res => {
                    const u = res.data;
                    setDados({
                        nome: u.nome,
                        email: u.email,
                        cargo: u.cargo ?? '',
                        telefone: u.telefone ?? '',
                        nivelAcesso: mapRoleParaNivel(u.role),
                        status: u.ativo ? 'Ativo' : 'Inativo',
                        cadastradoEm: u.criado_em,
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
    const textoVazioSolicitacoes = dados.nivelAcesso === 'Administrador'
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

                        <div className="bg-white border border-font-border rounded-xl p-5">
                            <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4 flex items-center gap-1.5">
                                <LuGitPullRequestArrow size={14} /> {tituloCardSolicitacoes}
                            </p>
                            <div className="flex items-center justify-center h-32">
                                <p className="text-xs text-gray-medium text-center">{textoVazioSolicitacoes}</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}