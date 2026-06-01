import { X } from 'lucide-react';

interface Props {
    open: boolean;
    onClose: () => void;
    titulo: string;
    mensagem: string;
    descricao?: string;
    tipo?: 'sucesso' | 'erro';
}

export default function ModalFeedback({ open, onClose, titulo, mensagem, descricao, tipo = 'sucesso' }: Props) {
    if (!open) return null;

    const isSucesso = tipo === 'sucesso';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 font-dm">

                {/* Header */}
                <div className="px-5 pt-5 pb-3 border-b border-gray-100 flex items-start justify-between">
                    <div>
                        <span className="text-xs font-medium text-red-akaer tracking-widest uppercase">
                            USUÁRIOS
                        </span>
                        <br />
                        <span className="text-md font-semibold text-gray-800">{titulo}</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5">
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 py-10 flex flex-col items-center gap-3">
                    {/* Ícone */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 
                        ${isSucesso ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'}`}>
                        {isSucesso ? (
                            <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-green-500 fill-none" strokeWidth={2.5}
                                strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-red-500 fill-none" strokeWidth={2.5}
                                strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        )}
                    </div>

                    <p className="text-base font-bold text-gray-800 text-center">{mensagem}</p>
                    {descricao && (
                        <p className="text-sm text-gray-400 text-center">{descricao}</p>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end px-5 py-3 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-5 py-1.5 text-sm font-semibold text-white bg-[#1a1a1a] rounded hover:bg-[#73203A] transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}