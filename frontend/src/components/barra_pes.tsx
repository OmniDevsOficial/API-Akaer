import { useState } from "react";
import { IoMdSearch } from "react-icons/io";
import { BiSortAlt2 } from "react-icons/bi";

type Props = {
  onOpenFilters: () => void;
};


export default function Barra_pesquisa({ onOpenFilters }: Props) {
    const [busca, setBusca] = useState('')
    return (
        <div className="flex items-center gap-4 my-6">
            {/* Barra de Pesquisa */}
            <div className="flex flex-1 gap-4 items-center border border-font-border rounded-lg py-1.5 px-4">
                <IoMdSearch className='text-lg text-gray-medium'/>
                <input type="text" className='focus:outline-none focus:ring-0 w-full' placeholder="Buscar Normas, códigos ou palavra-chave..."
                    value={busca} onChange={(evento) => setBusca(evento.target.value)} /> {/* Quando pesquisar atualiza a memória */}
            </div>

            {/* Botão de filtros */}
            <div>
                <button
                  onClick={onOpenFilters}
                   className="flex gap-2 items-center text-sm text-gray-medium border border-font-border rounded-md py-2 px-3"
>
                    <IoMdSearch className='text-lg'/>
                        <div className="h-3 w-px bg-font-border "></div>
                        Filtros
                </button>
            </div>

            {/* Botão de Ordenar */}
            <div>
                <button className="flex gap-2 items-center text-sm text-gray-medium border border-font-border rounded-md py-2 px-3">
                    <BiSortAlt2 className="text-lg"/>
                    <div className="h-3 w-px bg-font-border"></div>
                    Ordenar
                </button>
            </div>
            {/* <p className="text-sm text-blue-600">
                O React está lembrando disso: <strong>{busca}</strong>
            </p> */}
        </div>
    )
}