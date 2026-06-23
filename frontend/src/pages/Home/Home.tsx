import { useState } from 'react';
import Sidebar from '../../components/sidebar';
import Barra_pesquisa from '../../components/barra_pes';
import TabelaNormas from '../../components/tabela';
import AddStandardModal from '@/components/add-standard-modal';
import ReportErrorModal from '../Solicitacoes/ReportErrorModal';
import SelectRequestModal, { type TipoSolicitacao } from '../Solicitacoes/SelectRequestModal';
import ModalSolicitacaoNota from '../Solicitacoes/ModalSolicitacaoNota';
import IndicarNormaModal from '../Solicitacoes/IndicarNormaModal';
import { getUserRole } from '../../utils/auth';
import { FilterAside, type FiltrosSelecionados } from '../../components/FilterAside/FilterAside';

export default function Home() {

    const role = getUserRole();
    const isAdmin = role?.toLocaleLowerCase() === 'admin';

    const [modalAberto, setModalAberto] = useState(false);
    const [filtroModalOpen, setFiltroModalOpen] = useState(false);
    const [recarregarTabela, setRecarregarTabela] = useState(0);
    const [buscaNorma, setBuscaNorma] = useState('');
    const [filtrosSelecionados, setFiltrosSelecionados] = useState<FiltrosSelecionados>({});
    const [selectRequestOpen, setSelectRequestOpen] = useState(false);
    const [/* modoSolicitacao */, setModoSolicitacao] = useState(false);
    const [erroModalOpen, setErroModalOpen] = useState(false);
    const [modalSolicitacaoNota, setNotaModalOpen] = useState(false);
    const [indicarNormaOpen, setIndicarNormaOpen] = useState(false);

    const filtrosAtivos = Object.values(filtrosSelecionados).some(
        (v) => Array.isArray(v) && v.length > 0
    );

    const [ordem, setOrdem] = useState<'recentes' | 'antigas' | 'az' | 'za'>('recentes');

    const handleCadastroSucesso = () => {
        setRecarregarTabela((anterior) => anterior + 1);
    };

    const handleSelectTipo = (tipo: TipoSolicitacao) => {
        setSelectRequestOpen(false);

        switch (tipo) {
            case 'indicar_norma':
                setIndicarNormaOpen(true);
                break;
            case 'adicionar_nota':
                setNotaModalOpen(true);
                break;
            case 'reportar_erro':
                setErroModalOpen(true);
                break;
        }
    };

    const handleModalOpenChange = (open: boolean) => {
        setModalAberto(open);
        if (!open) setModoSolicitacao(false);
    };

    return (
        <>
            <div className="flex h-screen w-full overflow-hidden bg-[#fbfbfb] font-dm">
                <Sidebar />

                <div className="flex flex-col flex-1 h-full overflow-hidden">

                    <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-8 pb-20 md:pb-8">
                        {/* Cabeçalho da página */}
                        <h2 className="text-red-akaer font-bold text-xs md:text-sm tracking-widest mb-2">GERENCIAMENTO</h2>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-xl md:text-2xl font-dm font-semibold text-dark-title">Normas Aeronáuticas</h1>
                                <span className="text-xs md:text-sm text-gray-medium">Cadastre, edite e visualize todas as normas da empresa</span>
                            </div>
                            {/* Botão apenas no desktop */}
                            <div className="hidden md:block shrink-0">
                                {isAdmin ? (
                                    <button onClick={() => setModalAberto(true)}
                                        className='flex items-center gap-1.5 font-semibold text-white text-sm bg-dark-title border border-font-border rounded-md py-2.5 px-5 cursor-pointer hover:opacity-90 transition-opacity'>
                                        <span className="text-base leading-none">+</span>Novo Cadastro
                                    </button>
                                ) : (
                                    <button onClick={() => setSelectRequestOpen(true)}
                                        className='flex items-center gap-1.5 font-semibold text-white text-sm bg-dark-title border border-font-border rounded-md py-2.5 px-5 cursor-pointer hover:opacity-90 transition-opacity'>
                                        <span className="text-base leading-none">+</span>Fazer Solicitação
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Barra de busca, filtros e ordenação */}
                        <div className="mt-5 mb-1">
                            <Barra_pesquisa
                                busca={buscaNorma}
                                onBuscaChange={setBuscaNorma}
                                onOpenFilters={() => setFiltroModalOpen(true)}
                                filtrosAtivos={filtrosAtivos}
                                onOrdenar={(novaOrdem) => setOrdem(novaOrdem)}
                                ordemAtual={ordem}
                            />
                        </div>

                        {/* FAB mobile — fixo no canto inferior direito, acima da nav bottom */}
                        <div className="md:hidden">
                            {isAdmin ? (
                                <button onClick={() => setModalAberto(true)}
                                    className='fixed bottom-20 right-5 z-40 flex items-center gap-2 font-semibold text-white text-sm bg-dark-title rounded-full shadow-lg px-5 py-3 cursor-pointer hover:opacity-90 transition-opacity'>
                                    <span className="text-lg leading-none">+</span>Novo Cadastro
                                </button>
                            ) : (
                                <button onClick={() => setSelectRequestOpen(true)}
                                    className='fixed bottom-20 right-5 z-40 flex items-center gap-2 font-semibold text-white text-sm bg-dark-title rounded-full shadow-lg px-5 py-3 cursor-pointer hover:opacity-90 transition-opacity'>
                                    <span className="text-lg leading-none">+</span>Fazer Solicitação
                                </button>
                            )}
                        </div>

                        {/* Modais */}
                        <SelectRequestModal
                            open={selectRequestOpen}
                            onOpenChange={setSelectRequestOpen}
                            onSelect={handleSelectTipo}
                        />
                        <AddStandardModal
                            open={modalAberto}
                            onOpenChange={handleModalOpenChange}
                            onSuccess={handleCadastroSucesso}
                        />
                        <IndicarNormaModal
                            open={indicarNormaOpen}
                            onOpenChange={setIndicarNormaOpen}
                        />
                        <ReportErrorModal
                            open={erroModalOpen}
                            onOpenChange={setErroModalOpen}
                        />
                        <ModalSolicitacaoNota
                            open={modalSolicitacaoNota}
                            onOpenChange={() => setNotaModalOpen(false)}
                            normas={[]}
                        />

                        <FilterAside
                            isOpen={filtroModalOpen}
                            onClose={() => setFiltroModalOpen(false)}
                            onApplyFilters={setFiltrosSelecionados}
                        />

                        <TabelaNormas
                            refreshTrigger={recarregarTabela}
                            searchText={buscaNorma}
                            filtros={filtrosSelecionados}
                            ordem={ordem}
                        />
                    </main>
                </div>
            </div>
        </>
    );
}