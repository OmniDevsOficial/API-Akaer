import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FileUpload } from './ui/file-upload';
import { NotasField } from './notes-field';
import { NormasRelatedSelector } from '@/components/normas-related-selector';
import api from '@/services/api';

interface StandardModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    solicitacaoId?: number; // serve para o auto-preenchimento do modal quando houver solicitação
    onConcluir?: (id: number) => void; // aqui vai atualizar o status da solicitação na tabela
}

interface NotaCadastro {
    id: number;
    texto: string;
}

interface NormaRelacionadaSelecao {
    codigo: string;
    titulo: string;
}

function AddStandardModal({ open, onOpenChange, onSuccess, solicitacaoId, onConcluir }: StandardModalProps) {
    const [titulo, setTitulo] = useState('');
    const [orgaoEmissor, setOrgaoEmissor] = useState('');
    const [status, setStatus] = useState('Ativa');
    const [etapaProjeto, setEtapaProjeto] = useState('');
    const [codigo, setCodigo] = useState('');
    const [categoria, setCategoria] = useState('');
    const [dataPublicacao, setDataPublicacao] = useState('');
    const [revisao, setRevisao] = useState('');
    const [escopo, setEscopo] = useState('');
    const [palavraChave, setPalavraChave] = useState('');
    const [palavrasChave, setPalavrasChave] = useState<string[]>([]);
    const [notas, setNotas] = useState<NotaCadastro[]>([]);
    const [arquivoNorma, setArquivoNorma] = useState<File | null>(null);
    const [arquivoNormaUrl, setArquivoNormaUrl] = useState<string | null>(null);
    const [arquivoNormaPath, setArquivoNormaPath] = useState<string | null>(null);
    const [cadastroConcluido, setCadastroConcluido] = useState(false);

    // Opções dinâmicas
    const [listaOrgao, setListaOrgao] = useState<any[]>([]);
    const [listaCategoria, setListaCategoria] = useState<any[]>([]);
    const [listaEtapaProjeto, setListaEtapaProjeto] = useState<any[]>([]);

    const [normasRelacionadas, setNormasRelacionadas] = useState<NormaRelacionadaSelecao[]>([]);

    const resolveArquivoUrl = (arquivo: string) => {
        const trimmed = arquivo.trim();
        if (!trimmed) return "";
        if (/^https?:\/\//.test(trimmed)) return trimmed;

        const normalized = trimmed.replace(/\\/g, "/");
        const marker = "/uploads/";
        const idx = normalized.lastIndexOf(marker);
        const relative = idx >= 0 ? normalized.slice(idx) : normalized;
        const path = relative.startsWith("/") ? relative : `/${relative}`;
        const baseUrl = api.defaults.baseURL ?? "";

        if (!baseUrl) return path;
        return `${baseUrl.replace(/\/$/, "")}${path}`;
    };

    const parseArray = <T,>(value: unknown): T[] => {
        if (Array.isArray(value)) return value as T[];
        if (typeof value === "string") {
            try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed) ? (parsed as T[]) : [];
            } catch {
                return [];
            }
        }
        return [];
    };

    const parseStringArray = (value: unknown): string[] => {
        if (Array.isArray(value)) return value.filter(Boolean).map(String);
        if (typeof value === "string") {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
            } catch {
                return value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean);
            }
        }
        return [];
    };

    useEffect(() => {
        const getFilterOptions = async () => {
            await api.get('/orgaos-emissores').then(res => setListaOrgao(res.data));
            await api.get('/categorias').then(res => setListaCategoria(res.data));
            await api.get('/etapas-projeto').then(res => setListaEtapaProjeto(res.data));
            // await api.get('/normas').then(res => setListaNormas(res.data));
        }

        getFilterOptions();
    }, [open]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        // 1. A NOVA BLINDAGEM DA DATA: Impede o envio se não tiver 10 caracteres
        if (dataPublicacao.length !== 10) {
            alert("A data de publicação deve estar no formato completo: DD/MM/AAAA");
            return;
        }

        const notasFormatadas = notas
            .map((nota, index) => ({
                texto: nota.texto.trim(),
                ordem: index,
            }))
            .filter((nota) => nota.texto !== "");

        const payload = {
            codigo,
            titulo,
            orgao_emissor_id: orgaoEmissor,
            categoria_id: categoria,
            etapa_projeto_id: etapaProjeto,
            revisao,
            status,
            data_publicacao: dataPublicacao,
            escopo,
            // 2. CONSERTO DAS PALAVRAS-CHAVE: Envia como JSON válido
            palavras_chave: palavrasChave.length > 0 ? JSON.stringify(palavrasChave) : undefined,
            notas: notasFormatadas.length > 0 ? JSON.stringify(notasFormatadas) : undefined,
            normas_relacionadas_ids: normasRelacionadas.length > 0
                ? JSON.stringify(normasRelacionadas.map((norma) => norma.codigo))
                : undefined,
        };

        const formData = new FormData();
        if (arquivoNorma) {
            formData.append('file', arquivoNorma);
        } else if (arquivoNormaPath) {
            formData.append('arquivo_existente', arquivoNormaPath);
        } else {
            alert("O arquivo PDF da norma e obrigatorio.");
            return;
        }

        Object.entries(payload).forEach(([key, value]) => {
            // 3. CONSERTO DO ERRO 500 SILENCIOSO: Impede envio de IDs vazios
            if (value !== undefined && value !== null && value !== '') {
                formData.append(key, String(value));
            }
        });

        try {
            const response = await api.post('/normas/create', formData);
            console.log('Norma Cadastrada com Sucesso:', response.data);

            // SE a norma veio de uma solicitação, atualiza a solicitação
            if (solicitacaoId) {
                await api.patch(`/solicitacoes/${solicitacaoId}/status`, { status: 'Concluida' });
                onConcluir?.(solicitacaoId);
            }

            setCadastroConcluido(true);
            onSuccess();

            return response.data;

        } catch (error: any) {
            const mensagemErro = 'Erro ao cadastrar norma: ' + (error.response?.data?.error || error.message);
            alert(mensagemErro);
            console.error('Erro ao cadastrar Norma:', error);
            throw error;
        }
    };


    const limparFormulario = () => {
        setTitulo('');
        setOrgaoEmissor('');
        setStatus('Ativa');
        setEtapaProjeto('');
        setCodigo('');
        setCategoria('');
        setDataPublicacao('');
        setRevisao('');
        setEscopo('');
        setPalavraChave('');
        setPalavrasChave([]);
        setNotas([]);
        setNormasRelacionadas([]);
        setArquivoNorma(null);
        setArquivoNormaUrl(null);
        setArquivoNormaPath(null);
        setCadastroConcluido(false);
        setNormasRelacionadas([]);
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            limparFormulario();
        }

        onOpenChange(nextOpen);
    };

    const formatarDataBrasileira = (valor: string) => {
        const somenteNumeros = valor.replace(/\D/g, '').slice(0, 8);

        if (somenteNumeros.length <= 2) return somenteNumeros;
        if (somenteNumeros.length <= 4) {
            return `${somenteNumeros.slice(0, 2)}/${somenteNumeros.slice(2)}`;
        }

        return `${somenteNumeros.slice(0, 2)}/${somenteNumeros.slice(2, 4)}/${somenteNumeros.slice(4)}`;
    };

    const formatarRevisao = (valor: string) => {
        return valor.replace(/[^a-zA-ZÀ-ÿ]/g, '').toLocaleUpperCase('pt-BR');
    };

    const adicionarPalavraChave = () => {
        if (!palavraChave.trim()) return;

        if (palavrasChave.includes(palavraChave.trim())) {
            alert('Palavra-chave já inserida');
            return;
        }

        setPalavrasChave(prev => [...prev, palavraChave.trim()]);
        setPalavraChave('');
    };

    const removerPalavra = (index: number) => {
        setPalavrasChave(prev => prev.filter((_, i) => i !== index));
    }

    useEffect(() => {
        if (!open || !solicitacaoId) return;

        let ativo = true;

        api.get(`/solicitacoes/${solicitacaoId}`).then(async (res) => {
            if (!ativo) return;

            const dn = res.data.dados_propostos?.dados_norma ?? {};
            if (dn.titulo) setTitulo(dn.titulo);
            if (dn.codigo) setCodigo(dn.codigo);
            if (dn.revisao) setRevisao(dn.revisao);
            if (dn.escopo) setEscopo(dn.escopo);
            if (dn.status) setStatus(dn.status);
            if (dn.data_publicacao) setDataPublicacao(dn.data_publicacao);
            if (dn.orgao_emissor_id) setOrgaoEmissor(String(dn.orgao_emissor_id));
            if (dn.categoria_id) setCategoria(String(dn.categoria_id));
            if (dn.etapa_projeto_id) setEtapaProjeto(String(dn.etapa_projeto_id));

            const palavras = parseStringArray(dn.palavras_chave);
            if (palavras.length > 0) setPalavrasChave(palavras);

            const notasParsed = parseArray<{ texto?: string }>(dn.notas);
            if (notasParsed.length > 0) {
                setNotas(
                    notasParsed.map((nota, index) => ({
                        id: Date.now() + index,
                        texto: nota.texto ?? "",
                    }))
                );
            }

            const relacionadas = parseArray<{ relacionada_codigo?: string }>(dn.normas_relacionadas);
            const relacionadasIds = parseStringArray(dn.normas_relacionadas_ids);

            const codigosRelacionados = [
                ...relacionadas
                    .map((rel) => rel.relacionada_codigo)
                    .filter((codigo): codigo is string => Boolean(codigo)),
                ...relacionadasIds,
            ];

            if (codigosRelacionados.length > 0) {
                setNormasRelacionadas(
                    codigosRelacionados.map((codigo) => ({ codigo, titulo: codigo }))
                );
            }

            if (dn.arquivo && typeof dn.arquivo === "string") {
                const url = resolveArquivoUrl(dn.arquivo);
                if (!url) return;
                setArquivoNormaUrl(url);
                setArquivoNormaPath(dn.arquivo);
            }
        });

        return () => {
            ativo = false;
        };
    }, [open, solicitacaoId]);


    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className='!p-0 flex flex-col text-center gap-4 w-[95vw] sm:w-auto sm:!max-w-[90vh] max-h-[95vh]'>
                    <div className='mx-5 md:mx-7 mt-5'>
                        <p className='text-start'>
                            <span className='text-red-akaer text-xs tracking-widest'>CADASTRO</span>
                            <br />
                            <span className='text-base md:text-lg'>Nova norma aeronáutica</span>
                        </p>
                    </div>
                    <hr className='!mt-0' />

                    {cadastroConcluido ? (
                        <>
                            <div className='flex flex-col items-center justify-center py-16 md:py-24 gap-4 px-4'>
                                <div className='w-12 h-12 rounded-full border border-green-700/40 flex items-center justify-center'>
                                    <Check className='text-green-700 w-7 h-7' />
                                </div>
                                <h3 className='text-sm md:text-base text-[#3f3f3f] font-semibold text-center'>Norma cadastrada com sucesso!</h3>
                                <p className='text-xs md:text-sm text-gray-500 text-center'>O arquivo e os metadados foram salvos no sistema.</p>
                            </div>
                            <hr />
                            <div className='flex justify-end mx-5 md:mx-8 items-center mb-4'>
                                <Button size={'lg'} className='hover:bg-black/80' onClick={() => handleOpenChange(false)}>
                                    Fechar
                                </Button>
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                            <div className="overflow-y-auto flex-1 pr-1">
                                <div className='mx-4 md:mx-5'>
                                    <FileUpload
                                        value={arquivoNorma}
                                        fileUrl={arquivoNormaUrl ?? undefined}
                                        existingFile={arquivoNormaUrl ? {
                                            name: arquivoNormaUrl.split("/").pop() || "documento.pdf",
                                            url: arquivoNormaUrl,
                                        } : undefined}
                                        onClearExisting={() => {
                                            setArquivoNorma(null);
                                            setArquivoNormaUrl(null);
                                            setArquivoNormaPath(null);
                                        }}
                                        onFileSelected={(file) => {
                                            setArquivoNorma(file);
                                            if (file) {
                                                setArquivoNormaUrl(null);
                                                setArquivoNormaPath(null);
                                            }
                                        }}
                                    />
                                </div>

                                <div className='grid grid-cols-[1fr_auto_1fr] items-center gap-3 mx-5 md:mx-8 mb-6'>
                                    <hr className='w-full border-gray-400' />
                                    <span className='text-center text-xs text-gray-400'>METADADOS</span>
                                    <hr className='w-full border-gray-400' />
                                </div>

                                {/* Grid de campos — 1 coluna no mobile, 2 no desktop */}
                                <div className='grid grid-cols-1 md:grid-cols-2 mx-4 md:mx-8 gap-4'>

                                    {/* Coluna 1 */}
                                    <div className='grid gap-4'>
                                        <div className='flex flex-col text-start gap-1'>
                                            <label className='text-sm text-gray-600 leading-none'>TÍTULO <span className='text-red-akaer'>*</span></label>
                                            <input
                                                className="bg-gray-100/80 border rounded h-10 px-2 text-sm"
                                                placeholder="Ex: Certificação de Gestão"
                                                value={titulo}
                                                onChange={(e) => setTitulo(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className='flex flex-col text-start gap-1'>
                                            <label className='text-sm text-gray-600 leading-none'>ÓRGÃO EMISSOR <span className='text-red-akaer'>*</span></label>
                                            <select
                                                className={`bg-gray-100/80 border rounded h-10 px-2 text-sm ${orgaoEmissor == '' ? 'text-black/60' : ''}`}
                                                value={orgaoEmissor}
                                                onChange={(e) => setOrgaoEmissor(e.target.value)}
                                                required
                                            >
                                                <option value="">Selecione...</option>
                                                {listaOrgao.map(orgao => (
                                                    <option key={orgao.id} value={orgao.id}>{orgao.nome}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className='flex flex-col text-start gap-1'>
                                            <label className='text-sm text-gray-600 leading-none'>STATUS <span className='text-red-akaer'>*</span></label>
                                            <select
                                                className="bg-gray-100/80 border rounded h-10 px-2 text-sm"
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                                required
                                            >
                                                <option value="Ativa">Ativa</option>
                                                <option value="Obsoleta">Obsoleta</option>
                                            </select>
                                        </div>

                                        <div className='flex flex-col text-start gap-1'>
                                            <label className='text-sm text-gray-600 leading-none'>ETAPA DO PROJETO</label>
                                            <select
                                                className={`bg-gray-100/80 border rounded h-10 px-2 text-sm ${etapaProjeto == '' ? 'text-black/60' : ''}`}
                                                value={etapaProjeto}
                                                onChange={(e) => setEtapaProjeto(e.target.value)}
                                            >
                                                <option value="">Selecione...</option>
                                                {listaEtapaProjeto.map(etapa => (
                                                    <option key={etapa.id} value={etapa.id}>{etapa.nome}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Coluna 2 */}
                                    <div className='grid gap-4'>
                                        <div className='flex flex-col text-start gap-1'>
                                            <label className='text-sm text-gray-600 leading-none'>CÓDIGO <span className='text-red-akaer'>*</span></label>
                                            <input
                                                className="bg-gray-100/80 border rounded h-10 px-2 text-sm"
                                                placeholder="Ex: ISO 9001"
                                                value={codigo}
                                                onChange={(e) => setCodigo(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className='flex flex-col text-start gap-1'>
                                            <label className='text-sm text-gray-600 leading-none'>CATEGORIA <span className='text-red-akaer'>*</span></label>
                                            <select
                                                className={`bg-gray-100/80 border rounded h-10 px-2 text-sm ${categoria == '' ? 'text-black/60' : ''}`}
                                                value={categoria}
                                                onChange={(e) => setCategoria(e.target.value)}
                                                required
                                            >
                                                <option value="">Selecione...</option>
                                                {listaCategoria.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className='flex flex-col text-start gap-1'>
                                            <label className='text-sm text-gray-600 leading-none'>DATA DE PUBLICAÇÃO <span className='text-red-akaer'>*</span></label>
                                            <input
                                                className="bg-gray-100/80 border rounded h-10 px-2 text-sm"
                                                placeholder="Ex: dd/mm/aaaa"
                                                value={dataPublicacao}
                                                onChange={(e) => setDataPublicacao(formatarDataBrasileira(e.target.value))}
                                                inputMode="numeric"
                                                maxLength={10}
                                                required
                                            />
                                        </div>

                                        <div className='flex flex-col text-start gap-1'>
                                            <label className='text-sm text-gray-600 leading-none'>REVISÃO <span className='text-red-akaer'>*</span></label>
                                            <input
                                                className="bg-gray-100/80 border rounded h-10 px-2 text-sm"
                                                placeholder="Ex: A, B"
                                                value={revisao}
                                                onChange={(e) => setRevisao(formatarRevisao(e.target.value))}
                                                inputMode='text'
                                                maxLength={1}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className='mx-4 md:mx-8 mt-6'>
                                    <div className='flex flex-col text-start gap-1 mb-5'>
                                        <label className='text-sm text-gray-600'>ESCOPO <span className='text-red-akaer'>*</span></label>
                                        <textarea
                                            className="bg-gray-100/80 border rounded p-3 min-h-24 text-sm"
                                            value={escopo}
                                            onChange={(e) => setEscopo(e.target.value)}
                                            placeholder="Resumo da norma"
                                            required
                                        />
                                    </div>

                                    <div className='flex flex-col text-start'>
                                        <label className='text-sm text-gray-600'>PALAVRAS-CHAVE</label>
                                        <div className="flex flex-wrap gap-2 border rounded p-3 bg-gray-100/60">
                                            {palavrasChave.map((item, index) => (
                                                <div key={index} className="px-2 py-1 rounded bg-red-50 text-sm flex items-center gap-2">
                                                    {item}
                                                    <button type="button" onClick={() => removerPalavra(index)}>x</button>
                                                </div>
                                            ))}
                                            <input
                                                className="bg-transparent outline-none flex-1 text-sm min-w-[120px]"
                                                value={palavraChave}
                                                onChange={(e) => setPalavraChave(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") { e.preventDefault(); adicionarPalavraChave(); }
                                                }}
                                                placeholder="Adicionar palavra-chave"
                                            />
                                        </div>
                                    </div>

                                    <div className='my-6'>
                                        <NotasField
                                            label="NOTAS"
                                            value={notas}
                                            onChange={setNotas}
                                            autoFocus={!solicitacaoId}
                                        />
                                    </div>

                                    <div className='flex flex-col text-start my-6'>
                                        <label className='text-sm text-gray-600'>NORMAS CORRELACIONADAS</label>
                                        <NormasRelatedSelector
                                            selecionadas={normasRelacionadas}
                                            onChange={setNormasRelacionadas}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className='flex flex-col md:grid md:grid-cols-2 mx-4 md:mx-8 items-center py-4 gap-3 border-t'>
                                <div className='text-start text-xs text-gray-500 hidden md:block'>
                                    Campos com <span className='text-red-akaer'>*</span> são Obrigatórios
                                </div>
                                <div className='flex justify-end gap-2 w-full'>
                                    <Button type='button' size={'lg'} className='flex-1 md:flex-none border border-gray-600/40 hover:bg-gray-200' variant={'secondary'} onClick={() => handleOpenChange(false)}>
                                        Cancelar
                                    </Button>
                                    <Button size={'lg'} className='flex-1 md:flex-none hover:bg-black/80' type="submit">
                                        <Check className='mr-1' />Cadastrar
                                    </Button>
                                </div>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}

export default AddStandardModal;