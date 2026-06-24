import { useState, useEffect, useRef } from "react";
import { IoMdSearch } from "react-icons/io";
import { BiSortAlt2 } from "react-icons/bi";
import { type FiltrosLabels } from "./FilterAside/FilterAside.tsx";

interface BarraPesquisaProps {
    busca: string;
    filtrosAtivos: boolean;
    titulo?: string;
    ordemAtual: 'recentes' | 'antigas' | 'az' | 'za';
    filtrosLabels?: FiltrosLabels;
    onBuscaChange: (value: string) => void;
    onOpenFilters: () => void;
    onOrdenar: (tipo: 'recentes' | 'antigas' | 'az' | 'za') => void;
    onRemoverFiltro?: (grupo: keyof FiltrosLabels, id: number | string) => void;
}

export default function Barra_pesquisa({ busca, ordemAtual, filtrosAtivos, filtrosLabels, onBuscaChange, onOpenFilters, onOrdenar, onRemoverFiltro }: BarraPesquisaProps) {
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

    // Achata todos os filtros ativos em uma lista
    const filtrosAtivosAside = filtrosLabels
        ? (Object.entries(filtrosLabels) as [keyof FiltrosLabels, { id: number | string; nome: string }[] | undefined][])
            .flatMap(([grupo, itens]) =>
                (itens ?? []).map(item => ({ grupo, ...item }))
            )
        : [];

    return (
        <>
            <div className="flex flex-col gap-2 my-6 md:flex-row md:items-center md:gap-4">
                {/* Barra de Pesquisa */}
                <div className="flex w-full gap-3 items-center border border-font-border rounded-lg py-1.5 px-4 bg-white md:flex-1">
                    <IoMdSearch className='text-lg text-gray-medium shrink-0' />
                    <input
                        type="text"
                        className='focus:outline-none focus:ring-0 w-full text-sm'
                        placeholder="Buscar Normas, códigos ou palavra-chave..."
                        value={busca}
                        onChange={(evento) => onBuscaChange(evento.target.value)}
                    />
                </div>

                {/* Filtros + Ordenar */}
                <div className="flex gap-2">
                    <button
                        onClick={onOpenFilters}
                        className={`flex flex-1 md:flex-none justify-center gap-2 items-center text-sm border rounded-md py-2 px-3 cursor-pointer transition-colors bg-white ${filtrosAtivos
                            ? "bg-[#F5D5D0] text-red-akaer/85 border-red-akaer/85"
                            : "text-gray-medium border-font-border hover:bg-red-50/60"
                            }`}
                    >
                        <IoMdSearch className='text-lg' />
                        <div className={`h-3 w-px ${filtrosAtivos ? "bg-red-akaer/85" : "bg-font-border"}`} />
                        <span>Filtros</span>
                    </button>

                    <div className="relative flex-1 md:flex-none" ref={dropdownRef}>
                        <button
                            onClick={() => setMenuAberto(!menuAberto)}
                            className={`flex w-full justify-center gap-2 items-center text-sm border rounded-md py-2 px-3 cursor-pointer transition-colors focus:outline-none bg-white ${ordenacaoAtiva
                                ? "bg-[#F5D5D0] text-red-akaer/90 border-red-akaer/70"
                                : "text-gray-medium border-font-border hover:bg-red-50/60"
                                }`}
                        >
                            <BiSortAlt2 className="text-lg" />
                            <div className={`h-3 w-px ${ordenacaoAtiva ? "bg-red-akaer/70" : "bg-font-border"}`} />
                            <span>Ordenar</span>
                        </button>

                        {menuAberto && (
                            <div className="absolute right-0 mt-2 w-44 bg-white border border-font-border rounded-lg shadow-lg z-50 flex flex-col p-1.5 animate-fade-in text-sm">
                                <button onClick={() => handleEscolherOrdem('recentes')} className={getEstiloOpcao('recentes')}>Mais Recentes</button>
                                <button onClick={() => handleEscolherOrdem('antigas')} className={getEstiloOpcao('antigas')}>Mais Antigas</button>
                                <div className="h-px bg-font-border my-1 mx-2" />
                                <button onClick={() => handleEscolherOrdem('az')} className={getEstiloOpcao('az')}>Nome (A-Z)</button>
                                <button onClick={() => handleEscolherOrdem('za')} className={getEstiloOpcao('za')}>Nome (Z-A)</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tags de filtros ativos */}
            {filtrosAtivosAside.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {filtrosAtivosAside.map(({ grupo, id, nome }) => (
                        <span
                            key={`${grupo}-${id}`}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#73203A]/20 bg-[#73203A]/5 text-[#73203A] text-xs font-medium"
                        >
                            {nome}
                            <button
                                type="button"
                                onClick={() => onRemoverFiltro?.(grupo, id)}
                                className="w-3.5 h-3.5 rounded-full flex items-center justify-center bg-[#73203A]/15 hover:bg-[#73203A]/30 transition-colors font-bold"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </>
    )
}