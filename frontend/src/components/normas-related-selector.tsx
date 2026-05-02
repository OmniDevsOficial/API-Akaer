import { useState } from "react";
import { useRef, useEffect } from "react";

interface Norma {
  id: number;
  titulo: string;
  codigo: string;
}

interface Props {
  normas: Norma[];
  selecionadas: Norma[];
  onChange: (normas: Norma[]) => void;
}

export function NormasRelatedSelector({
  normas,
  selecionadas,
  onChange
}: Props) {
  const [busca, setBusca] = useState("");

  const filtradas = normas.filter(n =>
    n.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    n.codigo.toLowerCase().includes(busca.toLowerCase())
  );
  const listaExibida = busca ? filtradas : normas;

  const adicionar = (norma: Norma) => {
    if (selecionadas.some(n => n.id === norma.id)) return;
    onChange([...selecionadas, norma]);
    setBusca("");
  };

  const remover = (id: number) => {
    onChange(selecionadas.filter(n => n.id !== id));
  };

  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  

  useEffect(() => {
    function handleClickOutside(event: any) {
        if (ref.current && !ref.current.contains(event.target)) {
            setAberto(false);
        }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
}, []);

  return (
    <div className='flex flex-col text-start gap-1 mt-6'>
    <label className='text-lg text-gray-600'>
        NOTAS CORRELACIONADAS
    </label>

   <div ref={ref} className="bg-gray-100/80 border rounded p-3 relative">

        {/* Selecionadas */}
        <div className="flex flex-wrap gap-2 mb-2">
            {selecionadas.map(n => (
                <div
                    key={n.id}
                    className="px-2 py-1 rounded bg-red-50 text-sm flex items-center gap-2"
                >
                    {n.codigo}
                    <button
                        type="button"
                        onClick={() => remover(n.id)}
                        className="text-black/60 hover:text-black"
                    >
                        x
                    </button>
                </div>
            ))}
        </div>

        {/* Input */}
       <input
    className="bg-transparent outline-none w-full"
    placeholder="Buscar normas para correlacionar"
    value={busca}
    onChange={(e) => setBusca(e.target.value)}
    onFocus={() => setAberto(true)}
/>

        {/* Dropdown */}
        {aberto && (
            <div className="mt-2 border rounded bg-white max-h-40 overflow-y-auto">
                {listaExibida.length > 0 ? (
                   listaExibida.map(n => (  
                        <div
                            key={n.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onClick={() => adicionar(n)}
                        >
                            {n.codigo} - {n.titulo}
                        </div>
                    ))
                ) : (
                    <div className="p-2 text-sm text-gray-400">
                        Nenhuma norma encontrada
                    </div>
                )}
            </div>
        )}
    </div>
</div>
  );
}