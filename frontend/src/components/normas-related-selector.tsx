import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
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

            {/* Normas Selecionadas */}
            {selecionadas.length > 0 && (
                <div className="grid grid-cols-1 gap-2 w-full mb-2">
                    {selecionadas.map(n => (
                        <div
                            key={n.codigo}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-font-border bg-white hover:border-[#73203A]/30 hover:bg-[#73203A]/5 transition-all group"
                        >
                            <Link to={`/normas/ver/${n.codigo}`} className="flex flex-col min-w-0 flex-1">
                                <span className="text-[11px] font-bold text-[#73203A] leading-tight">
                                    {n.codigo}
                                </span>
                                <span className="text-xs text-gray-500 truncate group-hover:text-gray-700 transition-colors leading-snug mt-0.5">
                                    {n.titulo || '—'}
                                </span>
                            </Link>
                            <button
                                type="button"
                                onClick={() => remover(n.codigo)}
                                className="ml-auto flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-gray-100 hover:bg-[#73203A]/15 text-gray-400 hover:text-[#73203A] transition-colors text-[11px] font-bold"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div ref={inputWrapperRef} className="relative">
                <div className="flex items-center gap-2 bg-white border border-font-border rounded-lg px-3 py-2.5 focus-within:border-[#73203A]/50 focus-within:ring-2 focus-within:ring-[#73203A]/10 transition-all">
                    <Search size={13} className="text-gray-400 flex-shrink-0" />
                    <input
                        className="bg-transparent outline-none w-full text-sm text-dark-title placeholder:text-gray-400"
                        placeholder="Buscar normas para correlacionar..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        onFocus={handleFocus}
                    />
                </div>

                {/* Dropdown inline */}
                {!usePortal && aberto && (
                    <div className="absolute z-50 mt-1.5 w-full border border-font-border rounded-lg bg-white max-h-44 overflow-y-auto shadow-lg">
                        {normas.length > 0 ? (
                            normas.map(n => {
                                const jaSelecionada = selecionadas.some(norma => norma.codigo === n.codigo);
                                return (
                                    <div
                                        key={n.codigo}
                                        className={`flex items-center gap-2 px-3 py-2.5 text-xs transition-colors first:rounded-t-lg last:rounded-b-lg
                                    ${jaSelecionada
                                                ? "bg-gray-50 cursor-not-allowed text-gray-400"
                                                : "hover:bg-[#73203A]/5 cursor-pointer text-dark-title"
                                            }`}
                                        onMouseDown={(e) => { e.preventDefault(); adicionar(n); }}
                                    >
                                        <span className={`font-bold flex-shrink-0 ${jaSelecionada ? "text-gray-400" : "text-[#73203A]"}`}>
                                            {n.codigo}
                                        </span>
                                        <span className="truncate">{n.titulo}</span>
                                        {jaSelecionada && (
                                            <span className="ml-auto flex-shrink-0 text-[10px] text-gray-400">já adicionada</span>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 gap-1.5">
                                <p className="text-xs text-gray-400">Nenhuma norma encontrada</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Dropdown via portal */}
            {usePortal && aberto && createPortal(
                <div
                    id="normas-selector-dropdown"
                    style={dropdownStyle}
                    className="border border-font-border rounded-lg bg-white max-h-44 overflow-y-auto shadow-lg"
                >
                    {normas.length > 0 ? (
                        normas.map(n => {
                            const jaSelecionada = selecionadas.some(norma => norma.codigo === n.codigo);
                            return (
                                <div
                                    key={n.codigo}
                                    className={`flex items-center gap-2 px-3 py-2.5 text-xs transition-colors first:rounded-t-lg last:rounded-b-lg
                                ${jaSelecionada
                                            ? "bg-gray-50 cursor-not-allowed text-gray-400"
                                            : "hover:bg-[#73203A]/5 cursor-pointer text-dark-title"
                                        }`}
                                    onMouseDown={(e) => { e.preventDefault(); adicionar(n); }}
                                >
                                    <span className={`font-bold flex-shrink-0 ${jaSelecionada ? "text-gray-400" : "text-[#73203A]"}`}>
                                        {n.codigo}
                                    </span>
                                    <span className="truncate">{n.titulo}</span>
                                    {jaSelecionada && (
                                        <span className="ml-auto flex-shrink-0 text-[10px] text-gray-400">já adicionada</span>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-6 gap-1.5">
                            <p className="text-xs text-gray-400">Nenhuma norma encontrada</p>
                        </div>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
}
