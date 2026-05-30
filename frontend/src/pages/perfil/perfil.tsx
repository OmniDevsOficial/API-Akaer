import { useState } from 'react';
import { Star, Pencil, Check, X } from 'lucide-react';
import Header from '../../components/header';
import Sidebar from '../../components/sidebar';
import { getUserName, getUserEmail, getUserCargo, getUserTelefone, getUserRole, getUserNivelAcesso } from '../../utils/auth';



interface PerfilDados {
    nome: string;
    email: string;
    cargo: string;
    telefone: string;
    nivelAcesso: string;
    status: string;
    cadastradoEm: string;
}


function getIniciais(nome: string) {
    return nome
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(p => p[0].toUpperCase())
        .join('');
}

function getMesAno(dataStr: string) {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const d = new Date(dataStr);
    if (isNaN(d.getTime())) return dataStr;
    return `${meses[d.getMonth()]} ${d.getFullYear()}`;
}



function Campo({ label, valor, editando, onChange }: {
    label: string;
    valor: string;
    editando?: boolean;
    onChange?: (v: string) => void;
}) {
    return (
        <div>
            <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">{label}</p>
            {editando && onChange ? (
                <input
                    type="text"
                    value={valor}
                    onChange={e => onChange(e.target.value)}
                    className="w-full border border-gray-200 focus:border-[#73203A] rounded px-3 py-2 text-sm outline-none bg-white text-dark-title transition-colors"
                />
            ) : (
                <div className="border border-font-border rounded px-3 py-2 text-sm text-dark-title bg-white">
                    {valor || <span className="text-gray-300">—</span>}
                </div>
            )}
        </div>
    );
}



function NivelBadge({ nivel }: { nivel: string }) {
    const cores: Record<string, string> = {
        Administrador: 'bg-purple-100 text-purple-700',
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
    const role = getUserRole?.() ?? '';
    const isAdmin = role?.toLowerCase() === 'admin';

    const [editando, setEditando] = useState(false);

    const [dados, setDados] = useState<PerfilDados>({
        nome: getUserName?.() ?? 'Manuel Gomes',
        email: getUserEmail?.() ?? 'gomes@gmail.com',
        cargo: getUserCargo?.() ?? 'Engenheiro de Sistemas',
        telefone: getUserTelefone?.() ?? '(20) 98820-9074',
        nivelAcesso: getUserNivelAcesso?.() ?? 'Administrador',
        status: 'Ativo',
        cadastradoEm: '2026-01-25',
    });

    const [rascunho, setRascunho] = useState<PerfilDados>(dados);

    const iniciais = getIniciais(dados.nome);

    const handleEditar = () => {
        setRascunho({ ...dados });
        setEditando(true);
    };

    const handleSalvar = () => {
        setDados({ ...rascunho });
        setEditando(false);
    };

    const handleCancelar = () => {
        setRascunho({ ...dados });
        setEditando(false);
    };

    const set = (campo: keyof PerfilDados) => (valor: string) =>
        setRascunho(prev => ({ ...prev, [campo]: valor }));

    const atual = editando ? rascunho : dados;

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#fbfbfb] font-dm">
            <Sidebar />

            <div className="flex flex-col flex-1 h-full overflow-hidden">
                <Header />

                <main className="flex-1 min-h-0 overflow-y-auto p-8">


                    <p className="text-[#73203A] font-bold text-xs tracking-widest mb-1">CONTA</p>
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-semibold text-dark-title">Meu Perfil</h1>
                        {isAdmin && !editando && (
                            <button
                                onClick={handleEditar}
                                className="flex items-center gap-1.5 font-semibold text-white text-sm bg-dark-title border border-font-border rounded-md py-2.5 px-5 cursor-pointer hover:bg-[#73203A] transition-colors">
                                <Pencil size={13} /> Editar Perfil
                            </button>
                        )}
                        {isAdmin && editando && (
                            <div className="flex gap-2">
                                <button onClick={handleCancelar}
                                    className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-md py-2 px-4 hover:bg-gray-50 transition-colors">
                                    <X size={13} /> Cancelar
                                </button>
                                <button onClick={handleSalvar}
                                    className="flex items-center gap-1.5 font-semibold text-white text-sm bg-dark-title rounded-md py-2 px-4 hover:bg-[#73203A] transition-colors">
                                    <Check size={13} /> Salvar
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Card de identidade */}
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
                                    {dados.cargo}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-medium border border-font-border rounded-full px-2.5 py-0.5 bg-green-50">
                                    <Star size={10} className="text-green-500 fill-green-400" />
                                    Membro Desde {getMesAno(dados.cadastradoEm)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid principal */}
                    <div className="grid grid-cols-3 gap-4">

                        {/* Informações pessoais */}
                        <div className="col-span-2 bg-white border border-font-border rounded-xl p-5">
                            <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4 flex items-center gap-1.5">
                                <span className="text-[#73203A]">≡</span> Informações Pessoais
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Campo label="Nome Completo" valor={atual.nome} editando={editando} onChange={set('nome')} />
                                </div>
                                <Campo label="E-mail" valor={atual.email} editando={editando} onChange={set('email')} />
                                <Campo label="Número" valor={atual.telefone} editando={editando} onChange={set('telefone')} />
                                <Campo label="Cargo" valor={atual.cargo} editando={editando} onChange={set('cargo')} />
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">Nível de Acesso</p>
                                    <div className="border border-font-border rounded px-3 py-2 text-sm bg-white">
                                        <NivelBadge nivel={atual.nivelAcesso} />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">Status</p>
                                    <div className="border border-font-border rounded px-3 py-2 text-sm bg-white flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        <span className="text-green-600 font-medium">{atual.status}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">Cadastrado Em</p>
                                    <div className="border border-font-border rounded px-3 py-2 text-sm text-dark-title bg-white">
                                        Ex: {new Date(dados.cadastradoEm).toLocaleDateString('pt-BR')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Solicitações criadas */}
                        <div className="bg-white border border-font-border rounded-xl p-5">
                            <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4 flex items-center gap-1.5">
                                <span className="text-[#73203A]">≡</span> Solicitações Criadas
                            </p>
                            <div className="flex items-center justify-center h-32">
                                <p className="text-xs text-gray-medium text-center">Nenhuma Solicitação Foi Criada por Você</p>
                            </div>
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
}