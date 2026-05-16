import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaCheck } from "react-icons/fa6";
import { ChevronLeft, Loader2 } from "lucide-react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "../../../components/ui/breadcrumb";

type Props = {
    onSalvar: () => Promise<void>;
};

export const HeaderEditar: React.FC<Props> = ({ onSalvar }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const codigo = location.state?.norma?.codigo;

    const [salvando, setSalvando] = useState(false);
    const [feedback, setFeedback] = useState<{ tipo: "sucesso" | "erro"; msg: string } | null>(null);

    const handleSalvar = async () => {
        setSalvando(true);
        setFeedback(null);

        try {
            await onSalvar();
            setFeedback({ tipo: "sucesso", msg: "Norma atualizada com sucesso!" });
        } catch (err: any) {
            const msg =
                err?.response?.data?.error ||
                err?.response?.data?.message ||
                err?.message ||
                "Erro ao salvar. Tente novamente.";

            setFeedback({ tipo: "erro", msg });
        } finally {
            setSalvando(false);
        }
    };

    return (
        <header className="bg-white border-b border-font-border">
            <div className="flex flex-wrap items-center justify-between gap-4 px-7 py-5">
                {/* Breadcrumb */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 rounded-md border border-font-border px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-dark-title"
                    >
                        <ChevronLeft size={14} />
                        Voltar
                    </button>

                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link to="/home">Normas</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="flex items-center gap-2">
                                    Edição de Norma
                                    {codigo && (
                                        <span className="inline-flex items-center rounded-full border border-font-border bg-[#FAF9F7] px-2 py-0.5 text-xs font-medium text-gray-600">
                                            {codigo}
                                        </span>
                                    )}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        disabled={salvando}
                        className="flex items-center text-sm text-[#6A6460] border border-font-border rounded-lg cursor-pointer py-2 px-2.5 hover:bg-[#6A6460]/5 disabled:opacity-60"
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
                    className={`px-7 pb-3 text-xs font-medium ${
                        feedback.tipo === "sucesso" ? "text-green-600" : "text-red-500"
                    }`}
                >
                    {feedback.msg}
                </div>
            )}
        </header>
    );
};