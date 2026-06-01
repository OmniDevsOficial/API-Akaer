import { useState, useEffect, useRef } from "react";
import { IoMdSearch } from "react-icons/io";
import { BiSortAlt2 } from "react-icons/bi";

interface BarraPesquisaProps {
    busca: string;
    onBuscaChange: (value: string) => void;
    onOpenFilters: () => void;
    filtrosAtivos: boolean;
    titulo?: string;
    onOrdenar: (tipo: 'recentes' | 'antigas' | 'az' | 'za') => void;
    ordemAtual: 'recentes' | 'antigas' | 'az' | 'za';
}

export default function Barra_pesquisa({ busca, onBuscaChange, onOpenFilters, filtrosAtivos, onOrdenar, ordemAtual }: BarraPesquisaProps) {
    const [menuAberto, setMenuAberto] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Pergunta se a ordem for diferente de "recentes" (que é o padrão)
    const ordenacaoAtiva = ordemAtual !== 'recentes';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuAberto && dropdownRef.current && dropdownRef.current.contains(event.target as Node)) {
                setMenuAberto(false);
            }
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuAberto]);

    const handleEscolherOrdem = (tipo: 'recentes' | 'antigas' | 'az' | 'za') => {
        onOrdenar(tipo);
        setMenuAberto(false);
    };

    // Função para estilizar as opções dentro do Dropdown
    const getEstiloOpcao = (tipo: string) => {
        return `text-left px-3 py-2 rounded-md transition-colors ${ordemAtual === tipo
            ? "bg-red-akaer/10 text-red-akaer font-semibold" // Destaca a opção ativa
            : "text-dark-title hover:bg-gray-50"             // Estilo normal
            }`;
    };

    return (
        <div className="flex items-center gap-4 my-6">
            {/* Barra de Pesquisa */}
            <div className="flex flex-1 gap-4 items-center border border-font-border rounded-lg py-1.5 px-4 bg-white">
                <IoMdSearch className='text-lg text-gray-medium' />
                <input type="text" className='focus:outline-none focus:ring-0 w-full' placeholder="Buscar Normas, códigos ou palavra-chave..."
                    value={busca} onChange={(evento) => onBuscaChange(evento.target.value)} />
            </div>

            {/* Botão de filtros */}
            <div>
                <button
                    onClick={onOpenFilters}
                    className={`flex gap-2 items-center text-sm border rounded-md py-2 px-3 cursor-pointer transition-colors bg-white ${filtrosAtivos
                        ? "bg-[#F5D5D0] text-red-akaer/85 border-red-akaer/85"
                        : "text-gray-medium border-font-border hover:bg-red-50/60"
                        }`}
                >
                    <IoMdSearch className='text-lg' />
                    <div className={`h-3 w-px ${filtrosAtivos ? "bg-red-akaer/85" : "bg-font-border"}`}></div>
                    <span>Filtros</span>
                </button>
            </div>

            {/* Botão de Ordenar */}
            <div className="relative" ref={dropdownRef}>

                <button
                    onClick={() => setMenuAberto(!menuAberto)}
                    className={`flex gap-2 items-center text-sm border rounded-md py-2 px-3 cursor-pointer transition-colors focus:outline-none bg-white ${ordenacaoAtiva
                        ? "bg-[#F5D5D0] text-red-akaer/90 border-red-akaer/70"
                        : "text-gray-medium border-font-border hover:bg-red-50/60"
                        }`}
                >
                    <BiSortAlt2 className="text-lg" />
                    <div className={`h-3 w-px ${ordenacaoAtiva ? "bg-red-akaer/70" : "bg-font-border"}`}></div>
                    <span>Ordenar</span>
                </button>

                {/* Dropdown */}
                {menuAberto && (
                    <div className="absolute right-0 mt-2 w-44 bg-white border border-font-border rounded-lg shadow-lg z-50 flex flex-col p-1.5 animate-fade-in text-sm">
                        <button
                            onClick={() => handleEscolherOrdem('recentes')}
                            className={getEstiloOpcao('recentes')}
                        >
                            Mais Recentes
                        </button>
                        <button
                            onClick={() => handleEscolherOrdem('antigas')}
                            className={getEstiloOpcao('antigas')}
                        >
                            Mais Antigas
                        </button>

                        {/* Liha vertical */}
                        <div className="h-px bg-font-border my-1 mx-2" />

                        <button
                            onClick={() => handleEscolherOrdem('az')}
                            className={getEstiloOpcao('az')}
                        >
                            Nome (A-Z)
                        </button>
                        <button
                            onClick={() => handleEscolherOrdem('za')}
                            className={getEstiloOpcao('za')}
                        >
                            Nome (Z-A)
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}