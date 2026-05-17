import { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

interface NormaOpcao {
    titulo: string;
    codigo: string;
}

interface NormaProps {
    id: number | string;
    titulo: string;
}

interface ModalSolicitacaoNotaProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    normas?: NormaProps[];
}

interface FormState {
    nomeSolicitante: string;
    normaId: string;
    conteudoSugerido: string;
}

interface FormErrors {
    nomeSolicitante?: string;
    normaId?: string;
    conteudoSugerido?: string;
}

interface SolicitacaoNotaPayload {
    tipo: 'Nova Nota';
    normaId: string;
    nomeSolicitante: string;
    conteudoSugerido: string;
    status: 'Pendente';
}

export function ModalSolicitacaoNota({ open, onOpenChange, normas = [] }: ModalSolicitacaoNotaProps) {
    const [form, setForm] = useState<FormState>({
        nomeSolicitante: '',
        normaId: '',
        conteudoSugerido: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [enviando, setEnviando] = useState(false);
    const [enviado, setEnviado] = useState(false);

    const [busca, setBusca] = useState('');
    const [normasSugeridas, setNormasSugeridas] = useState<NormaOpcao[]>([]);
    const [dropdownAberto, setDropdownAberto] = useState(false);
    const refCombobox = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open && normas.length === 1) {
            setBusca(normas[0].titulo);
            setForm((prev) => ({ ...prev, normaId: String(normas[0].id) }));
        }
    }, [open, normas]);

    useEffect(() => {
        if (!dropdownAberto) return;

        const buscarNormas = async () => {
            try {
                const response = await api.get('/normas/listar', {
                    params: { texto: busca.trim() || undefined, page: 1 },
                });
                setNormasSugeridas(response.data?.itens || []);
            } catch (error) {
                console.error('Erro ao buscar normas:', error);
            }
        };

        buscarNormas();
    }, [busca, dropdownAberto]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (refCombobox.current && !refCombobox.current.contains(event.target as Node)) {
                setDropdownAberto(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const resetModal = () => {
        setForm({ nomeSolicitante: '', normaId: '', conteudoSugerido: '' });
        setErrors({});
        setEnviando(false);
        setEnviado(false);
        setBusca('');
        setNormasSugeridas([]);
        setDropdownAberto(false);
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) resetModal();
        onOpenChange(nextOpen);
    };

    const selecionarNorma = (norma: NormaOpcao) => {
        setBusca(norma.titulo);
        setForm((prev) => ({ ...prev, normaId: norma.codigo }));
        setDropdownAberto(false);
        if (errors.normaId) setErrors((prev) => ({ ...prev, normaId: undefined }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const validar = (): boolean => {
        const novosErros: FormErrors = {};
        if (!form.nomeSolicitante.trim()) novosErros.nomeSolicitante = 'Preenchimento obrigatório.';
        if (!form.normaId) novosErros.normaId = 'Preenchimento obrigatório.';
        if (!form.conteudoSugerido.trim()) novosErros.conteudoSugerido = 'Preenchimento obrigatório.';

        setErrors(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validar()) return;

        setEnviando(true);

        const payload: SolicitacaoNotaPayload = {
            tipo: 'Nova Nota',
            normaId: form.normaId,
            nomeSolicitante: form.nomeSolicitante.trim(),
            conteudoSugerido: form.conteudoSugerido.trim(),
            status: 'Pendente',
        };

        // TODO: Substituir por chamada real à API
        setTimeout(() => {
            console.log('[Solicitação de Nota] Payload:', payload);
            setEnviando(false);
            setEnviado(true);
        }, 1000);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="!p-0 flex flex-col gap-0 sm:!max-w-[640px] bg-[#fbfbfb]">
                <div className="flex items-start mx-7 mt-5 mb-4">
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-red-akaer uppercase">
                            Solicitação
                        </p>
                        <h2 className="text-lg font-medium text-dark-title leading-tight">
                            Norma aeronáutica
                        </h2>
                    </div>
                </div>

                <hr className="border-font-border" />

                {enviado ? (
                    <>
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-12 h-12 rounded-full border border-green-700/40 flex items-center justify-center">
                                <Check className="text-green-700 w-7 h-7" />
                            </div>
                            <h3 className="text-base text-[#3f3f3f] font-semibold">
                                Solicitação de Norma cadastrada com sucesso!
                            </h3>
                            <p className="text-sm text-gray-500">
                                Os metadados foram salvos no sistema.
                            </p>
                        </div>
                        <hr className="border-font-border" />
                        <div className="flex justify-end mx-7 my-4">
                            <Button size="lg" className="hover:bg-black/80" onClick={() => handleOpenChange(false)}>
                                Fechar
                            </Button>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleSubmit} noValidate className="flex flex-col">
                        <div className="mx-7 mt-5 mb-6 flex flex-col gap-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-lg text-gray-600 mb-0 leading-none">
                                        NOME DO SOLICITANTE <span className="text-red-akaer">*</span>
                                    </label>
                                    <input
                                        name="nomeSolicitante"
                                        value={form.nomeSolicitante}
                                        onChange={handleChange}
                                        placeholder="Ex: Cesar Silva"
                                        className={`bg-gray-100/80 border rounded h-10 px-3 text-sm outline-none focus:ring-1 focus:ring-gray-400 transition ${errors.nomeSolicitante ? 'border-red-400' : 'border-font-border'
                                            }`}
                                    />
                                    {errors.nomeSolicitante && (
                                        <span className="text-xs text-red-akaer mt-0.5">{errors.nomeSolicitante}</span>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-lg text-gray-600 mb-0 leading-none">
                                        NORMA RELACIONADA <span className="text-red-akaer">*</span>
                                    </label>
                                    <div ref={refCombobox} className="relative">
                                        <input
                                            value={busca}
                                            onChange={(e) => {
                                                setBusca(e.target.value);
                                                setForm((prev) => ({ ...prev, normaId: '' }));
                                                if (errors.normaId) setErrors((prev) => ({ ...prev, normaId: undefined }));
                                            }}
                                            onFocus={() => setDropdownAberto(true)}
                                            placeholder="Buscar norma..."
                                            className={`bg-gray-100/80 border rounded h-10 px-3 text-sm outline-none focus:ring-1 focus:ring-gray-400 transition w-full ${errors.normaId ? 'border-red-400' : 'border-font-border'
                                                }`}
                                        />
                                        {dropdownAberto && (
                                            <div className="absolute z-50 mt-1 w-full border rounded bg-white max-h-40 overflow-y-auto shadow-sm">
                                                {normasSugeridas.length > 0 ? (
                                                    normasSugeridas.map((n) => (
                                                        <div
                                                            key={n.codigo}
                                                            className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                            onMouseDown={() => selecionarNorma(n)}
                                                        >
                                                            {n.codigo} — {n.titulo}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-2 text-sm text-gray-400">Nenhuma norma encontrada</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {errors.normaId && <span className="text-xs text-red-akaer mt-0.5">{errors.normaId}</span>}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-lg text-gray-600 mb-0 leading-none">
                                    INSERIR NOTA <span className="text-red-akaer">*</span>
                                </label>
                                <textarea
                                    name="conteudoSugerido"
                                    value={form.conteudoSugerido}
                                    onChange={handleChange}
                                    rows={5}
                                    placeholder="Ex: Insira Aqui Anotações Rápidas, Exceções Ou Detalhes Sobre A Norma..."
                                    className={`bg-gray-100/80 border rounded p-3 text-sm outline-none focus:ring-1 focus:ring-gray-400 transition resize-none ${errors.conteudoSugerido ? 'border-red-400' : 'border-font-border'
                                        }`}
                                />
                                {errors.conteudoSugerido && (
                                    <span className="text-xs text-red-akaer mt-0.5">{errors.conteudoSugerido}</span>
                                )}
                            </div>
                        </div>

                        <hr className="border-font-border" />

                        <div className="grid grid-cols-2 mx-7 items-center py-4">
                            <div className="text-start text-sm text-gray-500">
                                Campos com <span className="text-red-akaer">*</span> são obrigatórios
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" size="lg" variant="secondary"
                                    onClick={() => handleOpenChange(false)} disabled={enviando}
                                    className="text-sm text-gray-600 hover:text-dark-title border border-gray-200 rounded-md px-4 py-2 transition-colors cursor-pointer">
                                    Cancelar
                                </Button>
                                <Button type="submit" size="lg" className="hover:bg-black/80 bg-dark-title" disabled={enviando}>
                                    {enviando ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                            </svg>
                                            Enviando...
                                        </span>
                                    ) : (
                                        <><Check className="w-4 h-4 mr-1" /> Enviar</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}