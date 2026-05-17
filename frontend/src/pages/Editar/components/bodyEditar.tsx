import {
    useEffect,
    useState,
    useRef,
    useImperativeHandle,
    forwardRef,
} from "react";
import { useLocation } from "react-router-dom";
import { BookOpenCheck, FileText, IdCard, StickyNote, Tag, X, Loader2 } from "lucide-react";
import { NormasRelatedSelector } from '@/components/normas-related-selector';
import { atualizarNorma, getNormaDetalhes } from "@/services/normaService";
import api from "@/services/api";
import PdfViewerModal from "@/components/pdf-viewer-modal";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../../../components/ui/tooltip";

export interface BodyEditarHandle {
    salvar: () => Promise<void>;
}

function obterNomeArquivo(arquivo?: string | null) {
    if (!arquivo) return "";
    const partes = arquivo.split(/[\\/]/);
    return partes[partes.length - 1] || arquivo;
}

const BodyEditar = forwardRef<BodyEditarHandle>((_, ref) => {
    const normaBase = useLocation().state?.norma;
    const ArquivoPdf = useRef<HTMLInputElement>(null);

    const [listaOrgao, setListaOrgao] = useState<any[]>([]);
    const [listaCategoria, setListaCategoria] = useState<any[]>([]);
    const [listaEtapaProjeto, setListaEtapaProjeto] = useState<any[]>([]);
    const [arquivoNorma, setArquivoNorma] = useState<File | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [pdfModalOpen, setPdfModalOpen] = useState(false);

    const [form, setForm] = useState({
        titulo: normaBase?.titulo || "",
        codigo: normaBase?.codigo || "",
        orgaoEmissorId: "",
        status: normaBase?.status || "Ativa",
        categoriaId: "",
        etapaProjetoId: "",
        revisao: normaBase?.revisao || "",
        escopo: "",
        dataPublicacao: "",
        arquivo: normaBase?.arquivo || "",
    });

    const [palavrasChave, setPalavrasChave] = useState<string[]>([]);
    const [palavraInput, setPalavraInput] = useState("");

    const [notas, setNotas] = useState<string[]>([]);
    const [notaInput, setNotaInput] = useState("");

    const [correlacoes, setCorrelacoes] = useState<any[]>([]);
    const [dadosIniciais, setDadosIniciais] = useState<any>(null);

    useEffect(() => {
        if (!normaBase?.codigo) {
            setCarregando(false);
            return;
        }

        const buscarDados = async () => {
            setCarregando(true);

            try {
                const [detalhes, orgaos, categorias, etapas] = await Promise.all([
                    getNormaDetalhes(normaBase.codigo),
                    api.get("/orgaos-emissores"),
                    api.get("/categorias"),
                    api.get("/etapas-projeto"),
                ]);

                setListaOrgao(orgaos.data);
                setListaCategoria(categorias.data);
                setListaEtapaProjeto(etapas.data);

                const novoForm = {
                    titulo: detalhes.titulo || "",
                    codigo: detalhes.codigo || "",
                    orgaoEmissorId: detalhes.orgao_emissor?.id?.toString() || "",
                    status: detalhes.status || "Ativa",
                    categoriaId: detalhes.categoria?.id?.toString() || "",
                    etapaProjetoId: detalhes.etapa_projeto?.id?.toString() || "",
                    revisao: detalhes.revisao || "",
                    escopo: detalhes.escopo || "",
                    dataPublicacao: detalhes.data_publicacao || "",
                    arquivo: detalhes.arquivo || "",
                };

                const novasPalavras = detalhes.palavras_chave || [];
                const novasNotas = (detalhes.notas || []).map((nota: any) => nota.texto);
                const novasCorrelacoes = detalhes.normas_relacionadas_ids || [];

                setForm(novoForm);
                setPalavrasChave(novasPalavras);
                setNotas(novasNotas);
                setCorrelacoes(novasCorrelacoes);

                // salva depois de tudo estar preenchido
                setDadosIniciais({
                    form: novoForm,
                    palavrasChave: novasPalavras,
                    notas: novasNotas,
                    correlacoes: novasCorrelacoes,
                });
            } catch (err) {
                console.error("Erro ao carregar dados da norma:", err);
            } finally {
                setCarregando(false);
            }
        };

        buscarDados();
    }, [normaBase?.codigo]);

    useImperativeHandle(ref, () => ({
        salvar: async () => {
            const semAlteracao =
                JSON.stringify(form) === JSON.stringify(dadosIniciais?.form) &&
                JSON.stringify(palavrasChave) === JSON.stringify(dadosIniciais?.palavrasChave) &&
                JSON.stringify(notas) === JSON.stringify(dadosIniciais?.notas) &&
                JSON.stringify(correlacoes) === JSON.stringify(dadosIniciais?.correlacoes);
            console.log(dadosIniciais);
            if (semAlteracao) {
                throw new Error("Nenhuma alteração foi feita.");
            }
            if (!form.codigo) {
                throw new Error("Código da norma não encontrado para atualização.");
            }

            const payload = {
                titulo: form.titulo,
                orgao_emissor_id: form.orgaoEmissorId || undefined,
                categoria_id: form.categoriaId || undefined,
                etapa_projeto_id: form.etapaProjetoId || undefined,
                revisao: form.revisao || undefined,
                status: form.status,
                escopo: form.escopo || undefined,
                palavras_chave: palavrasChave,
                notas,
                normas_relacionadas_ids: correlacoes.map((c: any) => c.codigo),
            };

            await atualizarNorma(form.codigo, payload);
        },
    }));

    const handleChange = (campo: string, valor: string) => {
        setForm((prev) => ({ ...prev, [campo]: valor }));
    };

    const adicionarPalavra = () => {
        if (!palavraInput.trim()) return;
        if (palavrasChave.includes(palavraInput.trim())) {
            alert("Palavra-chave já inserida");
            return;
        }
        setPalavrasChave((prev) => [...prev, palavraInput.trim()]);
        setPalavraInput("");
    };

    const removerPalavra = (index: number) => {
        setPalavrasChave((prev) => prev.filter((_, i) => i !== index));
    };

    const adicionarNota = () => {
        if (!notaInput.trim()) return;
        setNotas((prev) => [...prev, notaInput.trim()]);
        setNotaInput("");
    };

    const removerNota = (index: number) => {
        setNotas((prev) => prev.filter((_, i) => i !== index));
    };

    const dataFormatada = form.dataPublicacao
        ? new Date(form.dataPublicacao).toLocaleDateString("pt-BR")
        : "—";
    const nomeArquivoAtual = arquivoNorma?.name ?? obterNomeArquivo(form.arquivo);
    const nomeArquivoLabel = nomeArquivoAtual || "Sem arquivo cadastrado";
    const exibirTooltipArquivo = Boolean(nomeArquivoAtual);

    const inputClass = "w-full border border-font-border rounded-md px-3 py-2 text-sm focus:outline-none bg-[#FAF9F7]";
    const labelClass = "text-xs text-gray-400 tracking-widest block mb-1";
    const sectionClass = "rounded-xl border border-font-border bg-white overflow-hidden";
    const sectionHeaderClass = "flex items-center gap-2 border-b border-font-border bg-white px-6 py-4 text-xs font-semibold uppercase tracking-widest text-gray-500";
    const sectionBodyClass = "p-6";

    if (carregando) {
        return (
            <div className="flex items-center justify-center py-24 text-gray-400">
                <Loader2 className="animate-spin mr-2" size={20} />
                Carregando dados da norma...
            </div>
        );
    }

    return (
        <>
        <div className="min-h-screen bg-[#fbfbfb] p-8 font-dm">
            <div className="grid grid-cols-[1fr_400px] gap-6">

                {/* COLUNA ESQUERDA */}
                <div className="flex flex-col gap-6">

                    {/* IDENTIFICAÇÃO */}
                    <div className={sectionClass}>
                        <div className={sectionHeaderClass}>
                            <IdCard size={14} />
                            IDENTIFICAÇÃO
                        </div>
                        <div className={sectionBodyClass}>
                            <div className="grid grid-cols-3 gap-4">

                                {/* Linha 1 — Título */}
                                <div className="col-span-3">
                                    <label className={labelClass}>TÍTULO</label>
                                    <input
                                        type="text"
                                        value={form.titulo}
                                        onChange={(e) => handleChange("titulo", e.target.value)}
                                        className={inputClass}
                                    />
                                </div>

                                {/* Linha 2 — Código */}
                                <div className="col-span-3">
                                    <label className={labelClass}>CÓDIGO DA NORMA</label>
                                    <input
                                        type="text"
                                        value={form.codigo}
                                        disabled
                                        className={`${inputClass} opacity-60 cursor-not-allowed`}
                                    />
                                </div>

                                {/* Linha 3 — Status + Revisão + Data de Publicação */}
                                <div>
                                    <label className={labelClass}>STATUS</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => handleChange("status", e.target.value)}
                                        className={inputClass}
                                    >
                                        <option value="Ativa">Ativa</option>
                                        <option value="Obsoleta">Obsoleta</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClass}>REVISÃO</label>
                                    <input
                                        type="text"
                                        value={form.revisao}
                                        onChange={(e) => handleChange("revisao", e.target.value)}
                                        className={inputClass}
                                        maxLength={1}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>DATA DE PUBLICAÇÃO</label>
                                    <p className={inputClass}>{dataFormatada}</p>
                                </div>

                                {/* Linha 4 — Órgão Emissor + Categoria + Etapa do Projeto */}
                                <div>
                                    <label className={labelClass}>ÓRGÃO EMISSOR</label>
                                    <select
                                        value={form.orgaoEmissorId}
                                        onChange={(e) => handleChange("orgaoEmissorId", e.target.value)}
                                        className={inputClass}
                                    >
                                        <option value="">Selecione...</option>
                                        {listaOrgao.map((orgao) => (
                                            <option key={orgao.id} value={orgao.id}>
                                                {orgao.nome?.trim() || `Órgão ${orgao.id}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClass}>CATEGORIA</label>
                                    <select
                                        value={form.categoriaId}
                                        onChange={(e) => handleChange("categoriaId", e.target.value)}
                                        className={inputClass}
                                    >
                                        <option value="">Selecione...</option>
                                        {listaCategoria.map((categoria) => (
                                            <option key={categoria.id} value={categoria.id}>
                                                {categoria.nome}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClass}>ETAPA DO PROJETO</label>
                                    <select
                                        value={form.etapaProjetoId}
                                        onChange={(e) => handleChange("etapaProjetoId", e.target.value)}
                                        className={inputClass}
                                    >
                                        <option value="">Selecione...</option>
                                        {listaEtapaProjeto.map((etapa) => (
                                            <option key={etapa.id} value={etapa.id}>
                                                {etapa.nome}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* ESCOPO */}
                    <div className={sectionClass}>
                        <div className={sectionHeaderClass}>
                            <BookOpenCheck size={14} />
                            ESCOPO
                        </div>
                        <div className={sectionBodyClass}>
                            <label className={labelClass}>RESUMO DA NORMA</label>
                            <textarea
                                value={form.escopo}
                                onChange={(e) => handleChange("escopo", e.target.value)}
                                className={`${inputClass} min-h-[100px] resize-y`}
                            />
                        </div>
                    </div>

                    {/* PALAVRAS-CHAVE */}
                    <div className={sectionClass}>
                        <div className={sectionHeaderClass}>
                            <Tag size={14} />
                            PALAVRAS-CHAVE
                        </div>
                        <div className={sectionBodyClass}>
                            <div className="mb-3">
                                {palavrasChave.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {palavrasChave.map((palavra, index) => (
                                            <span
                                                key={`${palavra}-${index}`}
                                                className="flex items-center gap-1 bg-red-50 text-red-akaer px-2 py-1 rounded-full text-sm"
                                            >
                                                <Tag size={12} />
                                                {palavra}
                                                <X
                                                    size={12}
                                                    className="cursor-pointer hover:opacity-60"
                                                    onClick={() => removerPalavra(index)}
                                                />
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-md border border-font-border bg-[#FAF9F7] px-3 py-2 text-sm text-gray-400">
                                        Nenhuma palavra-chave cadastrada
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={palavraInput}
                                    onChange={(e) => setPalavraInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            adicionarPalavra();
                                        }
                                    }}
                                    placeholder="Adicionar nova palavra..."
                                    className={inputClass}
                                />
                                <button
                                    type="button"
                                    onClick={adicionarPalavra}
                                    className="bg-gray-800 text-white px-4 rounded-md text-sm cursor-pointer"
                                >
                                    Adicionar
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

                {/* COLUNA DIREITA */}
                <div className="flex flex-col gap-6">

                    {/* ARQUIVO PDF */}
                    <div className={sectionClass}>
                        <div className={sectionHeaderClass}>
                            <FileText size={14} />
                            ARQUIVO PDF
                        </div>
                        <div className="pr-6 py-3 pl-3">
                            <div className="flex items-stretch gap-3">
                                {/* Coluna Ver PDF — ocupa todo espaço disponível */}
                                <button
                                    type="button"
                                    onClick={() => setPdfModalOpen(true)}
                                    disabled={!form.arquivo && !arquivoNorma}
                                    className="cursor-pointer min-w-0 flex-1 rounded-lg border border-transparent p-4 text-left transition hover:border-red-akaer/40 hover:bg-[#fbfbfb] hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <div className="flex items-start gap-3 min-w-0">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-red-akaer/30 bg-red-50 text-red-akaer">
                                            <FileText size={18} />
                                        </div>

                                        <TooltipProvider>
                                            {exibirTooltipArquivo ? (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="min-w-0 overflow-hidden">
                                                            <p className="text-sm font-semibold text-dark-title truncate">
                                                                {nomeArquivoLabel}
                                                            </p>
                                                            <p className="text-xs text-gray-400">PDF</p>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-xs w-auto block px-2 whitespace-normal break-words text-left">
                                                        {nomeArquivoAtual}
                                                    </TooltipContent>
                                                </Tooltip>
                                            ) : (
                                                <div className="min-w-0 overflow-hidden">
                                                    <p className="text-sm font-semibold text-dark-title truncate">
                                                        {nomeArquivoLabel}
                                                    </p>
                                                    <p className="text-xs text-gray-400">PDF</p>
                                                </div>
                                            )}
                                        </TooltipProvider>
                                    </div>
                                </button>

                                {/* Coluna Substituir — largura natural do botão */}
                                <div className="flex items-center shrink-0">
                                    <input
                                        ref={ArquivoPdf}
                                        type="file"
                                        accept=".pdf"
                                        className="hidden"
                                        onChange={(e) => setArquivoNorma(e.target.files?.[0] || null)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => ArquivoPdf.current?.click()}
                                        className="text-xs border border-font-border rounded-md px-3 py-1.5 text-gray-500 hover:bg-gray-50 transition-colors whitespace-nowrap"
                                    >
                                        ↺ Substituir
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CORRELAÇÕES */}
                    <div className={sectionClass}>
                        <div className={sectionHeaderClass}>
                            <FileText size={14} />
                            CORRELAÇÕES
                        </div>
                        <div className={sectionBodyClass}>
                            <NormasRelatedSelector
                                selecionadas={correlacoes}
                                onChange={setCorrelacoes}
                                codigoAtual={form.codigo}
                                usePortal
                            />
                        </div>
                    </div>

                    {/* NOTAS */}
                    <div className={sectionClass}>
                        <div className={sectionHeaderClass}>
                            <StickyNote size={14} />
                            NOTAS
                        </div>
                        <div className={sectionBodyClass}>
                            <div className="flex flex-col gap-2 mb-3">
                                {notas.length > 0 ? (
                                    notas.map((nota, index) => (
                                        <div
                                            key={`${nota}-${index}`}
                                            className="flex items-start justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50/60 p-3"
                                        >
                                            <div>
                                                <span className="text-[11px] font-semibold text-gray-400">
                                                    Nota {index + 1}
                                                </span>
                                                <p className="mt-1 text-sm text-gray-700 leading-relaxed">{nota}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removerNota(index)}
                                                className="text-gray-400 hover:text-red-akaer transition-colors shrink-0 mt-0.5"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-md border border-dashed border-font-border bg-[#FAF9F7] px-3 py-2 text-sm text-gray-400">
                                        Nenhuma nota cadastrada
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={notaInput}
                                    onChange={(e) => setNotaInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            adicionarNota();
                                        }
                                    }}
                                    placeholder="Escrever uma nota..."
                                    className={inputClass}
                                />
                                <button
                                    type="button"
                                    onClick={adicionarNota}
                                    className="bg-gray-800 text-white px-4 rounded-md text-sm cursor-pointer"
                                >
                                    Adicionar
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>

        <PdfViewerModal
            open={pdfModalOpen}
            onOpenChange={setPdfModalOpen}
            norma={{
                codigo: form.codigo,
                titulo: form.titulo,
                status: form.status,
                revisao: form.revisao || undefined,
                escopo: form.escopo || undefined,
                orgaoEmissor: listaOrgao.find(o => o.id?.toString() === form.orgaoEmissorId)?.nome || undefined,
                categoria: listaCategoria.find(c => c.id?.toString() === form.categoriaId)?.nome || undefined,
                palavrasChave: palavrasChave.length > 0 ? palavrasChave : undefined,
                normaRelacionada: correlacoes.length > 0
                    ? correlacoes.map((c: any) => ({ codigo: c.codigo, titulo: c.titulo ?? null }))
                    : undefined,
            }}
        />
        </>
    );
});

BodyEditar.displayName = "BodyEditar";

export default BodyEditar;