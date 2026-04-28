import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { FaRegFilePdf, FaLock } from "react-icons/fa6";
import { ChevronLeft, ChevronRight, Minus, Plus, X } from "lucide-react";
import { useRecolher } from "./recolher-aside";

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
    } | null;
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

const joinApiUrl = (pathname: string) => new URL(pathname, API_BASE_URL).toString();


export default function PdfViewerModal({ open, onOpenChange, norma }: PdfViewerModalProps) {
    const { recolher, alternar } = useRecolher();
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [zoom, setZoom] = useState(1);
    const [containerWidth, setContainerWidth] = useState(0);
    const areaRef = useRef<HTMLDivElement | null>(null);

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

        const larguraAjustada = containerWidth < 768
            ? containerWidth - 28
            : containerWidth * 0.58;

        return Math.max(280, Math.min(620, Math.round(larguraAjustada)));
    }, [containerWidth]);

    const podeVoltar = paginaAtual > 1;
    const podeAvancar = totalPaginas > 0 && paginaAtual < totalPaginas;
    const podeDiminuirZoom = zoom > 0.6;
    const podeAumentarZoom = zoom < 2;

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

            if (!isBlockedShortcut) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
        };

        window.addEventListener("keydown", blockKeyboardShortcuts, true);

        return () => {
            window.removeEventListener("keydown", blockKeyboardShortcuts, true);
        };
    }, [open]);

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
            setZoom((valorAtual) => Math.max(0.6, Number((valorAtual - 0.1).toFixed(2))));
        }
    };

    const aumentarZoom = () => {
        if (podeAumentarZoom) {
            setZoom((valorAtual) => Math.min(2, Number((valorAtual + 0.1).toFixed(2))));
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

                    <div className="flex items-center my-auto gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-2 px-2 py-1 rounded-xl bg-[#e3dfdb]">
                            <button
                                type="button"
                                className="h-7 w-7 rounded-md border border-gray-200 bg-white flex items-center justify-center text-gray-500 disabled:opacity-45 hover:cursor-pointer disabled:hover:cursor-default"
                                onClick={irParaPaginaAnterior}
                                disabled={!podeVoltar}
                                aria-label="Página anterior"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <span className="text-sm text-gray-600 min-w-[52px] text-center">
                                {`${paginaAtual}/${totalPaginasExibicao}`}
                            </span>
                            <button
                                type="button"
                                className="h-7 w-7 rounded-md border border-gray-200 bg-white flex items-center justify-center text-gray-500 disabled:opacity-45 hover:cursor-pointer disabled:hover:cursor-default"
                                onClick={irParaProximaPagina}
                                disabled={!podeAvancar}
                                aria-label="Próxima página"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>

                        <div className="h-12 w-px bg-[#d2cdca]" />

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="h-7 w-7 rounded-md border border-gray-200 bg-white flex items-center justify-center text-gray-500 disabled:opacity-45 hover:cursor-pointer"
                                onClick={diminuirZoom}
                                disabled={!podeDiminuirZoom}
                                aria-label="Diminuir zoom"
                            >
                                <Minus size={14} />
                            </button>
                            <span className="min-w-[40px] text-center">{`${Math.round(zoom * 100)}%`}</span>
                            <button
                                type="button"
                                className="h-7 w-7 rounded-md border border-gray-200 bg-white flex items-center justify-center text-gray-500 disabled:opacity-45 hover:cursor-pointer"
                                onClick={aumentarZoom}
                                disabled={!podeAumentarZoom}
                                aria-label="Aumentar zoom"
                            >
                                <Plus size={14} />
                            </button>
                        </div>

                        <div className="h-12 w-px bg-[#d2cdca]" />

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

                <div className="flex flex-1 overflow-hidden">

                    {/* ===== VIEWER PDF ===== */}
                    <div ref={areaRef} className="flex-1 overflow-auto bg-[#d2cdc8] p-4">

                        {!pdfFile ? (
                            <p className="text-sm text-gray-600 text-center mt-10">
                                Não foi possível preparar o documento para visualização.
                            </p>
                        ) : (
                            <div
                                className="flex justify-center min-h-full py-1"
                                onContextMenu={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                }}
                            >
                                <div className="relative">
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
                                </div>
                            </div>
                        )}

                    </div>

                    {/* ===== PAINEL LATERAL (ESCOPO + TAGS) ===== */}
                    <div className={`relative border-l bg-white transition-all duration-300 ${recolher ? "w-8" : "w-[360px]"}`}>

                        {/* Botão de recolher/expansão */}
                        <button
                            onClick={alternar}
                            className="absolute -right-0 top-6.5 bg-white border border-gray-200 rounded-full p-0.5 mr-1.5 text-gray-400 hover:text-red-akaer transition-colors z-10 flex items-center justify-center"
                        >
                            {recolher ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                        </button>

                        {/* Detalhes da Norma */}
                        {!recolher && (
                            <div className="p-5 h-full overflow-auto">
                                <h2 className="text-lg font-semibold text-red-akaer mb-6">Detalhes da Norma</h2>

                                <div className="mb-8">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Escopo</h3>
                                    <p className="text-sm text-gray-600 leading-6 whitespace-pre-line">
                                        {norma?.escopo || "Não informado"}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Palavras-chave</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {norma?.palavrasChave?.length ? (
                                            norma.palavrasChave.map((p, i) => (
                                                <span key={i} className="px-3 py-1 text-sm rounded-full bg-[#eef3ff]">{p}</span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-500">Não informadas</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>


                <div className="px-4 py-5 border-t border-font-border bg-[#f5f4f2] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[0.7rem] text-gray-400">
                        <FaLock className="text-gray-400" />
                        <span>Visualização protegida - download não disponível</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <span className="text-right">{metadadosRodape}</span>
                    </div>
                </div>



            </DialogContent>
        </Dialog>



    );
}