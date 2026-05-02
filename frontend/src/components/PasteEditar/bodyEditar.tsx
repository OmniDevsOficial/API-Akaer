import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRef } from 'react';
import { Globe, FileText, X } from 'lucide-react';
import api from '@/services/api';

export default function BodyEditar() {
    const norma = useLocation().state?.norma;
    const ArquivoPdf = useRef<HTMLInputElement>(null);

    const [listaOrgao, setListaOrgao] = useState<any[]>([]);
    const [listaCategoria, setListaCategoria] = useState<any[]>([]);
    const [listaEtapaProjeto, setListaEtapaProjeto] = useState<any[]>([]);
    const [arquivoNorma, setArquivoNorma] = useState<File | null>(null);

    const [form, setForm] = useState({
        titulo: norma?.titulo || '',
        codigo: norma?.codigo || '',
        orgaoEmissorId: norma?.orgao_emissor?.id?.toString() || '',
        status: norma?.status || '',
        categoriaId: norma?.categoria?.id?.toString() || '',
        etapaProjetoId: norma?.etapa_projeto?.id?.toString() || '',
        revisao: norma?.revisao || '',
        escopo: norma?.escopo || '',
    });

    const [palavrasChave, setPalavrasChave] = useState<string[]>(norma?.palavras_chave || []);
    const [palavraInput, setPalavraInput] = useState('');

    const [notas, setNotas] = useState<string[]>(norma?.notas || []);
    const [notaInput, setNotaInput] = useState('');

    const [correlacoes, setCorrelacoes] = useState<any[]>(norma?.correlacoes || []);
    const [buscaCorrelacao, setBuscaCorrelacao] = useState('');

    useEffect(() => {
        const buscarOpcoes = async () => {
            const [orgaos, categorias, etapas] = await Promise.all([ // substitui os awaits por conta de ser campos dropdown 
                api.get('/orgaos-emissores'),
                api.get('/categorias'),
                api.get('/etapas-projeto'),
            ]);
            setListaOrgao(orgaos.data);
            setListaCategoria(categorias.data);
            setListaEtapaProjeto(etapas.data);
        };
        buscarOpcoes();
    }, []);

    const handleChange = (campo: string, valor: string) => {
        setForm(prev => ({ ...prev, [campo]: valor }));
    };

    const adicionarPalavra = () => {
        if (!palavraInput.trim()) return;
        setPalavrasChave(prev => [...prev, palavraInput.trim()]);
        setPalavraInput('');
    };

    const removerPalavra = (index: number) => {
        setPalavrasChave(prev => prev.filter((_, i) => i !== index));
    };

    const adicionarNota = () => {
        if (!notaInput.trim()) return;
        setNotas(prev => [...prev, notaInput.trim()]);
        setNotaInput('');
    };

    const removerCorrelacao = (index: number) => {
        setCorrelacoes(prev => prev.filter((_, i) => i !== index));
    };

    const inputClass = 'w-full border border-font-border rounded-md px-3 py-2 text-sm focus:outline-none bg-[#FAF9F7]';
    const labelClass = 'text-xs text-gray-400 tracking-widest block mb-1';
    const sectionClass = 'border border-font-border rounded-md p-4';
    const sectionHeaderClass = 'flex items-center gap-2 border-b border-font-border pb-3 mb-4 text-xs font-semibold tracking-widest text-gray-regular';

    return (
        <div className="min-h-screen bg-white p-8 font-dm">
            <div className="grid grid-cols-[1fr_400px] gap-6">

                {/* COLUNA ESQUERDA */}
                <div className="flex flex-col gap-6">

                    {/* IDENTIFICAÇÃO */}
                    <section className={sectionClass}>
                        <header className={sectionHeaderClass}>
                            <FileText size={14} />
                            IDENTIFICAÇÃO
                        </header>

                        <div className='mb-4'>
                            <label className={labelClass}>TÍTULO</label>
                            <input type="text" value={form.titulo} onChange={(e) => handleChange('titulo', e.target.value)} placeholder="Ex: Certificação de sistemas" className={inputClass} />
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <label className={labelClass}>CÓDIGO</label>
                                <input type="text" value={form.codigo} onChange={(e) => handleChange('codigo', e.target.value)} placeholder="Ex: ISO 9001" className={inputClass} />
                            </div>

                            <div>
                                <label className={labelClass}>ÓRGÃO EMISSOR</label>
                                <select value={form.orgaoEmissorId} onChange={(e) => handleChange('orgaoEmissorId', e.target.value)} className={inputClass}>
                                    <option value="">Selecionar...</option>
                                    {listaOrgao.map(o => <option key={o.id} value={o.id}>{o.nome}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>STATUS</label>
                                <select value={form.status} onChange={(e) => handleChange('status', e.target.value)} className={inputClass}>
                                    <option value="Ativa">Ativa</option>
                                    <option value="Obsoleta">Obsoleta</option>
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>CATEGORIA</label>
                                <select value={form.categoriaId} onChange={(e) => handleChange('categoriaId', e.target.value)} className={inputClass}>
                                    <option value="">Selecionar...</option>
                                    {listaCategoria.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>ETAPA DO PROJETO</label>
                                <select value={form.etapaProjetoId} onChange={(e) => handleChange('etapaProjetoId', e.target.value)} className={inputClass}>
                                    <option value="">Selecionar...</option>
                                    {listaEtapaProjeto.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>REVISÃO</label>
                                <input type="text" value={form.revisao} onChange={(e) => handleChange('revisao', e.target.value)} placeholder="Ex: C" maxLength={1} className={inputClass} />
                            </div>
                        </div>
                    </section>

                    {/* ESCOPO */}
                    <section className={sectionClass}>
                        <header className={sectionHeaderClass}>
                            <FileText size={14} />
                            ESCOPO
                        </header>

                        <div className='mb-4'>
                            <label className={labelClass}>RESUMO DA NORMA</label>
                            <textarea
                                value={form.escopo}
                                onChange={(e) => handleChange('escopo', e.target.value)}
                                placeholder="Ex: Certificação de sistemas"
                                className={`${inputClass} min-h-28 resize-none`}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>PALAVRAS-CHAVE</label>
                            <div className="flex flex-wrap gap-2 border border-font-border rounded-md p-3 bg-white">
                                {palavrasChave.map((p, i) => (
                                    <span key={i} className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-akaer text-sm rounded-md">
                                        {p}
                                        <button onClick={() => removerPalavra(i)}><X size={12} /></button>
                                    </span>
                                ))}
                                <input
                                    value={palavraInput}
                                    onChange={(e) => setPalavraInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); adicionarPalavra(); } }}
                                    placeholder="Adicionar palavra-chave"
                                    className="outline-none text-sm flex-1 bg-transparent"
                                />
                            </div>
                            <span className='text-xs text-gray-400 mt-1 block'>Pressione Enter para adicionar</span>
                        </div>
                    </section>
                </div>

                {/* COLUNA DIREITA */}
                <div className="flex flex-col gap-6">

                    {/* ARQUIVO PDF */}
                    <section className={sectionClass}>
                        <header className={sectionHeaderClass}>
                            <FileText size={14} />
                            ARQUIVO PDF
                        </header>

                        <div className='flex items-center justify-between mb-4'>
                            <div className='flex items-center gap-3'>
                                <div className='p-2 bg-red-50 rounded-md'>
                                    <FileText size={20} className='text-red-akaer' />
                                </div>
                                <div>
                                    <p className='text-sm font-medium'>
                                        {arquivoNorma ? arquivoNorma.name : norma?.titulo || 'Sem arquivo'}
                                    </p>
                                    <p className='text-xs text-gray-400'>PDF</p>
                                </div>
                            </div>

                            <input
                                ref={ArquivoPdf}
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={(e) => setArquivoNorma(e.target.files?.[0] || null)}
                            />

                            <button
                                onClick={() => { ArquivoPdf.current?.click() }}
                                className='text-xs border border-font-border rounded-md px-3 py-1.5 text-gray-500 hover:bg-gray-50 transition-colors'>
                                ↺ Substituir
                            </button>
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <label className={labelClass}>DATA DE PUBLICAÇÃO</label>
                                <p className='text-sm text-gray-700'>{norma?.data_publicacao ? new Date(norma.data_publicacao).toLocaleDateString('pt-BR') : '—'}</p>
                            </div>
                            <div className='grid justify-end'>
                                <label className={labelClass}>VISIBILIDADE</label>
                                <div className='flex items-center gap-1 text-sm text-gray-700'>
                                    <Globe size={14} />
                                    <span>Público</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CORRELAÇÕES */}
                    <section className={sectionClass}>
                        <header className={sectionHeaderClass}>
                            <FileText size={14} />
                            CORRELAÇÕES
                        </header>

                        <input
                            value={buscaCorrelacao}
                            onChange={(e) => setBuscaCorrelacao(e.target.value)}
                            placeholder="Buscar normas para correlacionar"
                            className={`${inputClass} mb-3`}
                        />

                        <div className='flex flex-col gap-2'>
                            {correlacoes.map((c, i) => (
                                <div key={i} className='flex items-center justify-between py-2 border-b border-font-border last:border-none'>
                                    <div className='flex items-center gap-3'>
                                        <span className='text-xs font-semibold text-red-akaer'>{c.codigo}</span>
                                        <span className='text-xs text-gray-regular uppercase'>{c.titulo}</span>
                                    </div>
                                    <button onClick={() => removerCorrelacao(i)} className='text-gray-400 hover:text-red-akaer transition-colors'>
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* NOTAS */}
                    <section className={sectionClass}>
                        <header className={sectionHeaderClass}>
                            <FileText size={14} />
                            NOTAS
                        </header>

                        <div className='flex flex-col gap-2 mb-2'>
                            {notas.map((nota, i) => (
                                <p key={i} className='text-sm text-gray-regular bg-[#FAF9F7] border border-font-border rounded-sm p-2'>
                                    {nota}
                                </p>
                            ))}
                        </div>

                        <input
                            value={notaInput}
                            onChange={(e) => setNotaInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); adicionarNota(); } }}
                            placeholder="Digite uma nota e pressione Enter para adicionar..."
                            className={inputClass}
                        />
                    </section>
                </div>
            </div>
        </div>
    );
}