import { useState, useRef, useEffect } from "react";
import api from "@/services/api";

interface Norma {
    titulo: string;
    codigo: string;
}

interface Props {
    selecionadas: Norma[];
    onChange: (normas: Norma[]) => void;
    codigoAtual?: string;
}

export function NormasRelatedSelector({ selecionadas, onChange, codigoAtual }: Props) {
    const [busca, setBusca] = useState("");
    const [normas, setNormas] = useState<Norma[]>([]);
    const [aberto, setAberto] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const buscarNormas = async () => {
            try {
                const response = await api.get('/normas/listar', {
                    params: { texto: busca.trim() || undefined, page: 1 }
                });

                const itens = response.data?.itens || [];

                setNormas(
                    itens.filter((n: Norma) => n.codigo !== codigoAtual)
                );
            } catch (error) {
                console.error('Erro ao buscar normas:', error);
            }
        };

        if (aberto) {
            buscarNormas();
        }
    }, [busca, aberto, codigoAtual]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setAberto(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const adicionar = (norma: Norma) => {
        if (selecionadas.some(n => n.codigo === norma.codigo)) return;

        onChange([...selecionadas, norma]);
        setBusca("");
        setAberto(false);
    };

    const remover = (codigo: string) => {
        onChange(selecionadas.filter(n => n.codigo !== codigo));
    };

    return (
        <div className='flex flex-col text-start gap-1'>
            {/* Selecionadas */}
            <div className="flex flex-wrap gap-2 mb-2">
                {selecionadas.map(n => (
                    <div
                        key={n.codigo}
                        className="flex items-center gap-2 px-2 py-1 rounded bg-[#FAF9F7] text-dark-title text-sm border border-font-border rounded-sm"
                    >
                        {n.codigo} - {n.titulo}
                        <button
                            type="button"
                            onClick={() => remover(n.codigo)}
                            className="text-dark-title hover:text-dark-title/80"
                        >
                            x
                        </button>
                    </div>
                ))}
            </div>

            <div ref={ref} className="relative">
                <div className="bg-gray-100/80 border rounded p-2 py-3">
                    <input
                        className="bg-transparent outline-none w-full"
                        placeholder="Buscar normas para correlacionar"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        onFocus={() => setAberto(true)}
                    />
                </div>

                {aberto && (
                    <div className="absolute z-50 mt-1 w-full border rounded bg-white max-h-40 overflow-y-auto shadow-sm">
                        {normas.length > 0 ? (
                            normas.map(n => (
                                <div
                                    key={n.codigo}
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
};
