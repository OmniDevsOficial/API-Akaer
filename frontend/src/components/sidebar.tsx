import { IoReorderFour } from "react-icons/io5";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LuLayers } from "react-icons/lu";
import { HiOutlineUsers } from "react-icons/hi2";
import { BsJournalText } from "react-icons/bs";
import { useRecolher } from "../utils/functions";
import { useNavigate, useLocation, matchPath } from "react-router-dom";

export default function Sidebar() {
    const { recolher, alternar } = useRecolher();
    const navigate = useNavigate();
    const location = useLocation();

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
            rotaAtiva: ['/usuario'], // mudar quando tiver a página de usuários
            icone: <HiOutlineUsers className="text-lg" />
        }
    ];

    return (
        <aside className={`z-20 flex flex-col h-full relative bg-white border-r border-font-border p-4 transition-all duration-300 ${recolher ? "w-16" : "w-60"}`}>

            {/* Botão de Recolher */}
            <button onClick={() => alternar()}
                className="absolute -right-3 top-7 bg-white border border-font-border rounded-full p-0.5 text-gray-400 hover:text-red-akaer transition-colors z-10">
                {recolher ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Logo da plataforma */}
            <div className={`flex items-center mb-8 h-10 ${recolher ? "justify-center" : "gap-3 px-1"}`}>
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#73203A] text-white shadow-sm flex-shrink-0">
                    <LuLayers size={18} />
                </div>
                {!recolher && (
                    <div className="flex flex-col leading-none animate-fade-in truncate mt-1">
                        <span className="font-extrabold text-base tracking-tight text-dark-title">
                            Plataforma<span className="text-[#73203A]"></span>
                        </span>
                        <span className="text-[9px] font-bold text-gray-medium tracking-widest uppercase mt-0.5">
                            Normativa
                        </span>
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
                    ${isAtivo
                                    ? 'bg-[#73203A] text-white'
                                    : 'text-dark-title hover:bg-gray-medium/20 hover:text-dark-title'
                                }
                    ${recolher ? "justify-center" : ""}`}
                            title={recolher ? item.nome : undefined}
                        >
                            <span className="flex-shrink-0">{item.icone}</span>
                            {!recolher && <span>{item.nome}</span>}
                        </button>
                    )
                })}
            </nav>
        </aside >
    )
}