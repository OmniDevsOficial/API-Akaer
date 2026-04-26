import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FileUpload } from './ui/file-upload';
import api from '@/services/api';

interface StandardModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

function AddStandardModal({ open, onOpenChange, onSuccess }: StandardModalProps) {
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
    const [arquivoNorma, setArquivoNorma] = useState<File | null>(null);
    const [cadastroConcluido, setCadastroConcluido] = useState(false);

    // Opções dinâmicas
    const [listaOrgao, setListaOrgao] = useState<any[]>([]);
    const [listaCategoria, setListaCategoria] = useState<any[]>([]);
    const [listaEtapaProjeto, setListaEtapaProjeto] = useState<any[]>([]);

    useEffect(() => {
        const getFilterOptions = async () => {
            await api.get('/orgaos-emissores').then(res => setListaOrgao(res.data));
            await api.get('/categorias').then(res => setListaCategoria(res.data));
            await api.get('/etapas-projeto').then(res => setListaEtapaProjeto(res.data));
        }

        getFilterOptions();
    }, [open]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();

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
           // palavras_chave: palavrasChave.join(','),
        };

        const formData = new FormData();
        formData.append('file', arquivoNorma!);

        Object.entries(payload).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, String(value));
            }
        });

        try {
            const response = await api.post('/normas/create', formData);
            console.log('Norma Cadastrada com Sucesso:', response.data);
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
        setArquivoNorma(null);
        setCadastroConcluido(false);
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

        setPalavrasChave(prev => [...prev, palavraChave.trim()]);
        setPalavraChave('');
    };

    const removerPalavra = (index: number) => {
        setPalavrasChave(prev => prev.filter((_, i) => i !== index));
    }


    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className='!p-0 flex flex-col text-center gap-4 sm:!max-w-[90vh]'>
                    <div className='mx-7 mt-5'>
                        <p className='text-start'><span className='text-red-akaer'>CADASTRO</span><br /><span className='text-lg'>Nova norma aeronáutica</span></p>
                    </div>
                    <hr className='!mt-0' />

                    {cadastroConcluido ? (
                        <>
                            <div className='flex flex-col items-center justify-center py-24 gap-4'>
                                <div className='w-12 h-12 rounded-full border border-green-700/40 flex items-center justify-center'>
                                    <Check className='text-green-700 w-7 h-7' />
                                </div>
                                <h3 className='text-4 text-[#3f3f3f] font-semibold'>Norma cadastrada com sucesso!</h3>
                                <p className='text-3 text-gray-500'>O arquivo e os metadados foram salvos no sistema.</p>
                            </div>

                            <hr />

                            <div className='flex justify-end mx-8 items-center mb-4'>
                                <Button size={'lg'} className='hover:bg-black/80' onClick={() => handleOpenChange(false)}>
                                    Fechar
                                </Button>
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col h-full">
                            <div className="overflow-y-auto max-h-[70vh] pr-2">
                                <div className='mx-5'>
                                    <FileUpload onFileSelected={setArquivoNorma} />
                                </div>

                                <div className='grid grid-cols-[1fr_auto_1fr] items-center gap-3 mx-8 mb-6'>
                                    <hr className='w-full border-gray-400' />
                                    <span className='text-center text-[0.95rem] text-gray-400'>METADADOS</span>
                                    <hr className='w-full border-gray-400' />
                                </div>

                                <div className='grid grid-cols-2 mx-8 gap-4'>
                                    <div className='grid gap-5'>
                                        <div className='flex flex-col text-start gap-1'>
                                            <label className='text-lg text-gray-600 mb-0 leading-none'>TÍTULO <span className='text-red-akaer'>*</span></label>
                                            <input
                                                className="bg-gray-100/80 border rounded h-10 px-2"
                                                placeholder="Ex: Certificação de Gestão"
                                                value={titulo}
                                                onChange={(e) => setTitulo(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className='flex flex-col text-start gap-1'>
                                            <label className='text-lg text-gray-600 mb-0 leading-none'>ÓRGÃO EMISSOR <span className='text-red-akaer'>*</span></label>
                                            <select
                                                className={`bg-gray-100/80 border rounded h-10 px-2 ${orgaoEmissor == '' ? 'text-black/60' : ''}`}
                                                value={orgaoEmissor}
                                                onChange={(e) => setOrgaoEmissor(e.target.value)}
                                                required
                                            >
                                                <option className="text-black/40" value="">Selecione...</option>
                                                {listaOrgao.map(orgao => (
                                                    <option key={orgao.id} value={orgao.id}>{orgao.nome}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className='flex flex-col text-start gap-1'>
                                            <label className='text-lg text-gray-600 mb-0 leading-none'>STATUS <span className='text-red-akaer'>*</span></label>
                                            <select
                                                className="bg-gray-100/80 border rounded h-10 px-2"
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                                required
                                            >
                                                <option className="text-black" value="Ativa">Ativa</option>
                                                <option className="text-black" value="Obsoleta">Obsoleta</option>
                                            </select>
                                        </div>

                                        <div className='flex flex-col text-start gap-1'>
                                            <label className='text-lg text-gray-600 mb-0 leading-none'>ETAPA DO PROJETO</label>
                                            <select
                                                className={`bg-gray-100/80 border rounded h-10 px-2 ${etapaProjeto == '' ? 'text-black/60' : ''}`}
                                                value={etapaProjeto}
                                                onChange={(e) => setEtapaProjeto(e.target.value)}
                                            >
                                                <option className="text-black/40" value="">Selecione...</option>
                                                {listaEtapaProjeto.map(etapa => (
                                                    <option key={etapa.id} value={etapa.id}>{etapa.nome}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className='grid gap-5'>
                                        <div className='flex flex-col text-start gap-1'>
                                            <label className='text-lg text-gray-600 mb-0 leading-none'>CÓDIGO <span className='text-red-akaer'>*</span></label>
                                            <input
                                                className="bg-gray-100/80 border rounded h-10 px-2"
                                                placeholder="Ex: ISO 9001"
                                                value={codigo}
                                                onChange={(e) => setCodigo(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className='flex flex-col text-start gap-1'>
                                            <label className='text-lg text-gray-600 mb-0 leading-none'>CATEGORIA <span className='text-red-akaer'>*</span></label>
                                            <select
                                                className={`bg-gray-100/80 border rounded h-10 px-2 ${categoria == '' ? 'text-black/60' : ''}`}
                                                value={categoria}
                                                onChange={(e) => setCategoria(e.target.value)}
                                                required
                                            >
                                                <option className="text-black/40" value="">Selecione...</option>
                                                {listaCategoria.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className='flex flex-col text-start gap-1'>
                                            <label className='text-lg text-gray-600 mb-0 leading-none'>DATA DE PUBLICAÇÃO <span className='text-red-akaer'>*</span></label>
                                            <input
                                                className="bg-gray-100/80 border rounded h-10 px-2"
                                                placeholder="Ex: dd/mm/aaaa"
                                                value={dataPublicacao}
                                                onChange={(e) => setDataPublicacao(formatarDataBrasileira(e.target.value))}
                                                inputMode="numeric"
                                                maxLength={10}
                                                required
                                            />
                                        </div>

                                        <div className='flex flex-col text-start gap-1'>
                                            <label className='text-lg text-gray-600 mb-0 leading-none'>REVISÃO <span className='text-red-akaer'>*</span></label>
                                            <input
                                                className="bg-gray-100/80 border rounded h-10 px-2"
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


                                <div className='mx-8 mt-6'>

                                
                                    <div className='flex flex-col text-start gap-1 mb-5'>
                                        <label className='text-lg text-gray-600'>
                                            ESCOPO <span className='text-red-akaer'>*</span>
                                        </label>

                                        <textarea
                                            className="bg-gray-100/80 border rounded p-3 min-h-24"
                                            value={escopo}
                                            onChange={(e) => setEscopo(e.target.value)}
                                            placeholder="Resumo da norma"
                                            required
                                        />
                                    </div>



                                    <div className='flex flex-col text-start gap-2'>
                                        <label className='text-lg text-gray-600'>
                                            PALAVRAS-CHAVE
                                        </label>

                                        <div className="flex flex-wrap gap-2 border rounded p-3 bg-gray-100/60">
                                            {palavrasChave.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="px-2 py-1 rounded bg-red-50 text-sm flex items-center gap-2"
                                                >
                                                    {item}
                                                    <button
                                                        type="button"
                                                        onClick={() => removerPalavra(index)}
                                                    >
                                                        x
                                                    </button>
                                                </div>
                                            ))}

                                            <input
                                                className="bg-transparent outline-none flex-1"
                                                value={palavraChave}
                                                onChange={(e) => setPalavraChave(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        adicionarPalavraChave();
                                                    }
                                                }}
                                                placeholder="Adicionar palavra-chave"
                                            />

                                        </div>
                                    </div>
                                  </div>
                                </div>




                                <div className='grid grid-cols-2 mx-8 items-center py-4 border-t'>
                                    <div className='text-start'>Campos com <span className='text-red-akaer'>*</span> são Obrigatórios</div>
                                    <div className='flex justify-end'>
                                        <Button type='button' size={'lg'} className='ml-auto border border-gray-600/40 hover:bg-gray-200' variant={'secondary'} onClick={() => handleOpenChange(false)}>Cancelar</Button>
                                        <Button size={'lg'} className='ml-2 hover:bg-black/80' type="submit"><Check />Cadastrar Norma</Button>
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