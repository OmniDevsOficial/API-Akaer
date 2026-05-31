import { useState } from 'react';
import { Search, Pencil, RefreshCw, PowerOff } from 'lucide-react';
import { getUserRole } from '../../utils/auth';
import Header from '../../components/header';
import Sidebar from '../../components/sidebar';
import ModalNovoUsuario, { type NovoUsuarioDados, type NivelAcesso } from '../../components/ModalNovoUsuario';
import ModalEditarUsuario, { type UsuarioEditar } from '../../components/ModalEditarUsuario';



type Status = 'Ativo' | 'Inativo';

interface Usuario {
    id: number;
    nome: string;
    email: string;
    cargo: string;
    telefone: string;
    nivelAcesso: NivelAcesso;
    status: Status;
}

//Mock

const usuariosIniciais: Usuario[] = [
    { id: 1, nome: 'MANUEL GOMES', email: 'gomes@gmail.com', cargo: 'Engenheiro', telefone: '(21) 98820-3074', nivelAcesso: 'Administrador', status: 'Ativo' },
    { id: 2, nome: 'ANA JÚLIA', email: 'julia.ana@gmail.com', cargo: 'Projetista', telefone: '', nivelAcesso: 'Visualizador', status: 'Inativo' },
    { id: 3, nome: 'GABRIEL', email: 'luis.gabriel@gmail.com', cargo: 'Engenheiro', telefone: '', nivelAcesso: 'Checker', status: 'Ativo' },
];



function StatusBadge({ status }: { status: Status }) {
    return (
        <span className={`flex items-center gap-1 text-xs font-medium ${status === 'Ativo' ? 'text-green-600' : 'text-red-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'Ativo' ? 'bg-green-500' : 'bg-red-400'}`} />
            {status}
        </span>
    );
}



export default function Usuario() {
    const role = getUserRole();
    const isAdmin = role?.toLowerCase() === 'admin';

    const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosIniciais);
    const [busca, setBusca] = useState('');
    const [modalNovoOpen, setModalNovoOpen] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState<UsuarioEditar | null>(null);

    if (!isAdmin) {
        return (
            <div className="flex h-screen w-full overflow-hidden bg-[#fbfbfb] font-dm">
                <Sidebar />
                <div className="flex flex-col flex-1 h-full overflow-hidden">
                    <Header />
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

    const handleSalvar = (dados: NovoUsuarioDados) => {
        const novo: Usuario = { id: usuarios.length + 1, status: 'Ativo', ...dados };
        setUsuarios(prev => [...prev, novo]);
    };

    const handleEditar = (dados: UsuarioEditar) => {
        setUsuarios(prev => prev.map(u => u.id === dados.id ? { ...u, ...dados } : u));
    };

    const toggleStatus = (id: number) => {
        setUsuarios(prev =>
            prev.map(u => u.id === id ? { ...u, status: u.status === 'Ativo' ? 'Inativo' : 'Ativo' } : u)
        );
    };

    const abrirEditar = (u: Usuario) => {
        setUsuarioEditando({ id: u.id, nome: u.nome, email: u.email, cargo: u.cargo, telefone: u.telefone, nivelAcesso: u.nivelAcesso });
    };

    const filtrados = usuarios.filter(u =>
        u.nome.toLowerCase().includes(busca.toLowerCase()) ||
        u.email.toLowerCase().includes(busca.toLowerCase())
    );

    const contadores: Record<NivelAcesso, number> = { Administrador: 0, Checker: 0, Visualizador: 0 };
    usuarios.forEach(u => { if (u.nivelAcesso in contadores) contadores[u.nivelAcesso]++; });

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#fbfbfb] font-dm">
            <Sidebar />

            <div className="flex flex-col flex-1 h-full overflow-hidden">
                <Header />

                <main className="flex-1 min-h-0 overflow-y-auto p-8">
                    <p className="text-[#73203A] font-bold text-xs tracking-widest mb-2">GERENCIAMENTO</p>

                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-dark-title">Usuários</h1>
                            <span className="text-sm text-gray-medium">Gerencie os acessos e perfis da plataforma</span>
                        </div>
                        <button onClick={() => setModalNovoOpen(true)}
                            className="flex items-center gap-1.5 font-semibold text-white text-sm bg-dark-title border border-font-border rounded-md py-2.5 px-5 cursor-pointer">
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
                            {(Object.entries(contadores) as [NivelAcesso, number][]).map(
                                ([nivel, qtd]) => (
                                    <span key={nivel}>
                                        <span className="text-dark-title font-semibold">+{qtd}</span>{" "}
                                        {nivel}
                                    </span>
                                )
                            )}
                        </div>
                    </div>

                    <div className="bg-white border border-font-border rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-font-border">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-medium w-10">#</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-medium">NOME</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-medium">EMAIL</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-medium">CARGO</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-medium">NÍVEL DE ACESSO</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-medium">STATUS</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-medium">AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtrados.map((u) => (
                                    <tr key={u.id} className="border-b border-font-border hover:bg-gray-50/60 transition-colors">
                                        <td className="px-4 py-3 font-semibold text-red-akaer">{u.id}</td>
                                        <td className="px-4 py-3 font-semibold text-dark-title">{u.nome}</td>
                                        <td className="px-4 py-3 text-gray-medium">{u.email}</td>
                                        <td className="px-4 py-3 text-dark-title">{u.cargo}</td>
                                        <td className="px-4 py-3 text-dark-title">{u.nivelAcesso}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100/40 text-gray-500 border border-gray-200">
                                                <StatusBadge status={u.status} />
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-1">
                                                <button onClick={() => abrirEditar(u)}
                                                    className="flex items-center gap-1 text-xs text-gray-medium hover:text-[#73203A] transition-colors">
                                                    <Pencil size={11} /> Editar
                                                </button>
                                                <button onClick={() => toggleStatus(u.id)}
                                                    className={`flex items-center gap-1 text-xs transition-colors ${u.status === 'Ativo' ? 'text-gray-medium hover:text-red-500' : 'text-gray-medium hover:text-green-600'}`}>
                                                    {u.status === 'Ativo'
                                                        ? <><PowerOff size={11} /> Desativar</>
                                                        : <><RefreshCw size={11} /> Reativar</>}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="px-4 py-3 text-xs text-gray-medium">
                            <span className='text-xs text-gray-medium'>
                                Exibindo {filtrados.length} de {usuarios.length} Usuários
                            </span>
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
        </div>
    );
}