import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Settings, CheckSquare, BookOpen } from 'lucide-react';
import type { NivelAcesso } from './ModalNovoUsuario';


export interface UsuarioEditar {
    id: number;
    nome: string;
    email: string;
    cargo: string;
    telefone: string;
    nivelAcesso: NivelAcesso;
}

interface Form {
    nome: string;
    email: string;
    cargo: string;
    telefone: string;
    nivelAcesso: NivelAcesso | '';
    novaSenha: string;
    confirmarNovaSenha: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    onSalvar: (dados: UsuarioEditar) => void;
    usuario: UsuarioEditar | null;
    emailsExistentes: string[];
}



const niveisConfig: { valor: NivelAcesso; label: string; descricao: string; icone: React.ReactNode }[] = [
    { valor: 'Administrador', label: 'Administrador', descricao: 'Acesso total', icone: <Settings size={18} className="text-gray-500" /> },
    { valor: 'Checker', label: 'Checker', descricao: 'Revisão e aprovação', icone: <CheckSquare size={18} className="text-gray-500" /> },
    { valor: 'Visualizador', label: 'Visualizador', descricao: 'Somente leitura', icone: <BookOpen size={18} className="text-gray-500" /> },
];

function NivelCard({ label, descricao, icone, selecionado, onClick }: {
    label: string; descricao: string; icone: React.ReactNode;
    selecionado: boolean; onClick: () => void;
}) {
    return (
        <button type="button" onClick={onClick}
            className={`flex-1 flex flex-col items-start gap-1 border rounded-md p-3 text-left transition-colors cursor-pointer relative
                ${selecionado ? 'border-[#73203A] bg-[#73203A]/5' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
            <span className={`absolute top-2 right-2 w-3.5 h-3.5 rounded-sm border flex items-center justify-center
                ${selecionado ? 'bg-[#73203A] border-[#73203A]' : 'border-gray-300 bg-white'}`}>
                {selecionado && (
                    <svg viewBox="0 0 10 8" className="w-2.5 h-2 fill-white">
                        <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </span>
            <span className="text-gray-500">{icone}</span>
            <span className="text-xs font-semibold text-gray-800 mt-0.5">{label}</span>
            <span className="text-[10px] text-gray-400">{descricao}</span>
        </button>
    );
}



export default function ModalEditarUsuario({ open, onClose, onSalvar, usuario, emailsExistentes }: Props) {
    const [form, setForm] = useState<Form>({
        nome: '', email: '', cargo: '', telefone: '', nivelAcesso: '', novaSenha: '', confirmarNovaSenha: ''
    });
    const [erros, setErros] = useState<Partial<Record<keyof Form, string>>>({});
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
    const [enviado, setEnviado] = useState(false);

    useEffect(() => {
        if (usuario) {
            setForm({
                nome: usuario.nome,
                email: usuario.email,
                cargo: usuario.cargo,
                telefone: usuario.telefone,
                nivelAcesso: usuario.nivelAcesso,
                novaSenha: '',
                confirmarNovaSenha: '',
            });
            setErros({});
            setEnviado(false);
        }
    }, [usuario]);

    if (!open || !usuario) return null;

    const set = (campo: keyof Form, valor: string) => {
        const novo = { ...form, [campo]: valor };
        setForm(novo);
        if (enviado) validar(novo);
    };

    const validar = (dados: Form) => {
        const e: Partial<Record<keyof Form, string>> = {};
        if (!dados.nome.trim()) e.nome = 'Nome é obrigatório.';
        if (!dados.email.trim()) {
            e.email = 'E-mail é obrigatório.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
            e.email = 'E-mail inválido.';
        } else if (dados.email.toLowerCase() !== usuario.email.toLowerCase() &&
            emailsExistentes.includes(dados.email.toLowerCase())) {
            e.email = 'Este e-mail já está cadastrado.';
        }
        if (!dados.cargo.trim()) e.cargo = 'Cargo é obrigatório.';
        if (!dados.nivelAcesso) e.nivelAcesso = 'Selecione um nível de acesso.';
        if (dados.novaSenha && dados.novaSenha.length < 8) {
            e.novaSenha = 'Mínimo de 8 caracteres.';
        }
        if (dados.novaSenha && dados.novaSenha !== dados.confirmarNovaSenha) {
            e.confirmarNovaSenha = 'As senhas não coincidem.';
        }
        setErros(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = () => {
        setEnviado(true);
        if (!validar(form)) return;
        onSalvar({
            id: usuario.id,
            nome: form.nome.trim(),
            email: form.email.trim().toLowerCase(),
            cargo: form.cargo.trim(),
            telefone: form.telefone.trim(),
            nivelAcesso: form.nivelAcesso as NivelAcesso,
        });
        onClose();
    };

    const handleClose = () => {
        setErros({});
        setEnviado(false);
        onClose();
    };

    const inputBase = (campo: keyof Form) =>
        `w-full border rounded px-3 py-2 text-sm outline-none bg-white transition-colors placeholder:text-gray-300
        ${erros[campo] ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#73203A]'}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 font-dm">

                {/* Header */}
                <div className="px-5 pt-5 pb-3 border-b border-gray-100 flex items-start justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">EDIÇÃO</p>
                        <p className="text-sm font-semibold text-gray-800">{usuario.nome}</p>
                    </div>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5">
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 py-4 flex flex-col gap-4">

                    {/* Nome */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                            NOME COMPLETO <span className="text-red-500">*</span>
                        </label>
                        <input type="text" value={form.nome}
                            onChange={e => set('nome', e.target.value)}
                            className={inputBase('nome')} />
                        {erros.nome && <p className="text-red-500 text-xs mt-0.5">{erros.nome}</p>}
                    </div>

                    {/* E-mail */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                            E-MAIL <span className="text-red-500">*</span>
                        </label>
                        <input type="email" value={form.email}
                            onChange={e => set('email', e.target.value)}
                            className={inputBase('email')} />
                        {erros.email && <p className="text-red-500 text-xs mt-0.5">{erros.email}</p>}
                    </div>

                    {/* Cargo + Telefone */}
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">CARGO</label>
                            <input type="text" value={form.cargo}
                                onChange={e => set('cargo', e.target.value)}
                                className={inputBase('cargo')} />
                            {erros.cargo && <p className="text-red-500 text-xs mt-0.5">{erros.cargo}</p>}
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">TELEFONE</label>
                            <input type="text" value={form.telefone}
                                onChange={e => set('telefone', e.target.value)}
                                className={inputBase('telefone')} />
                        </div>
                    </div>

                    {/* Nível de Acesso */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                            NÍVEL DE ACESSO <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                            {niveisConfig.map(n => (
                                <NivelCard key={n.valor} {...n}
                                    selecionado={form.nivelAcesso === n.valor}
                                    onClick={() => set('nivelAcesso', n.valor)}
                                />
                            ))}
                        </div>
                        {erros.nivelAcesso && <p className="text-red-500 text-xs mt-0.5">{erros.nivelAcesso}</p>}
                    </div>

                    {/* Nova Senha + Confirmar (opcionais na edição) */}
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">NOVA SENHA</label>
                            <div className="relative">
                                <input type={mostrarSenha ? 'text' : 'password'}
                                    placeholder="Mínimo de 8 caracteres"
                                    value={form.novaSenha} onChange={e => set('novaSenha', e.target.value)}
                                    className={`${inputBase('novaSenha')} pr-9`} />
                                <button type="button" onClick={() => setMostrarSenha(v => !v)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {mostrarSenha ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                            {erros.novaSenha && <p className="text-red-500 text-xs mt-0.5">{erros.novaSenha}</p>}
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">CONFIRMAR NOVA SENHA</label>
                            <div className="relative">
                                <input type={mostrarConfirmar ? 'text' : 'password'}
                                    placeholder="Repita a senha"
                                    value={form.confirmarNovaSenha} onChange={e => set('confirmarNovaSenha', e.target.value)}
                                    className={`${inputBase('confirmarNovaSenha')} pr-9`} />
                                <button type="button" onClick={() => setMostrarConfirmar(v => !v)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {mostrarConfirmar ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                            {erros.confirmarNovaSenha && <p className="text-red-500 text-xs mt-0.5">{erros.confirmarNovaSenha}</p>}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400">Campos com <span className="text-red-500">*</span> são obrigatórios</p>
                    <div className="flex gap-2">
                        <button onClick={handleClose}
                            className="px-4 py-1.5 text-sm text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                            Cancelar
                        </button>
                        <button onClick={handleSubmit}
                            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-white bg-[#1a1a1a] rounded hover:bg-[#73203A] transition-colors">
                            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5">
                                <path d="M13.5 2.5l-8 8-3-3" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Salvar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}