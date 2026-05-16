import { ChevronRight } from 'lucide-react';

export type TipoSolicitacao = 'indicar_norma' | 'adicionar_nota' | 'reportar_erro';

interface SelectRequestModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (tipo: TipoSolicitacao) => void;
}

const opcoes: { tipo: TipoSolicitacao; titulo: string; descricao: string }[] = [
    {
        tipo: 'indicar_norma',
        titulo: 'Indicar Norma',
        descricao: 'Sugira uma norma que ainda não está na plataforma',
    },
    {
        tipo: 'adicionar_nota',
        titulo: 'Adicionar Nota',
        descricao: 'Insira uma observação ou comentário em uma norma',
    },
    {
        tipo: 'reportar_erro',
        titulo: 'Reportar Erro',
        descricao: 'Informe um problema ou inconsistência em uma norma',
    },
];

export default function SelectRequestModal({
    open,
    onOpenChange,
    onSelect,
}: SelectRequestModalProps) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => onOpenChange(false)}
        >
            <div
                className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-gray-200">
                    <p className="text-red-akaer font-bold text-xs tracking-widest uppercase mb-1">
                        Solicitação
                    </p>
                    <h2 className="text-2xl font-semibold text-dark-title leading-tight">
                        Escolha o tipo de solicitação
                    </h2>
                </div>

                {/* Options */}
                <div className="flex flex-col gap-2 px-6 py-4">
                    {opcoes.map(({ tipo, titulo, descricao }) => (
                        <button
                            key={tipo}
                            onClick={() => onSelect(tipo)}
                            className="flex items-center justify-between w-full bg-dark-title rounded-lg px-4 py-4 text-left hover:opacity-90 transition-opacity group"
                        >
                            <div>
                                <p className="font-semibold text-white text-sm">{titulo}</p>
                                <p className="text-gray-400 text-xs mt-0.5 leading-snug max-w-[220px]">
                                    {descricao}
                                </p>
                            </div>
                            <ChevronRight
                                size={18}
                                className="text-white flex-shrink-0"
                            />
                        </button>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex justify-end px-6 py-4 border-t border-gray-200">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="text-sm text-gray-600 hover:text-dark-title border border-gray-200 rounded-md px-4 py-2 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}