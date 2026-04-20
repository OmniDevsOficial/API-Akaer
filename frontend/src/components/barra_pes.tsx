import { IoMdSearch } from "react-icons/io";
import { BiSortAlt2 } from "react-icons/bi";


interface BarraPesquisaProps {
    busca: string;
    onBuscaChange: (value: string) => void;
    onOpenFilters: () => void;
}

export default function Barra_pesquisa({ busca, onBuscaChange, onOpenFilters }: BarraPesquisaProps) {
    return (
        <div className="flex items-center gap-4 my-6">
            {/* Barra de Pesquisa */}
            <div className="flex flex-1 gap-4 items-center border border-font-border rounded-lg py-1.5 px-4">
                <IoMdSearch className='text-lg text-gray-medium' />
                <input type="text" className='focus:outline-none focus:ring-0 w-full' placeholder="Buscar Normas, códigos ou palavra-chave..."
                    value={busca} onChange={(evento) => onBuscaChange(evento.target.value)} />
            </div>

            {/* Botão de filtros */}
            <div>
                <button
                    onClick={onOpenFilters}
                    className="flex gap-2 items-center text-sm text-gray-medium border border-font-border rounded-md py-2 px-3 cursor-pointer"
                >
                    <IoMdSearch className='text-lg' />
                    <div className="h-3 w-px bg-font-border "></div>
                    <span>Filtros</span>
                </button>
            </div>

            {/* Botão de Ordenar */}
            <div>
                <button className="flex gap-2 items-center text-sm text-gray-medium border border-font-border rounded-md py-2 px-3">
                    <BiSortAlt2 className="text-lg" />
                    <div className="h-3 w-px bg-font-border"></div>
                    <span>Ordenar</span>
                </button>
            </div>
        </div>
    )
}