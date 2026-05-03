import {
    useEffect,
    useState,
    useRef,
    useImperativeHandle,
    forwardRef,
} from "react";
import { useLocation } from "react-router-dom";
import { Globe, FileText, X, Loader2 } from "lucide-react";
import api from "@/services/api";
import { atualizarNorma, getNormaDetalhes } from "@/services/normaService";

export interface BodyEditarHandle {
    salvar: () => Promise<void>;
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
    });

    const [palavrasChave, setPalavrasChave] = useState<string[]>([]);
    const [palavraInput, setPalavraInput] = useState("");

    const [notas, setNotas] = useState<string[]>([]);
    const [notaInput, setNotaInput] = useState("");

    const [correlacoes, setCorrelacoes] = useState<any[]>([]);
    const [buscaCorrelacao, setBuscaCorrelacao] = useState("");

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

                setForm({
                    titulo: detalhes.titulo || "",
                    codigo: detalhes.codigo || "",
                    // Ajuste no mapeamento do ID do órgão emissor
                    orgaoEmissorId: detalhes.orgao_emissor?.id?.toString() || 
                                    (detalhes as any).orgao_emissor_id?.toString() || "",
                    status: detalhes.status || "Ativa",
                    categoriaId: detalhes.categoria?.id?.toString() || "",
                    etapaProjetoId: detalhes.etapa_projeto?.id?.toString() || "",
                    revisao: detalhes.revisao || "",
                    escopo: detalhes.escopo || "",
                    dataPublicacao: detalhes.data_publicacao || "",
                });

                setPalavrasChave(detalhes.palavras_chave || []);
                setNotas((detalhes.notas || []).map((nota: any) => nota.texto));
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
            };

            await atualizarNorma(form.codigo, payload);
        },
    }));

    const handleChange = (campo: string, valor: string) => {
        setForm(prev => ({ ...prev, [campo]: valor }));
    };

    const adicionarPalavra = () => {
        if (!palavraInput.trim()) return;
        setPalavrasChave(prev => [...prev, palavraInput.trim()]);
        setPalavraInput("");
    };

    const removerPalavra = (index: number) => {
        setPalavrasChave(prev => prev.filter((_, i) => i !== index));
    };

    const adicionarNota = () => {
        if (!notaInput.trim()) return;
        setNotas(prev => [...prev, notaInput.trim()]);
        setNotaInput("");
    };

    const removerNota = (index: number) => {
        setNotas(prev => prev.filter((_, i) => i !== index));
    };

    const removerCorrelacao = (index: number) => {
        setCorrelacoes(prev => prev.filter((_, i) => i !== index));
    };

    const dataFormatada = form.dataPublicacao
        ? new Date(form.dataPublicacao).toLocaleDateString("pt-BR")
        : "—";

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
        <div className="flex flex-col gap-6 p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
            {/* INFORMAÇÕES BÁSICAS */}
            <div className={sectionClass}>
                <div className={sectionHeaderClass}>
                    <Globe size={14} /> INFORMAÇÕES BÁSICAS
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
                            {listaOrgao.map((o) => (
                                <option key={o.id} value={o.id}>
                                    {/* Ajuste visual para evitar opções em branco */}
                                    {o.nome?.trim() || o.sigla || `Órgão ${o.id}`}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>DATA DE PUBLICAÇÃO</label>
                        <p className='text-sm text-gray-700'>{dataFormatada}</p>
                    </div>
                    <div>
                        <label className={labelClass}>REVISÃO</label>
                        <input
                            type="text"
                            value={form.revisao}
                            onChange={(e) => handleChange("revisao", e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>
            </div>

            {/* DETALHES E CATEGORIZAÇÃO */}
            <div className={sectionClass}>
                <div className={sectionHeaderClass}>
                    <FileText size={14} /> DETALHES E CATEGORIZAÇÃO
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
                            {listaCategoria.map((c) => (
                                <option key={c.id} value={c.id}>{c.nome}</option>
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
                            {listaEtapaProjeto.map((e) => (
                                <option key={e.id} value={e.id}>{e.nome}</option>
                            ))}
                        </select>
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
            </div>

            {/* PALAVRAS-CHAVE */}
            <div className={sectionClass}>
                <div className={sectionHeaderClass}>TAGS / PALAVRAS-CHAVE</div>
                <div className="flex gap-2 mb-3">
                    <input
                        type="text"
                        value={palavraInput}
                        onChange={(e) => setPalavraInput(e.target.value)}
                        placeholder="Adicionar nova palavra..."
                        className={inputClass}
                    />
                    <button
                        type="button"
                        onClick={adicionarPalavra}
                        className="bg-gray-800 text-white px-4 rounded-md text-sm"
                    >
                        Adicionar
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {palavrasChave.map((p, i) => (
                        <span key={i} className="flex items-center gap-1 bg-gray-100 border border-font-border px-2 py-1 rounded text-xs text-gray-700">
                            {p}
                            <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => removerPalavra(i)} />
                        </span>
                    ))}
                </div>
            </div>

            {/* NOTAS */}
            <div className={sectionClass}>
                <div className={sectionHeaderClass}>NOTAS</div>
                <div className='flex flex-col gap-2 mb-2'>
                    {notas.map((nota, i) => (
                        <div
                            key={i}
                            className='flex items-start justify-between gap-2 bg-[#FAF9F7] border border-font-border rounded-sm p-2'
                        >
                            <p className='text-sm text-gray-regular flex-1'>{nota}</p>
                            <button
                                type="button"
                                onClick={() => removerNota(i)}
                                className='text-gray-400 hover:text-red-akaer transition-colors shrink-0 mt-0.5'
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={notaInput}
                        onChange={(e) => setNotaInput(e.target.value)}
                        placeholder="Escrever uma nota..."
                        className={inputClass}
                    />
                    <button
                        type="button"
                        onClick={adicionarNota}
                        className="bg-gray-800 text-white px-4 rounded-md text-sm"
                    >
                        Adicionar
                    </button>
                </div>
            </div>
        </div>
    );
});

BodyEditar.displayName = "BodyEditar";

export default BodyEditar;