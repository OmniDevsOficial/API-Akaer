// Importa a lib de icons do react
import { useState } from "react";
import { IoReorderFour } from "react-icons/io5";
import { ChevronLeft, ChevronRight } from "lucide-react";


export default function Sidebar() {
    const [recolher, setRecolher] = useState(false)

    const itemSidebar = [
        { id: 1, nome: 'Normas', icone: <IoReorderFour className="text-lg" />, ativo: true },
    ];

    return (
        <aside className={`relative bg-white border-r border-font-border p-4 transition-all duration-300 ${recolher ? "w-16" : "w-60"}`}>
            {/* Botão de Recolher */}
            <button onClick={() => setRecolher(!recolher)}
                className="absolute -right-3 top-6 bg-white border border-font-border rounded-full p-0.5 text-gray-400 hover:text-red-akaer transition-colors z-10">
                {recolher ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {!recolher && (<span className="text-gray-medium tracking-wide">PRINCIPAIS</span>)}

            {/* Opções Aside */}
            {itemSidebar.map((item) => (
                <button key={item.id}
                    className={`flex items-center my-2 gap-2 px-3 py-2 text-left rounded-md w-full font-semibold transition-colors cursor-pointer
                    ${item.ativo ? 'bg-[#73203A] text-white' : 'text-black hover:bg-[#73203a] hover:text-white'}
                    ${recolher ? "justify-center" : ""}`}
                    title={recolher ? item.nome : undefined}
                >
                    <span className="flex-shrink-0">{item.icone}</span>
                    {!recolher && <span>{item.nome}</span>}
                </button>
            ))}
        </aside>
    )
}