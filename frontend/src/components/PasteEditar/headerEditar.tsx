import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheck } from "react-icons/fa6";
import { Loader2 } from "lucide-react";

type Props = {
    onSalvar: () => Promise<void>;
};

export const HeaderEditar: React.FC<Props> = ({ onSalvar }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const titulo = location.state?.norma?.titulo;

    const [salvando, setSalvando] = useState(false);
    const [feedback, setFeedback] = useState<{ tipo: "sucesso" | "erro"; msg: string } | null>(null);

    const handleSalvar = async () => {
        setSalvando(true);
        setFeedback(null);

        try {
            await onSalvar();
            setFeedback({
                tipo: "sucesso",
                msg: "Norma atualizada com sucesso!",
            });
        } catch (err: any) {
            const msg =
                err?.response?.data?.error ||
                err?.response?.data?.message ||
                err?.message ||
                "Erro ao salvar. Tente novamente.";

            setFeedback({
                tipo: "erro",
                msg,
            });
        } finally {
            setSalvando(false);
        }
    };

    return (
        <header className="bg-white border-b border-font-border">
            <div className="h-16 px-8 flex items-center justify-between">
                <div className="flex gap-4 items-center text-sm">
                    <button
                        onClick={() => navigate(-1)}
                        className="border border-[#E8E4DF] py-1.5 px-2 rounded-md text-[#6A6460] cursor-pointer"
                    >
                        {"<"} Voltar
                    </button>

                    <span 
                    onClick={() => navigate(-1)}
                    className="text-[#B5B0AB] cursor-pointer hover:text-black/60 transition-colors">Normas</span>
                    <span className="text-[#B5B0AB]">{">"}</span>
                    <span>{titulo || "Editar norma"}</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        disabled={salvando}
                        className="flex items-center text-sm text-[#6A6460] border border-font-border rounded-lg cursor-pointer py-2 px-2.5 hover:bg-[#6A6460]/3 disabled:opacity-60"
                    >
                        Descartar
                    </button>

                    <button
                        type="button"
                        onClick={handleSalvar}
                        disabled={salvando}
                        className="flex items-center gap-1 bg-dark-title text-sm text-white rounded-lg py-2 px-3 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                    >
                        {salvando ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <FaCheck />
                        )}
                        Salvar Alterações
                    </button>
                </div>
            </div>

            {feedback && (
                <div
                    className={`px-8 pb-2 text-xs font-medium ${
                        feedback.tipo === "sucesso" ? "text-green-600" : "text-red-500"
                    }`}
                >
                    {feedback.msg}
                </div>
            )}
        </header>
    );
};