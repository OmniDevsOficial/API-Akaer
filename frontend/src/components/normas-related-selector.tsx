import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import api from "@/services/api";

interface Norma {
    titulo: string;
    codigo: string;
}

interface Props {
    selecionadas: Norma[];
    onChange: (normas: Norma[]) => void;
    codigoAtual?: string;
    /** Usa createPortal para escapar de contextos com overflow:hidden (ex: página Editar). Padrão: false. */
    usePortal?: boolean;
}

export function NormasRelatedSelector({ selecionadas, onChange, codigoAtual, usePortal = false }: Props) {
    const [busca, setBusca] = useState("");
    const [normas, setNormas] = useState<Norma[]>([]);
    const [aberto, setAberto] = useState(false);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputWrapperRef = useRef<HTMLDivElement>(null);

    // Calcula posição e direção (baixo ou cima) baseado no espaço disponível na viewport
    const calcularPosicao = () => {
        if (!inputWrapperRef.current) return;

        const rect = inputWrapperRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const DROPDOWN_HEIGHT = 160; // max-h-40 = 10rem = 160px
        const GAP = 4; // mt-1

        const spaceBelow = viewportHeight - rect.bottom;
        const openAcima = spaceBelow < DROPDOWN_HEIGHT + GAP;

        if (openAcima) {
            setDropdownStyle({
                position: "fixed",
                top: rect.top - DROPDOWN_HEIGHT - GAP,
                left: rect.left,
                width: rect.width,
                zIndex: 9999,
            });
        } else {
            setDropdownStyle({
                position: "fixed",
                top: rect.bottom + GAP,
                left: rect.left,
                width: rect.width,
                zIndex: 9999,
            });
        }
    };

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

    // Fecha ao clicar fora (tanto do wrapper quanto do dropdown no portal)
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(target) &&
                !(document.getElementById("normas-selector-dropdown")?.contains(target))
            ) {
                setAberto(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Recalcula posição ao rolar ou redimensionar
    useEffect(() => {
        if (!aberto) return;

        const update = () => calcularPosicao();
        window.addEventListener("scroll", update, true);
        window.addEventListener("resize", update);
        return () => {
            window.removeEventListener("scroll", update, true);
            window.removeEventListener("resize", update);
        };
    }, [aberto]);

    const handleFocus = () => {
        calcularPosicao();
        setAberto(true);
    };

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
        <div className='flex flex-col text-start gap-1' ref={wrapperRef}>
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

            <div ref={inputWrapperRef} className="relative">
                <div className="bg-gray-100/80 border rounded p-2 py-3">
                    <input
                        className="bg-transparent outline-none w-full"
                        placeholder="Buscar normas para correlacionar"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        onFocus={handleFocus}
                    />
                </div>

                {/* Dropdown inline (modal e outros contextos sem overflow:hidden) */}
                {!usePortal && aberto && (
                    <div className="absolute z-50 mt-1 w-full border rounded bg-white max-h-40 overflow-y-auto shadow-sm">
                        {normas.length > 0 ? (
                            normas.map(n => (
                                <div
                                    key={n.codigo}
                                    className={`${selecionadas.some(norma => norma.codigo === n.codigo) ? "bg-gray-100 cursor-not-allowed text-gray-600" : "hover:bg-gray-100 cursor-pointer"} p-2 text-sm`}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        adicionar(n);
                                    }}
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

            {/* Dropdown via portal (Editar — escapa do overflow:hidden do card) */}
            {usePortal && aberto && createPortal(
                <div
                    id="normas-selector-dropdown"
                    style={dropdownStyle}
                    className="border rounded bg-white max-h-40 overflow-y-auto shadow-md"
                >
                    {normas.length > 0 ? (
                        normas.map(n => (
                            <div
                                key={n.codigo}
                                className={`${selecionadas.some(norma => norma.codigo === n.codigo) ? "bg-gray-100 cursor-not-allowed text-gray-600" : "hover:bg-gray-100 cursor-pointer"} p-2 text-sm`}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    adicionar(n);
                                }}
                            >
                                {n.codigo} - {n.titulo}
                            </div>
                        ))
                    ) : (
                        <div className="p-2 text-sm text-gray-400">
                            Nenhuma norma encontrada
                        </div>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
}
