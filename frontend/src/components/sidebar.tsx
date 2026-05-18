// Importa a lib de icons do react
import { IoReorderFour } from "react-icons/io5";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
        }
    ];

    return (
        <aside className={`relative bg-white border-r border-font-border p-4 transition-all duration-300 ${recolher ? "w-16" : "w-60"}`}>
            {/* Botão de Recolher */}
            <button onClick={() => alternar()}
                className="absolute -right-3 top-6 bg-white border border-font-border rounded-full p-0.5 text-gray-400 hover:text-red-akaer transition-colors z-10">
                {recolher ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {!recolher && (<span className="text-gray-medium tracking-wide">PRINCIPAIS</span>)}

            {/* Opções Aside */}
            {itemSidebar.map((item) => {
                /* Verifica qual é a rota atual e armazena a mesma em isAtivo  */
                const isAtivo = item.rotaAtiva.some(padrao =>
                    matchPath({ path: padrao, end: false }, location.pathname)
                );

                return (
                    <button key={item.id}
                        onClick={() => navigate(item.rota)}
                        className={`flex items-center my-2 gap-2 px-3 py-2 text-left rounded-md w-full font-semibold transition-colors duration-150 ease-in-out cursor-pointer
                    ${isAtivo
                                ? 'bg-[#73203A] text-white'
                                : 'text-black hover:bg-gray-medium/20 hover:text-black'
                            }
                    ${recolher ? "justify-center" : ""}`}
                        title={recolher ? item.nome : undefined}
                    >
                        <span className="flex-shrink-0">{item.icone}</span>
                        {!recolher && <span>{item.nome}</span>}
                    </button>
                )
            })}
        </aside>
    )
}