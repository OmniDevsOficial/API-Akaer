import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Check, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FileUpload } from './ui/file-upload';
import type { Norma } from './tabela';
import api from '@/services/api';

interface NormaDetalhe {
    id: number;
    codigo: string;
    titulo: string;
    revisao?: string | null;
    orgao_emissor?: { nome: string };
    categoria?: { nome: string };
    status: string;
    etapa_projeto?: string;
    escopo?: string;
    palavras_chave?: string[];
    notas?: { id: number; texto: string }[];
    normas_relacionadas?: { codigo: string; titulo: string }[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Calcula a próxima letra de revisão. Suporta de A a Z. */
function calcularProximaRevisao(revisaoAtual: string | null | undefined): string {
    if (!revisaoAtual || revisaoAtual.length === 0) return 'A';

    const letraAtual = revisaoAtual.toUpperCase().charAt(0);
    const charCode = letraAtual.charCodeAt(0);

    // Se já é Z, não avança — limite da sequência simples
    if (charCode >= 90) return 'Z';

    return String.fromCharCode(charCode + 1);
}

function formatarDataBrasileira(valor: string): string {
    const somenteNumeros = valor.replace(/\D/g, '').slice(0, 8);

    if (somenteNumeros.length <= 2) return somenteNumeros;
    if (somenteNumeros.length <= 4) {
        return `${somenteNumeros.slice(0, 2)}/${somenteNumeros.slice(2)}`;
    }

    return `${somenteNumeros.slice(0, 2)}/${somenteNumeros.slice(2, 4)}/${somenteNumeros.slice(4)}`;
}

// ── Props ────────────────────────────────────────────────────────────────────

interface UpdateVersionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    norma: Norma | null;
    onSuccess?: () => void;
}

// ── Componente ───────────────────────────────────────────────────────────────

export default function UpdateVersionModal({
    open,
    onOpenChange,
    norma,
    onSuccess
}: UpdateVersionModalProps) {
    const [detalhe, setDetalhe] = useState<NormaDetalhe | null>(null);
    const [loadingDetalhe, setLoadingDetalhe] = useState(false);

    const [dataPublicacao, setDataPublicacao] = useState('');
    const [arquivoNorma, setArquivoNorma] = useState<File | null>(null);
    const [concluido, setConcluido] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    const proximaRevisao = calcularProximaRevisao(detalhe?.revisao);

    // Limpa estado ao abrir/fechar
    useEffect(() => {
        if (!open || !norma) return;

        setDataPublicacao('');
        setArquivoNorma(null);
        setConcluido(false);
        setErro(null);
        setDetalhe(null);

        const fetchDetalhe = async () => {
            try {
                setLoadingDetalhe(true);
                const { data } = await api.get<NormaDetalhe>(`/normas/${norma.codigo}`);
                setDetalhe(data);
            } catch {
                setErro('Não foi possível carregar os dados da norma.');
            } finally {
                setLoadingDetalhe(false);
            }
        };

        fetchDetalhe();
    }, [open, norma]);


    const handleSubmit = async (e: React.FormEvent) => {
        ;
        e.preventDefault();
        setErro(null);

        if (!detalhe) return;

        if (!arquivoNorma) {
            setErro('É obrigatório enviar o novo PDF da revisão.');
            return;
        }

        if (dataPublicacao.length !== 10) {
            setErro('A data de publicação deve estar no formato completo: DD/MM/AAAA');
            return;
        }

        const formData = new FormData(); const arquivoLimpo = new File([arquivoNorma], arquivoNorma.name, {
            type: arquivoNorma.type,
        });
        formData.append('file', arquivoLimpo)

        try {
            setIsLoading(true);
            await api.post(`/normas/${encodeURIComponent(detalhe.codigo)}/revisao`, formData);
            setConcluido(true);
            onSuccess?.();
        } catch (err: any) {
            setErro(
                err?.response?.data?.error ||
                err?.response?.data?.message ||
                'Erro ao atualizar a revisão. Tente novamente.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setDataPublicacao('');
            setArquivoNorma(null);
            setConcluido(false);
            setErro(null);
            setDetalhe(null);
        }
        onOpenChange(nextOpen);
    };

    // Estilo comum para inputs bloqueados
    const disabledInputClass =
        'bg-gray-200/80 border rounded h-10 px-2 text-gray-500 cursor-not-allowed';
    const disabledTextareaClass =
        'bg-gray-200/80 border rounded p-3 min-h-24 text-gray-500 cursor-not-allowed resize-none';

    if (!norma) return null;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="!p-0 flex flex-col text-center gap-4 sm:!max-w-[90vh]">
                {/* Header */}
                <div className="mx-7 mt-5">
                    <p className="text-start">
                        <span className="text-red-akaer">NOVA REVISÃO</span>
                        <br />
                        <span className="text-lg">Atualizar norma aeronáutica</span>
                    </p>
                </div>
                <hr className="!mt-0" />

                {loadingDetalhe ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
                    </div>
                ) : concluido ? (
                    <>
                        {/* Tela de sucesso */}
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-12 h-12 rounded-full border border-green-700/40 flex items-center justify-center">
                                <Check className="text-green-700 w-7 h-7" />
                            </div>
                            <h3 className="text-4 text-[#3f3f3f] font-semibold">
                                Revisão atualizada com sucesso!
                            </h3>
                            <p className="text-3 text-gray-500">
                                A nova revisão <strong>{proximaRevisao}</strong> foi registrada no sistema.
                            </p>
                        </div>

                        <hr />

                        <div className="flex justify-end mx-8 items-center mb-4">
                            <Button size="lg" className="hover:bg-black/80" onClick={() => handleOpenChange(false)}
                            >
                                Fechar
                            </Button>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col h-full">
                        <div className="overflow-y-auto max-h-[70vh] pr-2">
                            {/* Upload de PDF — editável */}
                            <div className="mx-5">
                                <FileUpload onFileSelected={setArquivoNorma} />
                            </div>

                            {/* Separador METADADOS */}
                            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mx-8 mb-6">
                                <hr className="w-full border-gray-400" />
                                <span className="text-center text-[0.95rem] text-gray-400">METADADOS</span>
                                <hr className="w-full border-gray-400" />
                            </div>

                            {/* Grid 2 colunas */}
                            <div className="grid grid-cols-2 mx-8 gap-4">
                                {/* Coluna esquerda */}
                                <div className="grid gap-5">
                                    {/* Título — bloqueado */}
                                    <div className="flex flex-col text-start gap-1">
                                        <label className="text-lg text-gray-600 mb-0 leading-none">TÍTULO</label>
                                        <input className={disabledInputClass} value={detalhe?.titulo ?? ''} disabled />
                                    </div>

                                    {/* Órgão Emissor — bloqueado */}
                                    <div className="flex flex-col text-start gap-1">
                                        <label className="text-lg text-gray-600 mb-0 leading-none">ÓRGÃO EMISSOR</label>
                                        <input className={disabledInputClass} value={detalhe?.orgao_emissor?.nome ?? ''} disabled />
                                    </div>

                                    {/* Status — bloqueado */}
                                    <div className="flex flex-col text-start gap-1">
                                        <label className="text-lg text-gray-600 mb-0 leading-none">STATUS</label>
                                        <input className={disabledInputClass} value={detalhe?.status ?? ''} disabled />
                                    </div>

                                    {/* Etapa do Projeto — bloqueado */}
                                    <div className="flex flex-col text-start gap-1">
                                        <label className="text-lg text-gray-600 mb-0 leading-none">ETAPA DO PROJETO</label>
                                        <input className={disabledInputClass} value={detalhe?.etapa_projeto ?? ''} disabled />
                                        <span className="text-xs text-gray-400 invisible" aria-hidden="true">Espaço reservado</span>
                                    </div>
                                </div>

                                {/* Coluna direita */}
                                <div className="grid gap-5">
                                    {/* Código — bloqueado */}
                                    <div className="flex flex-col text-start gap-1">
                                        <label className="text-lg text-gray-600 mb-0 leading-none">CÓDIGO</label>
                                        <input className={disabledInputClass} value={detalhe?.codigo ?? ''} disabled />
                                    </div>

                                    {/* Categoria — bloqueado */}
                                    <div className="flex flex-col text-start gap-1">
                                        <label className="text-lg text-gray-600 mb-0 leading-none">CATEGORIA</label>
                                        <input className={disabledInputClass} value={detalhe?.categoria?.nome ?? ''} disabled />
                                    </div>

                                    {/* Data de Publicação — EDITÁVEL */}
                                    <div className="flex flex-col text-start gap-1">
                                        <label className="text-lg text-gray-600 mb-0 leading-none">
                                            DATA DE PUBLICAÇÃO <span className="text-red-akaer">*</span>
                                        </label>
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

                                    {/* Revisão — bloqueado, auto-calculado */}
                                    <div className="flex flex-col text-start gap-1">
                                        <label className="text-lg text-gray-600 mb-0 leading-none">
                                            REVISÃO <span className="text-red-akaer">*</span>
                                        </label>
                                        <input className={disabledInputClass} value={proximaRevisao} disabled />
                                        <span className="text-xs text-gray-400">
                                            Revisão atual: {detalhe?.revisao ?? '—'} → Nova: {proximaRevisao}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Escopo, palavras-chave, notas, normas correlacionadas */}
                            <div className="mx-8 mt-6">
                                <div className="flex flex-col text-start gap-1 mb-5">
                                    <label className="text-lg text-gray-600">ESCOPO</label>
                                    <textarea className={disabledTextareaClass} value={detalhe?.escopo ?? ''} disabled />
                                </div>

                                {/* Palavras-chave — bloqueado */}
                                <div className="flex flex-col text-start mb-5">
                                    <label className="text-lg text-gray-600">PALAVRAS-CHAVE</label>
                                    <div className="flex flex-wrap gap-2 border rounded p-3 bg-gray-200/60 cursor-not-allowed">
                                        {(detalhe?.palavras_chave ?? []).map((item: string, index: number) => (
                                            <div key={index} className="px-2 py-1 rounded bg-red-50 text-sm flex items-center gap-2 text-gray-500">
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Notas — bloqueado (visualização estática) */}
                                <div className="flex flex-col text-start gap-1 mb-5">
                                    <label className="text-lg text-gray-600">NOTAS</label>
                                    <div className="rounded-md border border-gray-200 bg-gray-100/60 p-3 cursor-not-allowed">
                                        <ul className="flex flex-col gap-1.5">
                                            {(detalhe?.notas ?? []).map((nota, index) => (
                                                <li key={nota.id} className="flex items-start gap-2.5 rounded-md border border-gray-200 bg-white px-3 py-2.5">
                                                    <span className="mt-0.5 shrink-0 rounded bg-gray-200 px-1.5 py-0.5 text-[11px] text-black select-none">
                                                        {index + 1}
                                                    </span>
                                                    <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap break-words">
                                                        {nota.texto}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Normas Correlacionadas — bloqueado (visualização estática) */}
                                <div className="flex flex-col text-start my-6">
                                    <label className="text-lg text-gray-600">NORMAS CORRELACIONADAS</label>
                                    <div className="flex flex-wrap gap-2 mt-1 cursor-not-allowed">
                                        {(detalhe?.normas_relacionadas ?? []).map((n) => (
                                            <div key={n.codigo} className="flex items-center gap-2 px-2 py-1 rounded bg-[#FAF9F7] text-gray-500 text-sm border border-font-border">
                                                {n.codigo} - {n.titulo}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mensagem de erro */}
                        {erro && (
                            <p className="mx-8 text-sm text-red-500 text-start -mb-2">{erro}</p>
                        )}

                        {/* Footer */}
                        <div className="grid grid-cols-2 mx-8 items-center py-4 border-t">
                            <div className="text-start">
                                Campos com <span className="text-red-akaer">*</span> são Obrigatórios
                            </div>
                            <div className="flex justify-end">
                                <Button type="button" size="lg" className="ml-auto border border-gray-600/40 hover:bg-gray-200"
                                    variant="secondary" onClick={() => handleOpenChange(false)}
                                    disabled={isLoading}
                                >
                                    Cancelar
                                </Button>
                                <Button size="lg" className="ml-2 hover:bg-black/80" type="submit" disabled={isLoading}>
                                    {isLoading
                                        ?
                                        <Loader2 className="animate-spin w-4 h-4" />
                                        :
                                        <Check />
                                    }
                                    {isLoading ? 'Salvando...' : 'Confirmar Revisão'}
                                </Button>
                            </div>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}