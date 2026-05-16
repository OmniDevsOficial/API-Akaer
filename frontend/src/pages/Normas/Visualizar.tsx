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
} from "lucide-react";

import Header from "../../components/header";
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
            <label className="text-lg text-gray-600 mb-0 leading-none">
                {label}
            </label>

            <div className="relative">
                {icon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                    </span>
                )}

                <input
                    className={`bg-gray-100/80 border rounded h-10 pr-2 text-gray-700 ${icon ? "pl-8" : "px-2"
                        }`}
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
        <div className="min-h-screen bg-[#fbfbfb] flex flex-col font-dm">
            <Header />

            <div className="flex flex-1">
                <Sidebar />

                <div className="flex-1 flex flex-col">
                    <div className="flex flex-wrap items-center gap-4 border-b border-font-border bg-white px-7 py-5">
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
                                        <BreadcrumbPage>Visualização Detalhada</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </div>

                    <main className="flex-1 px-14 pb-10 pt-6">
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
                            <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
                                <div className="space-y-6">
                                    <Section icon={<IdCard size={14} />} title="Identificação">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <ReadOnlyField label="TÍTULO" value={norma.titulo} />
                                            <ReadOnlyField label="CÓDIGO" value={norma.codigo} />
                                            <ReadOnlyField label="ÓRGÃO EMISSOR" value={norma.orgao_emissor?.nome} />
                                            <ReadOnlyField label="STATUS" value={norma.status} />
                                            <ReadOnlyField label="CATEGORIA" value={norma.categoria?.nome} />
                                            <ReadOnlyField label="ETAPA DO PROJETO" value={norma.etapa_projeto?.nome} />
                                            <ReadOnlyField
                                                label="DATA DE PUBLICAÇÃO"
                                                value={dataFormatada}
                                                icon={<Calendar size={14} />}
                                            />
                                            <ReadOnlyField label="REVISÃO" value={norma.revisao ?? "—"} />
                                        </div>
                                    </Section>

                                    <Section icon={<BookOpenCheck size={14} />} title="Escopo">
                                        <div className="flex flex-col text-start gap-1">
                                            <label className="text-lg text-gray-600 mb-0 leading-none">
                                                RESUMO DA NORMA
                                            </label>

                                            <textarea
                                                className="bg-gray-100/80 border rounded p-3 min-h-28 text-gray-700"
                                                value={norma.escopo ?? "Não informado"}
                                                readOnly
                                            />
                                        </div>

                                        <div className="mt-5 flex flex-col text-start gap-1">
                                            <label className="text-lg text-gray-600 mb-0 leading-none">
                                                PALAVRAS-CHAVE
                                            </label>

                                            <div className="flex flex-wrap gap-2 border rounded p-3 bg-gray-100/60">
                                                {norma.palavras_chave?.length ? (
                                                    norma.palavras_chave.map((item, index) => (
                                                        <span
                                                            key={`${item}-${index}`}
                                                            className="px-2 py-1 rounded-full bg-red-50 text-sm text-red-akaer flex items-center gap-1"
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
                                                                    <p className="text-sm font-semibold text-dark-title truncate inline-block max-w-full">
                                                                        {nomeArquivoLabel}
                                                                    </p>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="max-w-xs w-auto block whitespace-normal break-words text-left">
                                                                    {nomeArquivo}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    ) : (
                                                        <p className="text-sm font-semibold text-dark-title truncate inline-block max-w-full">
                                                            {nomeArquivoLabel}
                                                        </p>
                                                    )}

                                                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={12} />
                                                            {dataFormatada}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    </Section>

                                    <Section icon={<FileText size={14} />} title="Correlações">
                                        <div className="flex flex-wrap gap-2">
                                            {normasRelacionada.length > 0 ? (
                                                normasRelacionada.map((n: any) => (
                                                    <span
                                                        key={n.codigo}
                                                        className="px-3 py-1 rounded-full bg-red-50 text-sm text-red-akaer flex items-center gap-1"
                                                    >
                                                        {n.codigo}
                                                        {n.titulo ? ` — ${n.titulo}` : ""}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-sm text-gray-400">
                                                    Nenhuma correlação cadastrada
                                                </span>
                                            )}
                                        </div>
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

                                                        <p className="mt-1 text-sm text-gray-700 leading-relaxed">
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
                </div>
            </div>

            <PdfViewerModal
                open={pdfModalOpen}
                onOpenChange={setPdfModalOpen}
                norma={normaModal}
            />
        </div>
    );
}