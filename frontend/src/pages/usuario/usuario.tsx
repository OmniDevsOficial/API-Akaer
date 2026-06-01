import { useState, useEffect } from 'react';
import { Search, Pencil, RefreshCw, PowerOff, Loader2 } from 'lucide-react';
import { getUserRole } from '../../utils/auth';
import ModalNovoUsuario, { type NovoUsuarioDados, type NivelAcesso } from '../../components/ModalNovoUsuario';
import ModalEditarUsuario, { type UsuarioEditar } from '../../components/ModalEditarUsuario';
import ModalFeedback from './components/modalFeedback';
import Sidebar from '../../components/sidebar';
import api from '../../services/api';

// Interface alinhada com o Prisma schema (sem cargo/telefone)
interface UsuarioAPI {
    id: number;
    nome: string;
    email: string;
    cargo: string;      // ← remover o comentário "sem cargo/telefone"
    telefone: string | null;
    role: 'ADMIN' | 'CHECKER' | 'VISUALIZADOR';
    ativo: boolean;
    criado_em: string;
}

// Mapeamento bidirecional: Role (banco) <-> NivelAcesso (UI)
const mapRoleParaNivel = (role: UsuarioAPI['role']): NivelAcesso => {
    const mapa: Record<UsuarioAPI['role'], NivelAcesso> = {
        ADMIN: 'Administrador',
        CHECKER: 'Checker',
        VISUALIZADOR: 'Visualizador',
    };
    return mapa[role];
};

const mapNivelParaRole = (nivel: NivelAcesso): UsuarioAPI['role'] => {
    const mapa: Record<NivelAcesso, UsuarioAPI['role']> = {
        Administrador: 'ADMIN',
        Checker: 'CHECKER',
        Visualizador: 'VISUALIZADOR',
    };
    return mapa[nivel];
};

function StatusBadge({ ativo }: { ativo: boolean }) {
    return (
        <>
            <span className={`inline-block w-2 h-2 rounded-full ${ativo ? 'bg-green-500' : 'bg-red-400'}`} />
            <span className="text-sm leading-none text-gray-700">{ativo ? 'Ativo' : 'Inativo'}</span>
        </>
    );
}

export default function Usuario() {
    const role = getUserRole();
    const isAdmin = role?.toLowerCase() === 'admin';

    const [usuarios, setUsuarios] = useState<UsuarioAPI[]>([]);
    const [busca, setBusca] = useState('');
    const [loading, setLoading] = useState(true);
    const [modalNovoOpen, setModalNovoOpen] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState<UsuarioEditar | null>(null);

    const [feedback, setFeedback] = useState<{
        aberto: boolean;
        titulo: string;
        mensagem: string;
        descricao?: string;
        tipo?: 'sucesso' | 'erro';
    }>({ aberto: false, titulo: '', mensagem: '' });

    const abrirFeedback = (titulo: string, mensagem: string, descricao?: string, tipo: 'sucesso' | 'erro' = 'sucesso') => {
        setFeedback({ aberto: true, titulo, mensagem, descricao, tipo });
    };

    // Listagem (GET /api/usuarios)
    useEffect(() => {
        if (!isAdmin) return;

        const carregarUsuarios = async () => {
            try {
                setLoading(true);
                const response = await api.get('/api/usuarios');
                setUsuarios(response.data);
            } catch (error: any) {
                alert(error.response?.data?.error || 'Erro ao carregar a lista de usuários.');
            } finally {
                setLoading(false);
            }
        };

        carregarUsuarios();
    }, [isAdmin]);

    if (!isAdmin) {
        return (
            <div className="flex h-screen w-full overflow-hidden bg-[#fbfbfb] font-dm">
                <Sidebar />
                <div className="flex flex-col flex-1 h-full overflow-hidden">
                    <main className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-2xl font-semibold text-dark-title">Acesso Restrito</p>
                            <p className="text-sm text-gray-medium mt-2">Você não tem permissão para acessar esta página.</p>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    const emailsExistentes = usuarios.map(u => u.email.toLowerCase());

    // Criação (POST) conectando com a rota real feita pela equipe
    const handleSalvar = async (dados: NovoUsuarioDados) => {
        try {
            const payload = {
                nome: dados.nome,
                email: dados.email,
                role: mapNivelParaRole(dados.nivelAcesso),
                senha: dados.senha,
                cargo: dados.cargo,      // ← campo cargo real, não nivelAcesso
                telefone: dados.telefone ?? "", // ← telefone que faltava
            };
            const response = await api.post('/api/usuarios', payload);
            setUsuarios(prev => [...prev, response.data.usuario]);
            setModalNovoOpen(false);
            abrirFeedback('Novo Usuário', 'Usuário cadastrado com sucesso!', 'O novo acesso já está disponível na plataforma.');
        } catch (error: any) {
            abrirFeedback('Novo Usuário', 'Erro ao cadastrar usuário.', error.response?.data?.error, 'erro');
        }
    };

    // handleEditar — adicionar telefone, senha e corrigir cargo
    const handleEditar = async (dados: UsuarioEditar) => {
        try {
            const payload = {
                nome: dados.nome,
                role: mapNivelParaRole(dados.nivelAcesso),
                cargo: dados.cargo,
                telefone: dados.telefone ?? "",
                ...(dados.senha ? { senha: dados.senha } : {}),
            };

            const response = await api.put(`/api/usuarios/${dados.id}`, payload);
            const usuarioAtualizado: UsuarioAPI = response.data.usuario;

            setUsuarios(prev =>
                prev.map(u =>
                    u.id === dados.id
                        ? { ...u, nome: usuarioAtualizado.nome, role: usuarioAtualizado.role }
                        : u
                )
            );
            setUsuarioEditando(null);
            abrirFeedback('Editar Usuário', response.data.message || 'Usuário atualizado com sucesso!', 'As informações foram salvas no banco de dados.');
        } catch (error: any) {
            abrirFeedback('Editar Usuário', 'Erro ao atualizar usuário.', error.response?.data?.error, 'erro');
        }
    };


    // Status (PATCH /api/usuarios/:id/status)
    const toggleStatus = async (id: number, ativoAtual: boolean) => {
        const acao = ativoAtual ? 'desativar' : 'reativar';
        if (!window.confirm(`Deseja ${acao} este usuário?`)) return;

        try {
            const response = await api.patch(`/api/usuarios/${id}/status`);
            const usuarioAtualizado: UsuarioAPI = response.data.usuario;

            // Reflete o novo status na interface
            setUsuarios(prev =>
                prev.map(u =>
                    u.id === id ? { ...u, ativo: usuarioAtualizado.ativo } : u
                )
            );
            abrirFeedback(
                'Status do Usuário',
                `Usuário ${acao === 'desativar' ? 'desativado' : 'reativado'} com sucesso!`,
                response.data.message
            );
        } catch (error: any) {
            abrirFeedback('Status do Usuário', `Erro ao ${acao} usuário.`, error.response?.data?.error, 'erro');
        }
    };

    const abrirEditar = (u: UsuarioAPI) => {
        setUsuarioEditando({
            id: u.id,
            nome: u.nome,
            email: u.email,
            nivelAcesso: mapRoleParaNivel(u.role),
            cargo: u.cargo,
            telefone: u.telefone ?? '',
        });
    };

    const filtrados = usuarios.filter(u =>
        u.nome.toLowerCase().includes(busca.toLowerCase()) ||
        u.email.toLowerCase().includes(busca.toLowerCase())
    );

    const contadores: Record<NivelAcesso, number> = { Administrador: 0, Checker: 0, Visualizador: 0 };
    usuarios.forEach(u => { contadores[mapRoleParaNivel(u.role)]++; });

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#fbfbfb] font-dm">
            <Sidebar />

            <div className="flex flex-col flex-1 h-full overflow-hidden">

                <main className="flex-1 min-h-0 overflow-y-auto p-8">
                    <p className="text-[#73203A] font-bold text-xs tracking-widest mb-2">GERENCIAMENTO</p>

                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-dark-title">Usuários</h1>
                            <span className="text-sm text-gray-medium">Gerencie os acessos e perfis da plataforma</span>
                        </div>
                        <button
                            onClick={() => setModalNovoOpen(true)}
                            className="flex items-center gap-1.5 font-semibold text-white text-sm bg-dark-title border border-font-border rounded-md py-2.5 px-5 cursor-pointer"
                        >
                            <span className="text-base leading-none">+</span> Novo Usuário
                        </button>
                    </div>

                    <div className="grid grid-cols-[1fr_auto] gap-4 mb-4 items-center">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nome ou e-mail"
                                value={busca}
                                onChange={e => setBusca(e.target.value)}
                                className="w-full border border-font-border rounded-md pl-8 pr-3 py-2 text-sm outline-none focus:border-[#73203A] bg-white"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-4 text-xs text-gray-medium">
                            {(Object.entries(contadores) as [NivelAcesso, number][]).map(([nivel, qtd]) => (
                                <span key={nivel}>
                                    <span className="text-dark-title font-semibold">+{qtd}</span>{' '}{nivel}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="border border-font-border rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-font-border">
                                    <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3 w-10">#</th>
                                    <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">NOME</th>
                                    <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">EMAIL</th>
                                    <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">NÍVEL DE ACESSO</th>
                                    <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">STATUS</th>
                                    <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-gray-medium">
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 size={16} className="animate-spin" />
                                                <span>Carregando usuários...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtrados.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-medium">
                                            Nenhum usuário encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    filtrados.map(u => (
                                        <tr key={u.id} className="border-b border-font-border last:border-none hover:bg-red-50/60 transition-colors bg-white">
                                            <td className="px-6 py-4 text-sm text-red-akaer font-semibold">{u.id}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">{u.nome}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{u.email}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{mapRoleParaNivel(u.role)}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                                                    <StatusBadge ativo={u.ativo} />
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <button
                                                        onClick={() => abrirEditar(u)}
                                                        className="flex items-center gap-1 text-sm text-gray-700 hover:text-red-akaer transition-colors cursor-pointer"
                                                    >
                                                        <Pencil size={14} /> Editar
                                                    </button>
                                                    <button
                                                        onClick={() => toggleStatus(u.id, u.ativo)}
                                                        className={`flex items-center gap-1 text-sm transition-colors cursor-pointer ${u.ativo ? 'text-gray-700 hover:text-red-akaer' : 'text-gray-700 hover:text-green-600'}`}
                                                    >
                                                        {u.ativo
                                                            ? <><PowerOff size={14} /> Desativar</>
                                                            : <><RefreshCw size={14} /> Reativar</>
                                                        }
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        <div className="px-6 py-3 text-xs text-gray-medium border-t border-font-border">
                            Exibindo {filtrados.length} de {usuarios.length} Usuários
                        </div>
                    </div>
                </main>
            </div>

            <ModalNovoUsuario
                open={modalNovoOpen}
                onClose={() => setModalNovoOpen(false)}
                onSalvar={handleSalvar}
                emailsExistentes={emailsExistentes}
            />

            <ModalEditarUsuario
                open={usuarioEditando !== null}
                onClose={() => setUsuarioEditando(null)}
                onSalvar={handleEditar}
                usuario={usuarioEditando}
                emailsExistentes={emailsExistentes}
            />

            <ModalFeedback
                open={feedback.aberto}
                onClose={() => setFeedback(prev => ({ ...prev, aberto: false }))}
                titulo={feedback.titulo}
                mensagem={feedback.mensagem}
                descricao={feedback.descricao}
                tipo={feedback.tipo}
            />
        </div>
    );
}