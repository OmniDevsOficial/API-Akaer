import { IoMdSearch } from "react-icons/io";

interface BarraPesquisaProps {
    busca: string;
    onBuscaChange: (value: string) => void;
    onOpenFilters: () => void;
    filtrosAtivos: boolean;
    filtroStatus: string;
    onFiltroStatusChange: (status: string) => void;
}

const filtros = [
    { label: "Todas",      valor: "todas"     },
    { label: "Pendentes",  valor: "pendente"  },
    { label: "Aprovadas",  valor: "aprovada"  },
    { label: "Concluídas", valor: "concluida" },
    { label: "Reprovadas", valor: "reprovada" },
];

export default function BarraPesquisaSolicitar({
    busca,
    onBuscaChange,
    filtroStatus,
    onFiltroStatusChange,
}: BarraPesquisaProps) {
    return (
        <div className="flex items-center gap-4 my-6">
            <div className="flex items-center gap-1 bg-[#F5F2EE] border border-font-border p-0.5 px-1 rounded-sm">
                {filtros.map(({ label, valor }) => (
                    <button
                        key={valor}
                        onClick={() => onFiltroStatusChange(valor)}
                        className={`text-dark-title/95 p-1 px-2 rounded-sm cursor-pointer transition-colors
                            ${filtroStatus === valor
                                ? "bg-white shadow-sm font-semibold"
                                : "hover:bg-gray-medium/15"
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="flex flex-1 gap-4 items-center border border-font-border rounded-lg py-1.5 px-4">
                <IoMdSearch className="text-lg text-gray-medium" />
                <input
                    type="text"
                    className="focus:outline-none focus:ring-0 w-full"
                    placeholder="Buscar Normas, códigos ou palavra-chave..."
                    value={busca}
                    onChange={(e) => onBuscaChange(e.target.value)}
                />
            </div>
        </div>
    );
}