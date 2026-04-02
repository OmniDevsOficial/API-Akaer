import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Check } from 'lucide-react';
import { useState } from 'react';

interface StandardModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // onSuccess: (data: { nome: string; senha: string }) => void;
}

function AddStandardModal({ open, onOpenChange }: StandardModalProps) {
    const [titulo, setTitulo] = useState('');
    const [orgaoEmissor, setOrgaoEmissor] = useState('');
    const [status, setStatus] = useState('');
    const [etapaProjeto, setEtapaProjeto] = useState('');
    const [codigo, setCodigo] = useState('');
    const [categoria, setCategoria] = useState('');
    const [dataPublicacao, setDataPublicacao] = useState('');
    const [revisao, setRevisao] = useState('');

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

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className='!p-0 flex flex-col text-center gap-4 sm:!max-w-3xl'>
                    <div className='mx-7 mt-5'>
                        <p className='text-start'><span className='text-red-akaer'>CADASTRO</span><br /><span className='text-lg'>Nova norma aeronáutica</span></p>
                    </div>
                    <hr className='!mt-0' />

                    <div className='bg-gray-100/80 mx-8 my-3 h-50 rounded-lg border border-gray-500 border-dashed'></div>

                    <div className='grid grid-cols-[1fr_auto_1fr] items-center gap-3 mx-8 my-auto'>
                        <hr className='w-full border-gray-400' />
                        <span className='text-center text-[0.95rem] text-gray-400'>METADADOS</span>
                        <hr className='w-full border-gray-400'/>
                    </div>

                    <div className='grid grid-cols-2 mx-8 gap-4'>
                        <div className='grid gap-5'>
                            <div className='flex flex-col text-start gap-1'>
                                <label className='text-lg text-gray-600 mb-0 leading-none'>TÍTULO <span className='text-red-akaer'>*</span></label>
                                <input
                                    className="bg-gray-100/80 border rounded h-10 px-2"
                                    placeholder="Certificação de Gestão"
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                />
                            </div>
                            
                            <div className='flex flex-col text-start gap-1'>
                                <label className='text-lg text-gray-600 mb-0 leading-none'>ÓRGÃO EMISSOR <span className='text-red-akaer'>*</span></label>
                                <select
                                    className={`bg-gray-100/80 border rounded h-10 px-2 ${orgaoEmissor == '' ? 'text-black/60' : ''}`}
                                    value={orgaoEmissor}
                                    onChange={(e) => setOrgaoEmissor(e.target.value)}
                                >
                                    <option className="text-black/40" value="">Selecione...</option>
                                    <option className="text-black" value="anac">ANAC</option>
                                    <option className="text-black" value="easa">EASA</option>
                                    <option className="text-black" value="faa">FAA</option>
                                </select>
                            </div>

                            <div className='flex flex-col text-start gap-1'>
                                <label className='text-lg text-gray-600 mb-0 leading-none'>STATUS <span className='text-red-akaer'>*</span></label>
                                <select
                                    className="bg-gray-100/80 border rounded h-10 px-2"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option className="text-black" value="ativa">Ativa</option>
                                    <option className="text-black" value="obsoleta">Obsoleta</option>
                                </select>
                            </div>

                            <div className='flex flex-col text-start gap-1'>
                                <label className='text-lg text-gray-600 mb-0 leading-none'>ETAPA DO PROJETO</label>
                                <input
                                    className="bg-gray-100/80 border rounded h-10 px-2"
                                    placeholder="Montagem"
                                    value={etapaProjeto}
                                    onChange={(e) => setEtapaProjeto(e.target.value)}
                                />
                            </div>
                        </div>
                         <div className='grid gap-5'>
                            <div className='flex flex-col text-start gap-1'>
                                <label className='text-lg text-gray-600 mb-0 leading-none'>CÓDIGO <span className='text-red-akaer'>*</span></label>
                                <input
                                    className="bg-gray-100/80 border rounded h-10 px-2"
                                    placeholder="ex: ISO 9001"
                                    value={codigo}
                                    onChange={(e) => setCodigo(e.target.value)}
                                />
                            </div>
                            
                            <div className='flex flex-col text-start gap-1'>
                                <label className='text-lg text-gray-600 mb-0 leading-none'>CATEGORIA <span className='text-red-akaer'>*</span></label>
                                <select
                                    className={`bg-gray-100/80 border rounded h-10 px-2 ${categoria == '' ? 'text-black/60' : ''}`}
                                    value={categoria}
                                    onChange={(e) => setCategoria(e.target.value)}
                                >
                                    <option className="text-black/40" value="">Selecione...</option>
                                    <option className="text-black" value="qualidade">Qualidade</option>
                                    <option className="text-black" value="seguranca">Segurança</option>
                                    <option className="text-black" value="manutencao">Manutenção</option>
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
                                />
                            </div>
                            
                            <div className='flex flex-col text-start gap-1'>
                                <label className='text-lg text-gray-600 mb-0 leading-none'>REVISÃO</label>
                                <input
                                    className="bg-gray-100/80 border rounded h-10 px-2"
                                    placeholder="Ex: A,B"
                                    value={revisao}
                                    onChange={(e) => setRevisao(formatarRevisao(e.target.value))}
                                    inputMode='text'
                                    maxLength={1}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <hr />

                    <div className='grid grid-cols-2 mx-8 items-center mb-4'>
                        <div className='text-start'>Campos com <span className='text-red-akaer'>*</span> são Obrigatórios</div>
                        <div className='flex justify-end'>
                            <Button size={'lg'} className='ml-auto border border-gray-600/40 hover:bg-gray-200' variant={'secondary'} onClick={() => onOpenChange(false)}>Cancelar</Button>
                            <Button size={'lg'} className='ml-2 hover:bg-black/80'><Check/>Cadastrar Norma</Button>
                        </div>
                    </div>

                </DialogContent>
            </Dialog>
        </>
    )
}

export default AddStandardModal;