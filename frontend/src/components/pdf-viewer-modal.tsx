import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
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

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

const joinApiUrl = (pathname: string) => new URL(pathname, API_BASE_URL).toString();


export default function PdfViewerModal({ open, onOpenChange, norma }: PdfViewerModalProps) {
    const { recolher, alternar } = useRecolher();
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [zoom, setZoom] = useState(1);
    const [containerWidth, setContainerWidth] = useState(0);
    const areaRef = useRef<HTMLDivElement | null>(null);

    const nomeUsuario = getUserName() ?? "Usuário";
    const roleUsuario = getUserRole() ?? "";
    // Exibe marca d'água para usuários com role VISUALIZADOR
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
            // Bloqueia atalhos de impressão/salvar para todos os usuários
            const isBlockedShortcut =
                (event.ctrlKey || event.metaKey) && ["p", "s", "u"].includes(event.key.toLowerCase());

            // Bloqueia PrintScreen para consultores
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
                {/* Título oculto para acessibilidade (exigido pelo Radix UI) */}
                <DialogTitle className="sr-only">Visualização de Documento PDF</DialogTitle>
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

                                    {/* Marca d'água — exibida apenas para Visualizadores */}
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

                    {/* ===== PAINEL LATERAL (ESCOPO + TAGS) ===== */}
                    <div className={`relative border-l bg-white transition-all duration-300 ${recolher ? "w-8" : "w-[360px]"}`}>

                        {/* Botão de recolher/expansão */}
                        <button
                            onClick={alternar}
                            className="absolute -right-0 top-6.5 bg-white border border-gray-200 rounded-full p-0.5 mr-1.5 text-gray-400 hover:text-red-akaer hover:border-red-akaer hover:bg-red-akaer/5 transition-colors z-10 flex items-center justify-center"
                        >
                            {recolher ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                        </button>

                        {/* Detalhes da Norma */}
                        {!recolher && (
                            <div className="p-5 h-full overflow-auto min-w-0 w-full max-w-full overflow-x-hidden">
                                <h2 className="text-lg font-semibold text-red-akaer mb-6">Detalhes da Norma</h2>

                                <div className="mb-8">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Escopo</h3>
                                    <p className="text-sm text-gray-600 leading-6 whitespace-pre-line">
                                        {norma?.escopo || "Não informado"}
                                    </p>
                                </div>

                                {/* Palavras-chave */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Palavras-chave</h3>
                                    <div className="flex flex-wrap gap-1.5 w-full">
                                        {norma?.palavrasChave?.length ? (
                                            norma.palavrasChave.map((p, i) => (
                                                <span
                                                    key={i}
                                                    className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-font-border bg-white text-xs text-gray-600 hover:border-[#73203A]/30 hover:text-[#73203A] hover:bg-[#73203A]/5 transition-all"
                                                >
                                                    <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
                                                    {p}
                                                </span>
                                            ))
                                        ) : (
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                Não informadas
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Normas Relacionadas */}
                                <div className="mt-8">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                        Normas Relacionadas
                                    </h3>

                                    {norma?.normaRelacionada?.length ? (
                                        <div className="grid grid-cols-1 gap-2 w-full">
                                            {norma.normaRelacionada.map((n: any) => (
                                                <Link
                                                    key={n.codigo}
                                                    to={`/normas/ver/${n.codigo}`}
                                                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-font-border bg-white hover:border-[#73203A]/30 hover:bg-[#73203A]/5 transition-all group"
                                                >
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-[11px] font-bold text-[#73203A] leading-tight">
                                                            {n.codigo}
                                                        </span>
                                                        <span className="text-xs text-gray-500 truncate group-hover:text-gray-700 transition-colors leading-snug mt-0.5">
                                                            {n.titulo || '—'}
                                                        </span>
                                                    </div>
                                                    <ChevronRight
                                                        size={13}
                                                        className="ml-auto flex-shrink-0 text-gray-300 group-hover:text-[#73203A]/40 transition-colors"
                                                    />
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                                            Nenhuma norma relacionada
                                        </div>
                                    )}
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