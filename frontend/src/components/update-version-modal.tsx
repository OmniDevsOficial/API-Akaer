import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FileUpload } from './ui/file-upload';
import type { Norma } from './tabela';

// ── Dados mockados ──────────────────────────────────────────────────────────
const MOCK_NORMA = {
    codigo: 'SAE ARP 4754A',
    titulo: 'Certificação de Gestão de Sistemas e Equipamentos',
    orgaoEmissor: 'SAE International',
    categoria: 'Aeronavegabilidade',
    status: 'Ativa',
    etapaProjeto: 'Projeto Conceitual',
    revisaoAtual: 'C',
    escopo:
        'Estabelece diretrizes para a certificação de sistemas e equipamentos em aeronaves, garantindo conformidade com padrões internacionais de segurança e qualidade.',
    palavrasChave: ['certificação', 'gestão', 'segurança'],
    notas: [
        { id: 1, texto: 'Norma revisada conforme última atualização do órgão emissor.' },
        { id: 2, texto: 'Aplicável a projetos em fase conceitual e de desenvolvimento.' },
    ],
    normasRelacionadas: [
        { codigo: 'SAE ARP 4761', titulo: 'Safety Assessment Process' },
        { codigo: 'DO-178C', titulo: 'Software Considerations in Airborne Systems' },
    ],
};

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
}

// ── Componente ───────────────────────────────────────────────────────────────

export default function UpdateVersionModal({ 
    open, 
    onOpenChange, 
    // norma
 }: UpdateVersionModalProps) {
    const [dataPublicacao, setDataPublicacao] = useState('');
    const [arquivoNorma, setArquivoNorma] = useState<File | null>(null);
    const [concluido, setConcluido] = useState(false);

    // Dados mockados (ignora a norma real da tabela)
    const mock = MOCK_NORMA;
    const proximaRevisao = calcularProximaRevisao(mock.revisaoAtual);

    // Limpa estado ao abrir/fechar
    useEffect(() => {
        if (open) {
            setDataPublicacao('');
            setArquivoNorma(null);
            setConcluido(false);
        }
    }, [open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!arquivoNorma) {
            alert('É obrigatório enviar o novo PDF da revisão.');
            return;
        }

        if (dataPublicacao.length !== 10) {
            alert('A data de publicação deve estar no formato completo: DD/MM/AAAA');
            return;
        }

        console.log('✅ Revisão atualizada (mock):', {
            codigo: mock.codigo,
            titulo: mock.titulo,
            novaRevisao: proximaRevisao,
            dataPublicacao,
            arquivo: arquivoNorma.name,
        });

        setConcluido(true);
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setDataPublicacao('');
            setArquivoNorma(null);
            setConcluido(false);
        }
        onOpenChange(nextOpen);
    };

    // Estilo comum para inputs bloqueados
    const disabledInputClass =
        'bg-gray-200/80 border rounded h-10 px-2 text-gray-500 cursor-not-allowed';
    const disabledTextareaClass =
        'bg-gray-200/80 border rounded p-3 min-h-24 text-gray-500 cursor-not-allowed resize-none';

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

                {concluido ? (
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
                            <Button
                                size="lg"
                                className="hover:bg-black/80"
                                onClick={() => handleOpenChange(false)}
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
                                        <input
                                            className={disabledInputClass}
                                            value={mock.titulo}
                                            disabled
                                        />
                                    </div>

                                    {/* Órgão Emissor — bloqueado */}
                                    <div className="flex flex-col text-start gap-1">
                                        <label className="text-lg text-gray-600 mb-0 leading-none">ÓRGÃO EMISSOR</label>
                                        <input
                                            className={disabledInputClass}
                                            value={mock.orgaoEmissor}
                                            disabled
                                        />
                                    </div>

                                    {/* Status — bloqueado */}
                                    <div className="flex flex-col text-start gap-1">
                                        <label className="text-lg text-gray-600 mb-0 leading-none">STATUS</label>
                                        <input
                                            className={disabledInputClass}
                                            value={mock.status}
                                            disabled
                                        />
                                    </div>

                                    {/* Etapa do Projeto — bloqueado */}
                                    <div className="flex flex-col text-start gap-1">
                                        <label className="text-lg text-gray-600 mb-0 leading-none">ETAPA DO PROJETO</label>
                                        <input
                                            className={disabledInputClass}
                                            value={mock.etapaProjeto}
                                            disabled
                                        />
                                        <span className="text-xs text-gray-400 invisible" aria-hidden="true">
                                            Espaco reservado
                                        </span>
                                    </div>
                                </div>

                                {/* Coluna direita */}
                                <div className="grid gap-5">
                                    {/* Código — bloqueado */}
                                    <div className="flex flex-col text-start gap-1">
                                        <label className="text-lg text-gray-600 mb-0 leading-none">CÓDIGO</label>
                                        <input
                                            className={disabledInputClass}
                                            value={mock.codigo}
                                            disabled
                                        />
                                    </div>

                                    {/* Categoria — bloqueado */}
                                    <div className="flex flex-col text-start gap-1">
                                        <label className="text-lg text-gray-600 mb-0 leading-none">CATEGORIA</label>
                                        <input
                                            className={disabledInputClass}
                                            value={mock.categoria}
                                            disabled
                                        />
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
                                            onChange={(e) =>
                                                setDataPublicacao(formatarDataBrasileira(e.target.value))
                                            }
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
                                        <input
                                            className={disabledInputClass}
                                            value={proximaRevisao}
                                            disabled
                                        />
                                        <span className="text-xs text-gray-400">
                                            Revisão atual: {mock.revisaoAtual} → Nova: {proximaRevisao}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Escopo — bloqueado */}
                            <div className="mx-8 mt-6">
                                <div className="flex flex-col text-start gap-1 mb-5">
                                    <label className="text-lg text-gray-600">ESCOPO</label>
                                    <textarea
                                        className={disabledTextareaClass}
                                        value={mock.escopo}
                                        disabled
                                    />
                                </div>

                                {/* Palavras-chave — bloqueado */}
                                <div className="flex flex-col text-start mb-5">
                                    <label className="text-lg text-gray-600">PALAVRAS-CHAVE</label>
                                    <div className="flex flex-wrap gap-2 border rounded p-3 bg-gray-200/60 cursor-not-allowed">
                                        {mock.palavrasChave.map((item, index) => (
                                            <div
                                                key={index}
                                                className="px-2 py-1 rounded bg-red-50 text-sm flex items-center gap-2 text-gray-500"
                                            >
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
                                            {mock.notas.map((nota, index) => (
                                                <li
                                                    key={nota.id}
                                                    className="flex items-start gap-2.5 rounded-md border border-gray-200 bg-white px-3 py-2.5"
                                                >
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
                                        {mock.normasRelacionadas.map((n) => (
                                            <div
                                                key={n.codigo}
                                                className="flex items-center gap-2 px-2 py-1 rounded bg-[#FAF9F7] text-gray-500 text-sm border border-font-border rounded-sm"
                                            >
                                                {n.codigo} - {n.titulo}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="grid grid-cols-2 mx-8 items-center py-4 border-t">
                            <div className="text-start">
                                Campos com <span className="text-red-akaer">*</span> são Obrigatórios
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    size="lg"
                                    className="ml-auto border border-gray-600/40 hover:bg-gray-200"
                                    variant="secondary"
                                    onClick={() => handleOpenChange(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button size="lg" className="ml-2 hover:bg-black/80" type="submit">
                                    <Check />
                                    Confirmar Revisão
                                </Button>
                            </div>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}