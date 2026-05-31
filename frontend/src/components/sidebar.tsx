import { IoReorderFour } from "react-icons/io5";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { LuLayers } from "react-icons/lu";
import { HiOutlineUsers } from "react-icons/hi2";
import { BsJournalText } from "react-icons/bs";
import { useRecolher } from "../utils/functions";
import { useNavigate, useLocation, matchPath } from "react-router-dom";
import { clearAuth } from "../utils/auth";
import { useState, useEffect } from "react";
import api from "../services/api";

export default function Sidebar() {
    const { recolher, alternar } = useRecolher();
    const navigate = useNavigate();
    const location = useLocation();

    const [nomeCompleto, setNomeCompleto] = useState('Usuário');
    const [cargo, setCargo] = useState('');

    useEffect(() => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) return;
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            api.get(`/api/usuarios/${payload.id}`)
                .then(res => {
                    setNomeCompleto(res.data.nome ?? 'Usuário');
                    setCargo(res.data.cargo ?? '');
                })
                .catch(() => {});
        } catch {}
    }, []);

    const iniciais = nomeCompleto
        .split(' ').filter(Boolean).slice(0, 2)
        .map((p: string) => p[0].toUpperCase()).join('');

    const partes = nomeCompleto.trim().split(' ').filter(Boolean);
    const nomeAbreviado = partes.length >= 2
        ? `${partes[0]} ${partes[partes.length - 1][0]}.`
        : partes[0] ?? 'Usuário';

    const handleSair = () => {
        clearAuth?.();
        navigate('/');
    };

    const itemSidebar = [
        {
            id: 1,
            nome: 'Normas',
            rota: '/home',
            rotaAtiva: ['/home', `/normas/ver/:codigo`, '/normas/editar/:codigo'],
            icone: <IoReorderFour className="text-lg" />
        },
        {
            id: 2,
            nome: 'Solicitações',
            rota: '/solicitar',
            rotaAtiva: ['/solicitar'],
            icone: <BsJournalText className="text-lg" />
        },
        {
            id: 3,
            nome: 'Usuários',
            rota: '/usuario',
            rotaAtiva: ['/usuario'],
            icone: <HiOutlineUsers className="text-lg" />
        }
    ];

    return (
        <aside className={`z-20 flex flex-col h-full relative bg-white border-r border-font-border p-4 transition-all duration-300 ${recolher ? "w-16" : "w-60"}`}>

            <button onClick={() => alternar()}
                className="absolute -right-3 top-7 bg-white border border-font-border rounded-full p-0.5 text-gray-400 hover:text-red-akaer transition-colors z-10">
                {recolher ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            <div className={`flex items-center mb-8 h-10 ${recolher ? "justify-center" : "gap-3 px-1"}`}>
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#73203A] text-white shadow-sm flex-shrink-0">
                    <LuLayers size={18} />
                </div>
                {!recolher && (
                    <div className="flex flex-col leading-none animate-fade-in truncate mt-1">
                        <span className="font-extrabold text-base tracking-tight text-dark-title">Plataforma</span>
                        <span className="text-[9px] font-bold text-gray-medium tracking-widest uppercase mt-0.5">Normativa</span>
                    </div>
                )}
            </div>

            {!recolher && (<span className="text-xs font-semibold text-gray-medium tracking-widest mb-2">PRINCIPAL</span>)}

            <nav className={`flex flex-col ${recolher ? "gap-2" : ""}`}>
                {itemSidebar.map((item) => {
                    const isAtivo = item.rotaAtiva.some(padrao =>
                        matchPath({ path: padrao, end: false }, location.pathname)
                    );
                    return (
                        <button key={item.id}
                            onClick={() => navigate(item.rota)}
                            className={`flex items-center gap-2 px-3 py-2 text-left text-sm rounded-md w-full font-medium transition-colors duration-150 ease-in-out cursor-pointer
                                ${isAtivo ? 'bg-red-akaer text-white' : 'text-dark-title hover:bg-gray-medium/20 hover:text-dark-title'}
                                ${recolher ? "justify-center" : ""}`}
                            title={recolher ? item.nome : undefined}
                        >
                            <span className="flex-shrink-0">{item.icone}</span>
                            {!recolher && <span>{item.nome}</span>}
                        </button>
                    );
                })}
            </nav>

            <div className="mt-auto flex flex-col gap-1">
                {(() => {
                    const isPerfilAtivo = matchPath({ path: '/perfil', end: false }, location.pathname);
                    return (
                        <>
                            <button
                                onClick={() => navigate('/perfil')}
                                className={`flex items-center gap-2.5 w-full rounded-md px-2 py-2 border transition-colors cursor-pointer
                                    ${isPerfilAtivo
                                        ? 'border-[#73203A] bg-[#73203A]/5 shadow-sm ring-1 ring-[#73203A]/20'
                                        : 'border-font-border hover:bg-gray-medium/10'
                                    }
                                    ${recolher ? "justify-center" : ""}`}
                                title={recolher ? nomeAbreviado : undefined}
                            >
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors
                                    ${isPerfilAtivo ? 'bg-[#73203A] text-white' : 'bg-[#73203A]/15 text-[#73203A]'}`}>
                                    <span className="text-[11px] font-bold">{iniciais || '?'}</span>
                                </div>
                                {!recolher && (
                                    <div className="flex flex-col items-start leading-none truncate">
                                        <span className={`text-sm font-semibold truncate max-w-[120px] transition-colors
                                            ${isPerfilAtivo ? 'text-[#73203A]' : 'text-dark-title'}`}>
                                            {nomeAbreviado}
                                        </span>
                                        <span className="text-[10px] text-gray-medium mt-0.5 truncate max-w-[120px]">
                                            {cargo || '—'}
                                        </span>
                                    </div>
                                )}
                            </button>

                            <button
                                onClick={handleSair}
                                className={`flex items-center gap-2 px-2 py-3 w-full rounded-md text-sm text-gray-medium hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer
                                    ${recolher ? "justify-center" : ""}`}
                                title={recolher ? 'Sair da plataforma' : undefined}
                            >
                                <LogOut size={14} className="flex-shrink-0" />
                                {!recolher && <span className="text-xs font-medium">Sair da plataforma</span>}
                            </button>
                        </>
                    );
                })()}
            </div>
        </aside>
    );
}