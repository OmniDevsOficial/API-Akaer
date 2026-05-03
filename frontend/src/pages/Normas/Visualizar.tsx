import { useState } from "react";
import { Link } from "react-router-dom";
import {
    BookOpenCheck,
    Calendar,
    ChevronLeft,
    FileText,
    Globe,
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
import { getNormaDetalhes, type NormaDetalhes } from "../../services/normaService";


interface NormaModalInfo {
    codigo?: string;
    titulo?: string;
    status?: string;
    orgaoEmissor?: string;
    categoria?: string;
    revisao?: string | null;
    escopo?: string;
    palavrasChave?: string[];
    normaRelacionada?: string[];
}

const NORMA_CODIGO_PDF = "523542";

const normaMock = {
    titulo: "Certificação de sistemas",
    codigo: "CS-25",
    orgaoEmissor: "ANAC",
    status: "Ativa",
    categoria: "Certificação",
    etapaProjeto: "Montagem",
    dataPublicacao: "12/12/2000",
    revisao: "C",
    escopo:
        "Requisitos para sistemas de aeronaves com foco em segurança estrutural, manutenção e rastreabilidade.",
    palavrasChave: ["certificação", "estrutural", "easa"],
    arquivo: {
        nome: "cs_25_amdt27.pdf",
        visibilidade: "Público",
    },
    notas: [
        "Selagem incluída na hora de acoplar asa e charuto",
        "Pintura da porta de emergência agora é no F-210",
        "Na página 108 fala tira as dúvidas sobre a distância dos parafusos na peça I.",
    ],
};

const mapNormaModalInfo = (data: NormaDetalhes): NormaModalInfo => ({
    codigo: data.codigo,
    titulo: data.titulo,
    status: data.status,
    orgaoEmissor: data.orgao_emissor?.nome ?? undefined,
    categoria: data.categoria?.nome ?? undefined,
    revisao: data.revisao,
    escopo: data.escopo ?? undefined,
    palavrasChave: data.palavras_chave ?? undefined,
});

export default function Visualizar() {
    const [pdfModalOpen, setPdfModalOpen] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfError, setPdfError] = useState<string | null>(null);
    const [normaModal, setNormaModal] = useState<NormaModalInfo | null>(null);
    const [normasRelacionada, setNormasRelacionada] = useState<any[]>([]);


    /* Layout card Correlação */
    const sectionClass = 'border border-font-border rounded-md p-4';
    const sectionHeaderClass = 'flex items-center gap-2 border-b border-font-border pb-3 mb-4 text-xs font-semibold tracking-widest text-gray-regular';

    const handlePdfClick = async () => {
        if (pdfLoading) {
            return;
        }

        setPdfLoading(true);
        setPdfError(null);

        try {
            const response = await getNormaDetalhes(NORMA_CODIGO_PDF);
            setNormaModal(mapNormaModalInfo(response));
            setPdfModalOpen(true);
        } catch (error: any) {
            const mensagem =
                error?.response?.data?.error ||
                error?.message ||
                "Não foi possível carregar os dados do PDF.";
            setPdfError(mensagem);
        } finally {
            setPdfLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fbfbfb] flex flex-col font-dm">
            <Header />

            <div className="flex flex-1">
                <Sidebar />

                <div className="flex-1 flex flex-col">
                    <div className="">
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
                    </div>

                    <main className="flex-1 px-14 pb-10 pt-6">

                        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
                            <div className="space-y-6">
                                <section className="rounded-xl border border-font-border bg-white overflow-hidden">
                                    <div className="flex items-center gap-2 border-b border-font-border bg-white px-6 py-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
                                        <IdCard size={14} />
                                        Identificação
                                    </div>

                                    <div className="p-6">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="flex flex-col text-start gap-1">
                                                <label className="text-lg text-gray-600 mb-0 leading-none">
                                                    TÍTULO
                                                </label>
                                                <input
                                                    className="bg-gray-100/80 border rounded h-10 px-2 text-gray-700"
                                                    value={normaMock.titulo}
                                                    readOnly
                                                />
                                            </div>

                                            <div className="flex flex-col text-start gap-1">
                                                <label className="text-lg text-gray-600 mb-0 leading-none">
                                                    CÓDIGO
                                                </label>
                                                <input
                                                    className="bg-gray-100/80 border rounded h-10 px-2 text-gray-700"
                                                    value={normaMock.codigo}
                                                    readOnly
                                                />
                                            </div>

                                            <div className="flex flex-col text-start gap-1">
                                                <label className="text-lg text-gray-600 mb-0 leading-none">
                                                    ÓRGÃO EMISSOR
                                                </label>
                                                <select
                                                    className="bg-gray-100/80 border rounded h-10 px-2 text-gray-700 disabled:opacity-100"
                                                    value={normaMock.orgaoEmissor}
                                                    disabled
                                                    onChange={() => undefined}
                                                >
                                                    <option value={normaMock.orgaoEmissor}>
                                                        {normaMock.orgaoEmissor}
                                                    </option>
                                                </select>
                                            </div>

                                            <div className="flex flex-col text-start gap-1">
                                                <label className="text-lg text-gray-600 mb-0 leading-none">
                                                    STATUS
                                                </label>
                                                <select
                                                    className="bg-gray-100/80 border rounded h-10 px-2 text-gray-700 disabled:opacity-100"
                                                    value={normaMock.status}
                                                    disabled
                                                    onChange={() => undefined}
                                                >
                                                    <option value={normaMock.status}>{normaMock.status}</option>
                                                </select>
                                            </div>

                                            <div className="flex flex-col text-start gap-1">
                                                <label className="text-lg text-gray-600 mb-0 leading-none">
                                                    CATEGORIA
                                                </label>
                                                <select
                                                    className="bg-gray-100/80 border rounded h-10 px-2 text-gray-700 disabled:opacity-100"
                                                    value={normaMock.categoria}
                                                    disabled
                                                    onChange={() => undefined}
                                                >
                                                    <option value={normaMock.categoria}>{normaMock.categoria}</option>
                                                </select>
                                            </div>

                                            <div className="flex flex-col text-start gap-1">
                                                <label className="text-lg text-gray-600 mb-0 leading-none">
                                                    ETAPA DO PROJETO
                                                </label>
                                                <select
                                                    className="bg-gray-100/80 border rounded h-10 px-2 text-gray-700 disabled:opacity-100"
                                                    value={normaMock.etapaProjeto}
                                                    disabled
                                                    onChange={() => undefined}
                                                >
                                                    <option value={normaMock.etapaProjeto}>
                                                        {normaMock.etapaProjeto}
                                                    </option>
                                                </select>
                                            </div>

                                            <div className="flex flex-col text-start gap-1">
                                                <label className="text-lg text-gray-600 mb-0 leading-none">
                                                    DATA DE PUBLICAÇÃO
                                                </label>
                                                <div className="relative">
                                                    <Calendar
                                                        size={14}
                                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                                    />
                                                    <input
                                                        className="bg-gray-100/80 border rounded h-10 pl-8 pr-2 text-gray-700"
                                                        value={normaMock.dataPublicacao}
                                                        readOnly
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-col text-start gap-1">
                                                <label className="text-lg text-gray-600 mb-0 leading-none">
                                                    REVISÃO
                                                </label>
                                                <input
                                                    className="bg-gray-100/80 border rounded h-10 px-2 text-gray-700"
                                                    value={normaMock.revisao}
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="rounded-xl border border-font-border bg-white overflow-hidden">
                                    <div className="flex items-center gap-2 border-b border-font-border bg-white px-6 py-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
                                        <BookOpenCheck size={14} />
                                        Escopo
                                    </div>

                                    <div className="p-6">
                                        <div className="flex flex-col text-start gap-1">
                                            <label className="text-lg text-gray-600 mb-0 leading-none">
                                                RESUMO DA NORMA
                                            </label>
                                            <textarea
                                                className="bg-gray-100/80 border rounded p-3 min-h-28 text-gray-700"
                                                value={normaMock.escopo}
                                                readOnly
                                            />
                                        </div>

                                        <div className="mt-5 flex flex-col text-start gap-1">
                                            <label className="text-lg text-gray-600 mb-0 leading-none">
                                                PALAVRAS-CHAVE
                                            </label>
                                            <div className="flex flex-wrap gap-2 border rounded p-3 bg-gray-100/60">
                                                {normaMock.palavrasChave.map((item) => (
                                                    <span
                                                        key={item}
                                                        className="px-2 py-1 rounded-full bg-red-50 text-sm text-red-akaer flex items-center gap-1"
                                                    >
                                                        <Tag size={12} />
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="space-y-6">
                                <section className="rounded-xl border border-font-border bg-white overflow-hidden">
                                    <div className="flex items-center gap-2 border-b border-font-border bg-white px-6 py-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
                                        <FileText size={14} />
                                        Arquivo PDF
                                    </div>

                                    <div className="p-6">
                                        <button
                                            type="button"
                                            onClick={handlePdfClick}
                                            disabled={pdfLoading}
                                            className="w-full rounded-lg border border-gray-200 bg-[#fbfbfb] p-4 text-left transition hover:border-red-akaer/40 hover:shadow-sm disabled:cursor-not-allowed"
                                        >
                                            <div className="flex items-start gap-3 hover:cursor-pointer">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-md border border-red-akaer/30 bg-red-50 text-red-akaer">
                                                    {pdfLoading ? (
                                                        <Loader2 className="animate-spin" size={18} />
                                                    ) : (
                                                        <FileText size={18} />
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-dark-title">
                                                        {normaMock.arquivo.nome}
                                                    </p>

                                                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={12} />
                                                            {normaMock.dataPublicacao}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Globe size={12} />
                                                            {normaMock.arquivo.visibilidade}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>

                                        {pdfError && (
                                            <p className="mt-3 text-xs text-red-500">{pdfError}</p>
                                        )}
                                    </div>
                                </section>

                                {/* CORRELAÇÕES */}
<section className={sectionClass}>
    <header className={sectionHeaderClass}>
        <FileText size={14} />
        CORRELAÇÕES
    </header>

    <div className="flex flex-wrap gap-2">
        {normasRelacionada.length > 0 ? (
            normasRelacionada.map((n) => (
                <span
                    key={n.codigo}
                    className="px-3 py-1 rounded-full bg-red-50 text-sm text-red-akaer flex items-center gap-1"
                >
                    {n.codigo} — {n.titulo}
                </span>
            ))
        ) : (
            <span className="text-sm text-gray-400">Nenhuma correlação cadastrada</span>
        )}
    </div>
</section>

                                {normaMock.notas.length > 0 && (
                                    <section className="rounded-xl border border-font-border bg-white overflow-hidden">
                                        <div className="flex items-center gap-2 border-b border-font-border bg-white px-6 py-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
                                            <StickyNote size={14} />
                                            Notas
                                        </div>

                                        <div className="p-6">
                                            <div className="flex flex-col gap-3">
                                                {normaMock.notas.map((nota, index) => (
                                                    <div
                                                        key={index}
                                                        className="rounded-lg border border-gray-200 bg-gray-50/60 p-3"
                                                    >
                                                        <span className="text-[11px] font-semibold text-gray-400">
                                                            Nota {index + 1}
                                                        </span>
                                                        <p className="mt-1 text-sm text-gray-700 leading-relaxed">
                                                            {nota}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </section>
                                )}
                            </div>
                        </div>
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