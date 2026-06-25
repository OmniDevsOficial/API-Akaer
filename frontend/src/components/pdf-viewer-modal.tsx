import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { FaRegFilePdf, FaLock } from "react-icons/fa6";
import { ChevronLeft, ChevronRight, Minus, Plus, X } from "lucide-react";
import { useRecolher } from "../utils/functions";
import { Link } from "react-router-dom";
import { getUserName, getUserRole } from "../utils/auth";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    norma?: {
        codigo?: string;
        titulo?: string;
        status?: string;
        orgaoEmissor?: string;
        categoria?: string;
        revisao?: string | null;
        escopo?: string;
        palavrasChave?: string[];
        normaRelacionada?: { codigo: string; titulo?: string | null }[];
    } | null;
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://api-akaer-omni.duckdns.org:3333";

const joinApiUrl = (pathname: string) => {
    const base = API_BASE_URL.replace(/\/$/, ""); // Remove barra no final da base, se houver
    const path = pathname.startsWith("/") ? pathname : `/${pathname}`; // Garante que o caminho comece com barra
    return `${base}${path}`;
};


export default function PdfViewerModal({ open, onOpenChange, norma }: PdfViewerModalProps) {
    const { recolher, alternar } = useRecolher();
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [zoom, setZoom] = useState(1);
    const [containerWidth, setContainerWidth] = useState(0);
    const [painelAberto, setPainelAberto] = useState(false);
    const areaRef = useRef<HTMLDivElement | null>(null);
    const pinchRef = useRef<{ dist: number; zoom: number } | null>(null);

    const nomeUsuario = getUserName() ?? "Usuário";
    const roleUsuario = getUserRole() ?? "";
    const isVisualizador = ["VISUALIZADOR", "ADMIN", "CHECKER"].includes(roleUsuario);

    const pdfFile = useMemo(() => {
        const codigo = norma?.codigo?.trim();

        if (!codigo) {
            return null;
        }

        const token = localStorage.getItem("token") || sessionStorage.getItem("token");

        if (!token) {
            return null;
        }

        return {
            url: joinApiUrl(`/normas/${encodeURIComponent(codigo)}/documento`),
            httpHeaders: {
                Authorization: `Bearer ${token}`,
            },
            withCredentials: false,
        };
    }, [norma?.codigo]);

    const totalPaginasExibicao = totalPaginas || 1;
    const metadadosRodape = [
        norma?.status || "Sem status",
        norma?.orgaoEmissor || "Sem órgão",
        norma?.categoria || "Sem categoria",
        norma?.revisao ? `Rev. ${norma.revisao}` : "Sem revisão",
    ].join(" · ");

    const larguraBasePagina = useMemo(() => {
        if (!containerWidth) {
            return 560;
        }

        const isMobile = containerWidth < 768;
        const larguraAjustada = isMobile
            ? containerWidth
            : containerWidth * 0.58;

        return Math.max(200, Math.round(larguraAjustada));
    }, [containerWidth]);

    const podeVoltar = paginaAtual > 1;
    const podeAvancar = totalPaginas > 0 && paginaAtual < totalPaginas;
    const podeDiminuirZoom = zoom > 0.5;
    const podeAumentarZoom = zoom < 3;

    useEffect(() => {
        if (!open) {
            return;
        }

        const element = areaRef.current;

        if (!element) {
            return;
        }

        setContainerWidth(element.clientWidth);

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];

            if (!entry) {
                return;
            }

            setContainerWidth(entry.contentRect.width);
        });

        observer.observe(element);

        return () => observer.disconnect();
    }, [open]);

    useEffect(() => {
        if (!open) {
            return;
        }

        const blockKeyboardShortcuts = (event: KeyboardEvent) => {
            const isBlockedShortcut =
                (event.ctrlKey || event.metaKey) && ["p", "s", "u"].includes(event.key.toLowerCase());

            const isPrintScreen = isVisualizador && event.key === "PrintScreen";

            if (!isBlockedShortcut && !isPrintScreen) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
        };

        window.addEventListener("keydown", blockKeyboardShortcuts, true);

        return () => {
            window.removeEventListener("keydown", blockKeyboardShortcuts, true);
        };
    }, [open, isVisualizador]);

    
    useEffect(() => {
        if (!open) return;
        const el = areaRef.current;
        if (!el) return;

        const getDist = (touches: TouchList) => {
            const dx = touches[0].clientX - touches[1].clientX;
            const dy = touches[0].clientY - touches[1].clientY;
            return Math.hypot(dx, dy);
        };

        const onTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                pinchRef.current = { dist: getDist(e.touches), zoom };
            }
        };

        const onTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 2 && pinchRef.current) {
                e.preventDefault();
                const newDist = getDist(e.touches);
                const ratio = newDist / pinchRef.current.dist;
                const nextZoom = Math.min(3, Math.max(0.5, Number((pinchRef.current.zoom * ratio).toFixed(2))));
                setZoom(nextZoom);
            }
        };

        const onTouchEnd = () => {
            pinchRef.current = null;
        };

        el.addEventListener("touchstart", onTouchStart, { passive: true });
        el.addEventListener("touchmove", onTouchMove, { passive: false });
        el.addEventListener("touchend", onTouchEnd, { passive: true });

        return () => {
            el.removeEventListener("touchstart", onTouchStart);
            el.removeEventListener("touchmove", onTouchMove);
            el.removeEventListener("touchend", onTouchEnd);
        };
    }, [open, zoom]);

    const irParaPaginaAnterior = () => {
        if (podeVoltar) {
            setPaginaAtual((pagina) => pagina - 1);
        }
    };

    const irParaProximaPagina = () => {
        if (podeAvancar) {
            setPaginaAtual((pagina) => pagina + 1);
        }
    };

    const diminuirZoom = () => {
        if (podeDiminuirZoom) {
            setZoom((valorAtual) => Math.max(0.5, Number((valorAtual - 0.1).toFixed(2))));
        }
    };

    const aumentarZoom = () => {
        if (podeAumentarZoom) {
            setZoom((valorAtual) => Math.min(3, Number((valorAtual + 0.1).toFixed(2))));
        }
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setTotalPaginas(0);
            setPaginaAtual(1);
            setZoom(1);
        }

        onOpenChange(nextOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="!p-0 gap-0 sm:!max-w-6xl h-[90vh] flex flex-col overflow-hidden" showCloseButton={false}>
                <div className="px-4 py-2 border-b border-font-border bg-[#f5f4f2] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <FaRegFilePdf className="text-red-akaer text-base shrink-0 self-center" />
                        <div className="min-w-0">
                            <p className="text-lg sm:text-[1rem] font-semibold text-[#7f2943] leading-tight truncate">{norma?.codigo || "Sem código"}</p>
                            <p className="text-lg sm:text-[1rem] font-medium text-[#343434] leading-tight truncate">{norma?.titulo || "Sem título"}</p>
                        </div>
                    </div>

                    <div className="flex items-center my-auto gap-2 sm:gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1 sm:gap-2 px-2 py-1 rounded-xl bg-[#e3dfdb]">
                            <button
                                type="button"
                                className="h-8 w-8 sm:h-7 sm:w-7 rounded-md border border-gray-200 bg-white flex items-center justify-center text-gray-500 disabled:opacity-45 hover:cursor-pointer disabled:hover:cursor-default"
                                onClick={irParaPaginaAnterior}
                                disabled={!podeVoltar}
                                aria-label="Página anterior"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <span className="text-sm text-gray-600 min-w-[44px] sm:min-w-[52px] text-center">
                                {`${paginaAtual}/${totalPaginasExibicao}`}
                            </span>
                            <button
                                type="button"
                                className="h-8 w-8 sm:h-7 sm:w-7 rounded-md border border-gray-200 bg-white flex items-center justify-center text-gray-500 disabled:opacity-45 hover:cursor-pointer disabled:hover:cursor-default"
                                onClick={irParaProximaPagina}
                                disabled={!podeAvancar}
                                aria-label="Próxima página"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>

                        <div className="h-8 w-px bg-[#d2cdca]" />

                        <div className="flex items-center gap-1 sm:gap-2">
                            <button
                                type="button"
                                className="h-8 w-8 sm:h-7 sm:w-7 rounded-md border border-gray-200 bg-white flex items-center justify-center text-gray-500 disabled:opacity-45 hover:cursor-pointer"
                                onClick={diminuirZoom}
                                disabled={!podeDiminuirZoom}
                                aria-label="Diminuir zoom"
                            >
                                <Minus size={14} />
                            </button>
                            <span className="hidden sm:inline min-w-[40px] text-center">{`${Math.round(zoom * 100)}%`}</span>
                            <button
                                type="button"
                                className="h-8 w-8 sm:h-7 sm:w-7 rounded-md border border-gray-200 bg-white flex items-center justify-center text-gray-500 disabled:opacity-45 hover:cursor-pointer"
                                onClick={aumentarZoom}
                                disabled={!podeAumentarZoom}
                                aria-label="Aumentar zoom"
                            >
                                <Plus size={14} />
                            </button>
                        </div>

                        <div className="h-8 w-px bg-[#d2cdca]" />

                        <DialogClose asChild>
                            <button
                                type="button"
                                className="h-7 w-7 rounded-md border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:cursor-pointer"
                                aria-label="Fechar visualizador"
                            >
                                <X size={14} />
                            </button>
                        </DialogClose>
                    </div>
                </div>

                {/* CORPO PRINCIPAL */}
                <div className="flex flex-1 overflow-hidden flex-col md:flex-row">

                    {/* VIEWER PDF */}
                    <div ref={areaRef} className="flex-1 overflow-auto bg-[#d2cdc8] py-4 min-h-0 min-w-0">

                        {!pdfFile ? (
                            <p className="text-sm text-gray-600 text-center mt-10">
                                Não foi possível preparar o documento para visualização.
                            </p>
                        ) : (
                            <div
                                className="min-h-full min-w-full flex items-start justify-center"
                                style={{ width: "max-content", minWidth: "100%" }}
                                onContextMenu={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                }}
                            >
                                <div className="relative shrink-0 py-4">
                                    <Document
                                        file={pdfFile}
                                        loading={<p className="text-sm text-gray-600">Carregando PDF...</p>}
                                        error={<p className="text-sm text-red-600">Não foi possível carregar este PDF.</p>}
                                        onLoadSuccess={({ numPages }) => {
                                            setTotalPaginas(numPages);
                                            setPaginaAtual(1);
                                        }}
                                    >
                                        <Page
                                            pageNumber={paginaAtual}
                                            width={larguraBasePagina}
                                            scale={zoom}
                                            renderAnnotationLayer
                                            renderTextLayer
                                        />
                                    </Document>

                                   
                                    {isVisualizador && (
                                        <div
                                            aria-hidden="true"
                                            style={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                pointerEvents: "none",
                                                zIndex: 10,
                                                display: "flex",
                                                flexWrap: "wrap",
                                                alignContent: "space-around",
                                                justifyContent: "space-around",
                                                overflow: "hidden",
                                                padding: "20px",
                                                gap: "30px",
                                            }}
                                        >
                                            {Array.from({ length: 30 }).map((_, i) => (
                                                <span
                                                    key={i}
                                                    style={{
                                                        color: "rgba(122, 46, 68, 0.13)",
                                                        fontSize: "18px",
                                                        fontWeight: 900,
                                                        letterSpacing: "4px",
                                                        transform: "rotate(-35deg)",
                                                        whiteSpace: "nowrap",
                                                        userSelect: "none",
                                                        fontFamily: "Arial, sans-serif",
                                                    }}
                                                >
                                                    {nomeUsuario}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                 
                    <div className={`hidden md:block relative border-l bg-white transition-all duration-300 ${recolher ? "w-8" : "w-[360px]"}`}>

                       
                        <button
                            onClick={alternar}
                            className="absolute -right-0 top-6.5 bg-white border border-gray-200 rounded-full p-0.5 mr-1.5 text-gray-400 hover:text-red-akaer transition-colors z-10 flex items-center justify-center"
                        >
                            {recolher ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                        </button>

                        {!recolher && (
                            <div className="p-5 h-full overflow-auto min-w-0 w-full max-w-full overflow-x-hidden">
                                <h2 className="text-lg font-semibold text-red-akaer mb-6">Detalhes da Norma</h2>

                                <div className="mb-8">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Escopo</h3>
                                    <p className="text-sm text-gray-600 leading-6 whitespace-pre-line break-words overflow-wrap-anywhere">
                                        {norma?.escopo || "Não informado"}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Palavras-chave</h3>
                                    <div className="flex flex-wrap gap-2 w-full max-w-full">
                                        {norma?.palavrasChave?.length ? (
                                            norma.palavrasChave.map((p, i) => (
                                                <span key={i} className="px-3 py-1 text-sm rounded-xl bg-[#eef3ff]">{p}</span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-500">Não informadas</span>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Normas Relacionadas</h3>
                                    {norma?.normaRelacionada?.length ? (
                                        <div className="grid grid-cols-1 gap-2 w-full max-w-full overflow-hidden">
                                            {norma.normaRelacionada.map((n: any) => (
                                                <div key={n.codigo} className="px-3 py-1 text-sm rounded-xl bg-[#eef3ff] cursor-pointer break-all w-full">
                                                    <Link to={`/normas/ver/${n.codigo}`}>{n.codigo} - {n.titulo || ''}</Link>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-500">Nenhuma norma relacionada</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* PAINEL INFERIOR — mobile*/}
                    <div className="md:hidden border-t bg-white flex-shrink-0">
                     
                        <button
                            type="button"
                            onClick={() => setPainelAberto((v) => !v)}
                            className="w-full flex items-center justify-between px-4 py-3 text-left"
                        >
                            <span className="text-sm font-semibold text-red-akaer">Detalhes da Norma</span>
                            <ChevronRight
                                size={16}
                                className={`text-gray-400 transition-transform duration-200 ${painelAberto ? "rotate-90" : ""}`}
                            />
                        </button>

                        {painelAberto && (
                            <div className="px-4 pb-4 overflow-auto max-h-[45vh] space-y-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Escopo</h3>
                                    <p className="text-sm text-gray-600 leading-6 whitespace-pre-line break-words" style={{ overflowWrap: "anywhere" }}>
                                        {norma?.escopo || "Não informado"}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Palavras-chave</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {norma?.palavrasChave?.length ? (
                                            norma.palavrasChave.map((p, i) => (
                                                <span key={i} className="px-3 py-1 text-sm rounded-xl bg-[#eef3ff]">{p}</span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-500">Não informadas</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Normas Relacionadas</h3>
                                    {norma?.normaRelacionada?.length ? (
                                        <div className="flex flex-col gap-2">
                                            {norma.normaRelacionada.map((n: any) => (
                                                <div key={n.codigo} className="px-3 py-1 text-sm rounded-xl bg-[#eef3ff] cursor-pointer break-all">
                                                    <Link to={`/normas/ver/${n.codigo}`}>{n.codigo} - {n.titulo || ''}</Link>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-500">Nenhuma norma relacionada</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>


                <div className="px-4 py-2.5 border-t border-font-border bg-[#f5f4f2] flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 text-[0.7rem] text-gray-400">
                        <FaLock className="text-gray-400 shrink-0" />
                        <span className="hidden sm:inline">Visualização protegida - download não disponível</span>
                        <span className="sm:hidden">Protegido</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-500 min-w-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                        <span className="text-right truncate">{metadadosRodape}</span>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
}