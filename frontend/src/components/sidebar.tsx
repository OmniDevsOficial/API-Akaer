// Importa a lib de icons do react
import { IoReorderFour } from "react-icons/io5";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LuLogOut } from "react-icons/lu";
import { FiUser } from "react-icons/fi";
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
            // matchPath interpreta :codigo como parâmetro dinâmico automaticamente
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
        <aside className={`flex flex-col min-h-full relative bg-white border-r border-font-border p-4 transition-all duration-300 ${recolher ? "w-16" : "w-60"}`}>
            {/* Botão de Recolher */}
            <button onClick={() => alternar()}
                className="absolute -right-3 top-6 bg-white border border-font-border rounded-full p-0.5 text-gray-400 hover:text-red-akaer transition-colors z-10">
                {recolher ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>


            {!recolher && (<span className="text-xs font-semibold text-gray-medium tracking-widest mb-2">PRINCIPAL</span>)}

            {/* Opções Aside */}
            <nav className={`flex flex-col ${recolher ? "gap-2" : ""}`}>
                {itemSidebar.map((item) => {
                    /* Verifica qual é a rota atual e armazena a mesma em isAtivo  */
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

            {/* Footer do Aside */}
            <div className={`mt-auto border-t border-font-border pt-2 flex flex-col ${recolher ? "gap-2" : ""}`}>
                {/* Botão de perfil */}
                <button onClick={() => navigate('/perfil')}
                    className={`flex items-center gap-2 px-3 py-2 text-left text-sm rounded-md w-full font-medium text-dark-title hover:bg-gray-medium/35 transition-colors ${recolher ? "justify-center" : ""}`}
                >
                    <span className="flex-shrink-0 flex items-center justify-center">
                        <FiUser className="text-sm" />
                    </span>
                    {!recolher && <span>Meu Perfil</span>}
                </button>

                {/* Botão de sair */}
                <button onClick={() => navigate('/')}
                    className={`flex items-center gap-2 px-3 py-2 text-left text-sm rounded-md w-full font-medium text-dark-title hover:bg-red-100 transition-colors ${recolher ? "justify-center" : ""}`}
                >
                    <span className="flex-shrink-0 flex items-center justify-center">
                        <LuLogOut className="text-sm" />
                    </span>
                    {!recolher && <span>Sair</span>}
                </button>
            </div>

        </aside>
    )
}