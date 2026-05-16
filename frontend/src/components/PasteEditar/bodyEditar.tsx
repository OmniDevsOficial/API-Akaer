import {
    useEffect,
    useState,
    useRef,
    useImperativeHandle,
    forwardRef,
} from "react";
import { useLocation } from "react-router-dom";
import { Globe, FileText, X, Loader2 } from "lucide-react";
import { NormasRelatedSelector } from '@/components/normas-related-selector';
import { atualizarNorma, getNormaDetalhes } from "@/services/normaService";
import api from "@/services/api";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../ui/tooltip";

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
            console.log(dadosIniciais)
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
            alert('Palavra-chave já inserida');
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
    const sectionClass = "border border-font-border rounded-md p-4";
    const sectionHeaderClass = "flex items-center gap-2 border-b border-font-border pb-3 mb-4 text-xs font-semibold tracking-widest text-gray-regular";

    if (carregando) {
        return (
            <div className="flex items-center justify-center py-24 text-gray-400">
                <Loader2 className="animate-spin mr-2" size={20} />
                Carregando dados da norma...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white p-8 font-dm">
            <div className="grid grid-cols-[1fr_400px] gap-6">
                {/* INFORMAÇÕES BÁSICAS */}
                <div className="flex flex-col gap-6">

                    <div className={sectionClass}>
                        <div className={sectionHeaderClass}>
                            <Globe size={14} />
                            INFORMAÇÕES BÁSICAS
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className={labelClass}>TÍTULO</label>
                                <input
                                    type="text"
                                    value={form.titulo}
                                    onChange={(e) => handleChange("titulo", e.target.value)}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>CÓDIGO DA NORMA</label>
                                <input
                                    type="text"
                                    value={form.codigo}
                                    disabled
                                    className={`${inputClass} opacity-60 cursor-not-allowed`}
                                />
                            </div>

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
                                <label className={labelClass}>DATA DE PUBLICAÇÃO</label>
                                <p className={inputClass}>{dataFormatada}</p>
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

                            <div className="grid grid-cols-2 gap-4">
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

                    {/* DETALHES E CATEGORIZAÇÃO */}

                    <div className={sectionClass}>
                        <div className={sectionHeaderClass}>
                            <FileText size={14} />
                            DETALHES E CATEGORIZAÇÃO
                        </div>

                        <div className="col-span-2">
                            <label className={labelClass}>ESCOPO</label>
                            <textarea
                                value={form.escopo}
                                onChange={(e) => handleChange("escopo", e.target.value)}
                                className={`${inputClass} min-h-[100px] resize-y`}
                            />
                        </div>

                    </div>

                    <div className={sectionClass}>
                        <div className='mt-3'>
                            <div className={sectionHeaderClass}>
                                <FileText size={14} />
                                PALAVRAS-CHAVE
                            </div>

                            {/* PALAVRAS-CHAVE */}
                            <div className="mb-3">
                                {palavrasChave.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {palavrasChave.map((palavra, index) => (
                                            <span
                                                key={`${palavra}-${index}`}
                                                className="flex items-center gap-1 bg-[#FAF9F7] text-dark-title border border-font-border px-2 py-1 rounded text-sm"
                                            >
                                                {palavra}
                                                <X
                                                    size={12}
                                                    className="cursor-pointer hover:text-red-500"
                                                    onClick={() => removerPalavra(index)}
                                                />
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={"rounded-md border border-font-border bg-[#FAF9F7] px-3 py-2 text-sm text-gray-400"}>
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

                {/* COLUNA DA DIREITA */}
                <div className="flex flex-col gap-6">

                    {/* ARQUIVO PDF */}
                    <div className={sectionClass}>
                        <div className={sectionHeaderClass}>
                            <FileText size={14} />
                            ARQUIVO PDF
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-50 rounded-md">
                                    <FileText size={20} className="text-red-akaer" />
                                </div>

                                <TooltipProvider>
                                    {exibirTooltipArquivo ? (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="max-w-52">
                                                    <p className="text-sm font-medium truncate inline-block max-w-full">
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
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate inline-block max-w-full">
                                                {nomeArquivoLabel}
                                            </p>
                                            <p className="text-xs text-gray-400">PDF</p>
                                        </div>
                                    )}
                                </TooltipProvider>
                            </div>

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
                                className="text-xs border border-font-border rounded-md px-3 py-1.5 text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                                ↺ Substituir
                            </button>
                        </div>
                    </div>

                    {/* CORRELAÇÕES */}
                    <div className={sectionClass}>
                        <div className={sectionHeaderClass}>
                            <FileText size={14} />
                            CORRELAÇÕES
                        </div>

                        <NormasRelatedSelector
                            selecionadas={correlacoes}
                            onChange={setCorrelacoes}
                            codigoAtual={form.codigo}
                        />
                    </div>

                    {/* NOTAS */}
                    <div className={sectionClass}>
                        <div className={sectionHeaderClass}>
                            <FileText size={14} />
                            NOTAS
                        </div>

                        <div className="flex flex-col gap-2 mb-3">
                            {notas.length > 0 ? (
                                notas.map((nota, index) => (
                                    <div
                                        key={`${nota}-${index}`}
                                        className="flex items-start justify-between gap-2 bg-[#FAF9F7] border border-font-border rounded-sm p-2"
                                    >
                                        <p className="text-sm text-gray-regular flex-1">{nota}</p>

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
    );
});

BodyEditar.displayName = "BodyEditar";

export default BodyEditar;