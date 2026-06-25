import { useState } from 'react';
import { getUserRole } from '../../utils/auth';
import { type FiltrosLabels, FilterAside, type FiltrosSelecionados } from '../../components/FilterAside/FilterAside';
import SelectRequestModal, { type TipoSolicitacao } from '../Solicitacoes/SelectRequestModal';
import Sidebar from '../../components/sidebar';
import Barra_pesquisa from '../../components/barra_pes';
import TabelaNormas from '../../components/tabela';
import AddStandardModal from '@/components/add-standard-modal';
import ReportErrorModal from '../Solicitacoes/ReportErrorModal';
import ModalSolicitacaoNota from '../Solicitacoes/ModalSolicitacaoNota';
import IndicarNormaModal from '../Solicitacoes/IndicarNormaModal';

export default function Home() {

    const role = getUserRole();
    const isAdmin = role?.toLocaleLowerCase() === 'admin';

    const [modalAberto, setModalAberto] = useState(false);
    const [filtroModalOpen, setFiltroModalOpen] = useState(false);
    const [recarregarTabela, setRecarregarTabela] = useState(0);
    const [buscaNorma, setBuscaNorma] = useState('');
    const [filtrosSelecionados, setFiltrosSelecionados] = useState<FiltrosSelecionados>({});
    const [selectRequestOpen, setSelectRequestOpen] = useState(false);
    const [, setModoSolicitacao] = useState(false);
    const [erroModalOpen, setErroModalOpen] = useState(false);
    const [modalSolicitacaoNota, setNotaModalOpen] = useState(false);
    const [indicarNormaOpen, setIndicarNormaOpen] = useState(false);
    const [ordem, setOrdem] = useState<'recentes' | 'antigas' | 'az' | 'za'>('recentes');
    const [filtrosLabels, setFiltrosLabels] = useState<FiltrosLabels>({});

    const filtrosAtivos = Object.values(filtrosSelecionados).some(
        (v) => Array.isArray(v) && v.length > 0
    );

    const handleCadastroSucesso = () => setRecarregarTabela((prev) => prev + 1);

    const handleSelectTipo = (tipo: TipoSolicitacao) => {
        setSelectRequestOpen(false);
        if (tipo === 'indicar_norma') setIndicarNormaOpen(true);
        if (tipo === 'adicionar_nota') setNotaModalOpen(true);
        if (tipo === 'reportar_erro') setErroModalOpen(true);
    };

    const handleModalOpenChange = (open: boolean) => {
        setModalAberto(open);
        if (!open) setModoSolicitacao(false);
    };

    const botaoAcao = isAdmin ? (
        <button
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-1.5 font-semibold text-white text-sm bg-dark-title border border-font-border rounded-md py-2.5 px-5 cursor-pointer hover:opacity-90 transition-opacity"
        >
            <span className="text-base leading-none">+</span> Novo Cadastro
        </button>
    ) : (
        <button
            onClick={() => setSelectRequestOpen(true)}
            className="flex items-center gap-1.5 font-semibold text-white text-sm bg-dark-title border border-font-border rounded-md py-2.5 px-5 cursor-pointer hover:opacity-90 transition-opacity"
        >
            <span className="text-base leading-none">+</span> Fazer Solicitação
        </button>
    );
    const handleApplyFilters = (filtros: FiltrosSelecionados, labels: FiltrosLabels) => {
        setFiltrosSelecionados(filtros);
        setFiltrosLabels(labels);
    };

    const handleRemoverFiltro = (grupo: keyof FiltrosLabels, id: number | string) => {
        // Remove a label
        setFiltrosLabels(prev => ({
            ...prev,
            [grupo]: prev[grupo]?.filter(item => item.id !== id)
        }));

        // Remove o ID real do filtro
        setFiltrosSelecionados(prev => ({
            ...prev,
            [grupo]: (prev[grupo] as any[])?.filter((v: any) => v !== id)
        }));
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#fbfbfb] font-dm">
            <Sidebar />

            <div className="flex flex-col flex-1 h-full overflow-hidden">
                <main className="flex-1 p-8 overflow-y-auto">
                    <div className="sticky top-0 z-10 bg-[#fbfbfb] px-4 md:px-0 py-4 md:py-0">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-red-akaer font-bold text-[10px] md:text-xs tracking-widest mb-0.5">GERENCIAMENTO</p>
                                <h1 className="text-lg md:text-2xl font-semibold text-dark-title leading-tight">Normas Aeronáuticas</h1>
                                <p className="hidden md:block text-sm text-gray-medium mt-0.5">Cadastre, edite e visualize todas as normas da empresa</p>
                            </div>
                            <div className="hidden md:block shrink-0">
                                {botaoAcao}
                            </div>
                        </div>

                        <Barra_pesquisa
                            busca={buscaNorma}
                            onBuscaChange={setBuscaNorma}
                            onOpenFilters={() => setFiltroModalOpen(true)}
                            filtrosAtivos={filtrosAtivos}
                            onOrdenar={(novaOrdem) => setOrdem(novaOrdem)}
                            ordemAtual={ordem}
                            filtrosLabels={filtrosLabels}
                            onRemoverFiltro={handleRemoverFiltro}
                        />
                    </div>

                    {/* Tabela — fora do sticky */}
                    <div className="px-4 md:px-0 py-4 pb-24 md:pb-8">
                        <TabelaNormas
                            refreshTrigger={recarregarTabela}
                            searchText={buscaNorma}
                            filtros={filtrosSelecionados}
                            ordem={ordem}
                        />
                    </div>

                    {/* FAB mobile */}
                    <div className="md:hidden fixed bottom-20 right-4 z-40">
                        {botaoAcao}
                    </div>
                </main>
            </div>

            <FilterAside
                isOpen={filtroModalOpen}
                onClose={() => setFiltroModalOpen(false)}
                onApplyFilters={handleApplyFilters}
                filtrosAtuais={filtrosSelecionados}
            />
            <SelectRequestModal open={selectRequestOpen} onOpenChange={setSelectRequestOpen} onSelect={handleSelectTipo} />
            <AddStandardModal open={modalAberto} onOpenChange={handleModalOpenChange} onSuccess={handleCadastroSucesso} />
            <IndicarNormaModal open={indicarNormaOpen} onOpenChange={setIndicarNormaOpen} />
            <ReportErrorModal open={erroModalOpen} onOpenChange={setErroModalOpen} />
            <ModalSolicitacaoNota open={modalSolicitacaoNota} onOpenChange={() => setNotaModalOpen(false)} normas={[]} />
        </div>
    );
}