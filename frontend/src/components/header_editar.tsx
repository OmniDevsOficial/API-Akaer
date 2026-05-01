import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

type props = {
    onApplyCampos: (campos: CamposSelecionados) => void;
}

export type CamposSelecionados = {
}
export const HeaderEditar: React.FC<props> = ({ onApplyCampos }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const titulo = location.state?.titulo; // pega o título que veio da tabela

    const aplicarFiltros = () => {
        onApplyCampos({
            /* orgao: orgaoSelecionado,
            categoria: categoriaSelecionada,
            etapa: etapaSelecionada, */
        });
    };

    const limparFiltros = () => {
        /* setOrgaoSelecionado(undefined);
        setCategoriaSelecionada(undefined);
        setEtapaSelecionada(undefined); */
    };

    return (
        <header className="h-16 p-8 bg-white border-b border-font-border flex items-center justify-between">

            {/* Logo e título */}
            <div className="flex gap-4 items-center">
                <button onClick={() => navigate(-1)}
                    className="border border-[#E8E4DF] py-1.5 px-2 rounded-md text-[#6A6460] cursor-pointer"> {'<'} Voltar</button>
                <span className="text-[#B5B0AB]">Normas</span>
                <span>{'>'}</span>
                <span>{titulo}</span>
            </div>

            {/* Botões */}
            <div className="flex items-center gap-2">
                {/* Descartar */}
                <div className="flex text-[#6A6460] border border-font-border rounded-lg cursor-pointer p-2.5">
                    <button onClick={limparFiltros} className="cursor-pointer">Descartar</button>
                </div>
                {/* Confirmar */}
                <div className="flex bg-dark-title text-white font-medium rounded-lg cursor-pointer p-2.5">
                    <button onClick={aplicarFiltros} className="cursor-pointer">Salvar Alterações</button>
                </div>

            </div>
        </header>
    );
}