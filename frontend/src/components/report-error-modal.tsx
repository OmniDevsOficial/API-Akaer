import { useState } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Check } from 'lucide-react';


interface ReportErrorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface FormFields {
    nomeSolicitante: string;
    normaRelacionada: string;
    detalhesErro: string;
}

interface FormErrors {
    nomeSolicitante?: string;
    normaRelacionada?: string;
    detalhesErro?: string;
}

export default function ReportErrorModal({
    open,
    onOpenChange,
}: ReportErrorModalProps) {
    const [form, setForm] = useState<FormFields>({
        nomeSolicitante: '',
        normaRelacionada: '',
        detalhesErro: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [sucesso, setSucesso] = useState(false);

    if (!open) return null;

    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        if (!form.nomeSolicitante.trim()) newErrors.nomeSolicitante = 'Campo obrigatório';
        if (!form.normaRelacionada.trim()) newErrors.normaRelacionada = 'Campo obrigatório';
        if (!form.detalhesErro.trim()) newErrors.detalhesErro = 'Campo obrigatório';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        // TODO: POST /api/solicitacoes { tipo: 'erro', status: 'Pendente', ...form }
        console.log('[Solicitação] Reportar erro:', { ...form, status: 'Pendente' });

        setSucesso(true);
        setTimeout(() => {
            setSucesso(false);
            setForm({ nomeSolicitante: '', normaRelacionada: '', detalhesErro: '' });
            setErrors({});
            onOpenChange(false);
        }, 2000);
    };

    const handleClose = () => {
        setForm({ nomeSolicitante: '', normaRelacionada: '', detalhesErro: '' });
        setErrors({});
        setSucesso(false);
        onOpenChange(false);
    };

    const handleChange = (field: keyof FormFields, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden rounded-2xl bg-white outline-none">
                {/* Header */}
                <div className="px-6 py-4 flex items-start justify-between border-b border-gray-200">
                    <div>
                        <p className="text-red-akaer font-bold text-xs tracking-widest uppercase mb-1">
                            Solicitação
                        </p>
                        <h2 className="font-semibold text-dark-title text-base">Norma aeronáutica</h2>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-5 flex flex-col gap-4">
                    {sucesso && (
                        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-md px-4 py-2">
                            Solicitação enviada com sucesso.
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-dark-title uppercase tracking-wide">
                                Nome do Solicitante <span className="text-red-akaer">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: Cesar Silva"
                                value={form.nomeSolicitante}
                                onChange={(e) => handleChange('nomeSolicitante', e.target.value)}
                                className="border border-gray-200 rounded-md px-3 py-2 text-sm text-dark-title placeholder-gray-400 focus:outline-none focus:border-gray-400"
                            />
                            {errors.nomeSolicitante && (
                                <span className="text-red-akaer text-xs">{errors.nomeSolicitante}</span>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-dark-title uppercase tracking-wide">
                                Norma Relacionada <span className="text-red-akaer">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: Aeronavegabilidade"
                                value={form.normaRelacionada}
                                onChange={(e) => handleChange('normaRelacionada', e.target.value)}
                                className="border border-gray-200 rounded-md px-3 py-2 text-sm text-dark-title placeholder-gray-400 focus:outline-none focus:border-gray-400"
                            />
                            {errors.normaRelacionada && (
                                <span className="text-red-akaer text-xs">{errors.normaRelacionada}</span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-dark-title uppercase tracking-wide">
                            Detalhes do Erro <span className="text-red-akaer">*</span>
                        </label>
                        <textarea
                            placeholder="Ex: Descreva detalhadamente sobre o erro aqui..."
                            value={form.detalhesErro}
                            onChange={(e) => handleChange('detalhesErro', e.target.value)}
                            rows={4}
                            className="border border-gray-200 rounded-md px-3 py-2 text-sm text-dark-title placeholder-gray-400 focus:outline-none focus:border-gray-400 resize-none"
                        />
                        {errors.detalhesErro && (
                            <span className="text-red-akaer text-xs">{errors.detalhesErro}</span>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                    <span className="text-xs text-gray-400">Campos com <span className="text-xs text-red-akaer">*</span> são obrigatórios</span>
                    <div className="flex gap-2">
                        <button
                            onClick={handleClose}
                            className="text-sm text-gray-600 hover:text-dark-title border border-gray-200 rounded-md px-4 py-2 transition-colors cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="text-sm font-semibold text-white bg-dark-title rounded-md px-4  hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer"
                        >
                            <Check className="w-4 h-4 mr-1" /> Enviar
                        </button>
                    </div>
                </div>
            </DialogContent >
        </Dialog >
    );
}