import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import {
    BookOpenCheck,
    Calendar,
    ChevronLeft,
    FileText,
    IdCard,
    Loader2,
    StickyNote,
    Tag,
    ChevronRight,
} from "lucide-react";
import { LiaCodeBranchSolid } from "react-icons/lia";
import Sidebar from "../../components/sidebar";
import PdfViewerModal from "../../components/pdf-viewer-modal";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "../../components/ui/breadcrumb";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../../components/ui/tooltip";
import { getNormaDetalhes, type NormaDetalhes } from "../../services/normaService";

type SectionProps = {
    icon: ReactNode;
    title: string;
    children: ReactNode;
};

type ReadOnlyFieldProps = {
    label: string;
    value?: string | null;
    icon?: ReactNode;
};

function Section({ icon, title, children }: SectionProps) {
    return (
        <section className="rounded-xl border border-font-border bg-white overflow-hidden">
            <div className="flex items-center gap-2 border-b border-font-border bg-white px-6 py-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
                {icon}
                {title}
            </div>

            <div className="p-6">{children}</div>
        </section>
    );
}

function ReadOnlyField({ label, value, icon }: ReadOnlyFieldProps) {
    return (
        <div className="flex flex-col text-start gap-1">
            <label className="text-xs text-gray-400 tracking-widest block mb-1">
                {label}
            </label>

            <div className="relative">
                {icon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                    </span>
                )}

                <input
                    className={`w-full border border-font-border rounded-md py-2 text-sm bg-[#FAF9F7] text-dark-title focus:outline-none ${icon ? "pl-8 pr-2" : "px-3"}`}
                    value={value || "Não informado"}
                    readOnly
                />
            </div>
        </div>
    );
}

function formatarData(data?: string | null) {
    if (!data) return "—";
    return new Date(data).toLocaleDateString("pt-BR");
}

function obterNomeArquivo(arquivo?: string | null) {
    if (!arquivo) return null;

    const partes = arquivo.split(/[\\/]/);
    return partes[partes.length - 1] || arquivo;
}

export default function Visualizar() {
    const { codigo } = useParams<{ codigo: string }>();

    const [norma, setNorma] = useState<NormaDetalhes | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [pdfModalOpen, setPdfModalOpen] = useState(false);

    useEffect(() => {
        if (!codigo) {
            setErro("Código da norma não informado.");
            setCarregando(false);
            return;
        }

        const buscarNorma = async () => {
            setCarregando(true);
            setErro(null);

            try {
                const data = await getNormaDetalhes(decodeURIComponent(codigo));
                setNorma(data);
            } catch (err: any) {
                const mensagem =
                    err?.response?.data?.error ||
                    err?.response?.data?.message ||
                    err?.message ||
                    "Erro ao carregar norma.";

                setErro(mensagem);
                setNorma(null);
            } finally {
                setCarregando(false);
            }
        };

        buscarNorma();
    }, [codigo]);

    const dataFormatada = formatarData(norma?.data_publicacao);
    const nomeArquivo = obterNomeArquivo(norma?.arquivo);
    const nomeArquivoLabel = nomeArquivo ?? "Sem arquivo cadastrado";
    const exibirTooltipArquivo = Boolean(nomeArquivo);
    const normasRelacionada = norma?.normas_relacionadas_ids ?? [];
    const notas = norma?.notas ?? [];

    const normaModal = norma
        ? {
            codigo: norma.codigo,
            titulo: norma.titulo,
            status: norma.status,
            orgaoEmissor: norma.orgao_emissor?.nome,
            categoria: norma.categoria?.nome,
            revisao: norma.revisao,
            escopo: norma.escopo ?? undefined,
            palavrasChave: norma.palavras_chave ?? undefined,
            normaRelacionada: norma.normas_relacionadas_ids ?? undefined,
        }
        : null;

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#fbfbfb] font-dm pb-16 md:pb-16">
            <div className="flex flex-1">
                <Sidebar />

                <div className="flex-1 flex flex-col">

                    <div className="flex flex-wrap items-center gap-4 border-b border-font-border bg-white px-7 py-6">
                        <div className="flex items-center gap-4">
                            <Link
                                to="/home"
                                className="inline-flex items-center gap-2 rounded-md border border-font-border px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-dark-title"
                            >
                                <ChevronLeft size={14} />
                                Voltar
                            </Link>

                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink asChild>
                                            <Link to="/home">Normas</Link>
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbPage className="flex items-center gap-2">
                                            Visualização Detalhada
                                            {norma?.codigo && (
                                                <span className="inline-flex items-center rounded-full border border-font-border bg-[#FAF9F7] px-2 py-0.5 text-xs font-medium text-gray-600">
                                                    {norma.codigo}
                                                </span>
                                            )}
                                        </BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </div>

                    <main className="flex-1 px-8 pt-2 pb-8 overflow-y-auto">
                        {carregando && (
                            <div className="flex items-center justify-center py-24 text-gray-400">
                                <Loader2 className="animate-spin mr-2" size={20} />
                                Carregando norma...
                            </div>
                        )}

                        {!carregando && erro && (
                            <div className="flex items-center justify-center py-24 text-red-500 text-sm">
                                {erro}
                            </div>
                        )}

                        {!carregando && !erro && !norma && (
                            <div className="flex items-center justify-center py-24 text-red-500 text-sm">
                                Norma não encontrada.
                            </div>
                        )}

                        {!carregando && !erro && norma && (
                            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                                <div className="space-y-6">
                                    <Section icon={<IdCard size={14} />} title="Identificação">
                                        <div className="grid grid-cols-3 gap-4">
                                            {/* Linha 1 — Título */}
                                            <div className="col-span-3">
                                                <ReadOnlyField label="TÍTULO" value={norma.titulo} />
                                            </div>
                                            {/* Linha 2 — Código */}
                                            <div className="col-span-3">
                                                <ReadOnlyField label="CÓDIGO" value={norma.codigo} />
                                            </div>
                                            {/* Linha 3 — Status + Revisão + Data de Publicação */}
                                            <ReadOnlyField label="STATUS" value={norma.status} />
                                            <ReadOnlyField label="REVISÃO" value={norma.revisao ?? "—"} />
                                            <ReadOnlyField
                                                label="DATA DE PUBLICAÇÃO"
                                                value={dataFormatada}
                                                icon={<Calendar size={14} />}
                                            />
                                            {/* Linha 4 — Órgão Emissor + Categoria + Etapa do Projeto */}
                                            <ReadOnlyField label="ÓRGÃO EMISSOR" value={norma.orgao_emissor?.nome} />
                                            <ReadOnlyField label="CATEGORIA" value={norma.categoria?.nome} />
                                            <ReadOnlyField label="ETAPA DO PROJETO" value={norma.etapa_projeto?.nome} />
                                        </div>
                                    </Section>

                                    <Section icon={<BookOpenCheck size={14} />} title="Escopo">
                                        <div className="flex flex-col text-start gap-1">
                                            <label className="text-xs text-gray-400 tracking-widest block mb-1">
                                                RESUMO DA NORMA
                                            </label>
                                            <textarea
                                                className="w-full border border-font-border rounded-md p-3 min-h-28 text-sm bg-[#FAF9F7] text-dark-title focus:outline-none resize-y"
                                                value={norma.escopo ?? "Não informado"}
                                                readOnly
                                            />
                                        </div>
                                    </Section>

                                    <Section icon={<Tag size={14} />} title="Palavras-Chave">
                                        <div className="flex flex-wrap gap-2">
                                            {norma.palavras_chave?.length ? (
                                                norma.palavras_chave.map((item, index) => (
                                                    <span
                                                        key={`${item}-${index}`}
                                                        className="px-2 py-1 rounded-full bg-red-50 text-sm border border-[#73203A]/20 text-red-akaer flex items-center gap-1"
                                                    >
                                                        <Tag size={12} />
                                                        {item}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-sm text-gray-400">
                                                    Nenhuma palavra-chave cadastrada
                                                </span>
                                            )}
                                        </div>
                                    </Section>
                                </div>

                                <div className="space-y-6">
                                    <Section icon={<FileText size={14} />} title="Arquivo PDF">
                                        <button
                                            type="button"
                                            onClick={() => setPdfModalOpen(true)}
                                            disabled={!norma.arquivo}
                                            className="w-full rounded-lg border border-gray-200 bg-[#fbfbfb] p-4 text-left transition hover:border-red-akaer/40 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <div className="flex items-start gap-3 hover:cursor-pointer">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-md border border-red-akaer/30 bg-red-50 text-red-akaer">
                                                    <FileText size={18} />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    {exibirTooltipArquivo ? (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <div className="min-w-0">
                                                                        <p className="text-sm font-semibold text-dark-title truncate inline-block max-w-full">
                                                                            {nomeArquivoLabel}
                                                                        </p>
                                                                        <p className="text-xs text-gray-400">PDF</p>
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="max-w-xs w-auto block whitespace-normal break-words text-left">
                                                                    {nomeArquivo}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    ) : (
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-dark-title truncate inline-block max-w-full">
                                                                {nomeArquivoLabel}
                                                            </p>
                                                            <p className="text-xs text-gray-400">PDF</p>
                                                        </div>
                                                    )}

                                                </div>
                                            </div>
                                        </button>
                                    </Section>

                                    <Section icon={<LiaCodeBranchSolid size={14} />} title="Correlações">
                                        {normasRelacionada.length ? (
                                            <div className="grid grid-cols-1 gap-2 w-full">
                                                {normasRelacionada.map(n => (
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
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                Nenhuma correlação cadastrada
                                            </div>
                                        )}
                                    </Section>

                                    <Section icon={<StickyNote size={14} />} title="Notas">
                                        {notas.length > 0 ? (
                                            <div className="flex flex-col gap-3">
                                                {notas.map((nota, index) => (
                                                    <div
                                                        key={nota.id ?? index}
                                                        className="rounded-lg border border-gray-200 bg-gray-50/60 p-3"
                                                    >
                                                        <span className="text-[11px] font-semibold text-gray-400">
                                                            Nota {index + 1}
                                                        </span>

                                                        <p className="mt-1 text-sm text-dark-title leading-relaxed">
                                                            {nota.texto}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400">
                                                Nenhuma nota cadastrada
                                            </span>
                                        )}
                                    </Section>
                                </div>
                            </div>
                        )}
                    </main>
                </div >
            </div >

            <PdfViewerModal
                open={pdfModalOpen}
                onOpenChange={setPdfModalOpen}
                norma={normaModal}
            />
        </div >
    );
}