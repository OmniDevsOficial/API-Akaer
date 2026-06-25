import { IoMdSearch } from "react-icons/io";
import { X } from "lucide-react";

interface BarraPesquisaProps {
    busca: string;
    onBuscaChange: (value: string) => void;
    onOpenFilters: () => void;
    filtrosAtivos: boolean;
    filtroStatus: string;
    onFiltroStatusChange: (status: string) => void;
    contagens?: Record<string, number>;
}

const filtros = [
    { label: "Todas",      valor: "todas",    dot: null           },
    { label: "Pendentes",  valor: "pendente", dot: "bg-gray-500"  },
    { label: "Aprovadas",  valor: "aprovada", dot: "bg-orange-400"},
    { label: "Concluídas", valor: "concluida",dot: "bg-green-500" },
    { label: "Reprovadas", valor: "reprovada",dot: "bg-red-akaer" },
];

export default function BarraPesquisaSolicitar({
    busca,
    onBuscaChange,
    filtroStatus,
    onFiltroStatusChange,
    contagens = {},
}: BarraPesquisaProps) {
    return (
        <div className="flex flex-col gap-3 my-6">
            {/* Segmented control */}
            <div className="flex items-center gap-1 bg-[#F5F2EE] border border-font-border p-0.5 px-1 rounded-sm overflow-x-auto scrollbar-none">
                <div className="flex items-center gap-0.5 min-w-max w-full">
                    {filtros.map(({ label, valor, dot }) => {
                        const ativo = filtroStatus === valor;
                        const count = contagens[valor];
                        return (
                            <button
                                key={valor}
                                onClick={() => onFiltroStatusChange(valor)}
                                className={`flex items-center gap-1.5 flex-1 justify-center text-sm py-1.5 px-3 rounded-sm cursor-pointer transition-all whitespace-nowrap
                                    ${ativo
                                        ? "bg-white shadow-sm font-semibold text-dark-title"
                                        : "text-dark-title/70 hover:bg-gray-medium/10 hover:text-dark-title"
                                    }`}
                            >
                                {dot && (
                                    <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot} ${ativo ? "opacity-100" : "opacity-60"}`} />
                                )}
                                <span>{label}</span>
                                {count !== undefined && count > 0 && (
                                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none
                                        ${ativo
                                            ? "bg-dark-title/10 text-dark-title"
                                            : "bg-gray-medium/15 text-gray-medium"
                                        }`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Busca */}
            <div className="flex gap-3 items-center border border-font-border rounded-lg py-1.5 px-4 bg-white">
                <IoMdSearch className="text-lg text-gray-medium flex-shrink-0" />
                <input
                    type="text"
                    className="focus:outline-none focus:ring-0 w-full min-w-0 text-sm"
                    placeholder="Buscar por tipo, criador ou cargo..."
                    value={busca}
                    onChange={(e) => onBuscaChange(e.target.value)}
                />
                {busca && (
                    <button onClick={() => onBuscaChange("")} className="text-gray-medium hover:text-dark-title transition-colors flex-shrink-0">
                        <X size={14} />
                    </button>
                )}
            </div>
        </div>
    );
}