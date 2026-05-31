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

                    <main className="flex-1 min-h-0 overflow-y-auto p-8">
                        <h2 className="text-red-akaer font-bold text-sm tracking-widest mb-2">GERENCIAMENTO</h2>

                        <div className='flex justify-between items-center'>
                            <div>
                                <h1 className="text-2xl font-dm font-semibold text-dark-title">Normas Aeronáuticas</h1>
                                <span className="text-sm text-gray-medium flex justify-between gap-3 ">Cadastre, edite e visualize todas as normas da empresa</span>
                            </div>

                            {isAdmin ? (
                                <button onClick={() => setModalAberto(true)}
                                    className='font-semibold text-white text-sm bg-dark-title border border-font-border rounded-md py-3 px-6 cursor-pointer'>
                                    <span className='mr-2'>+</span>Novo Cadastro
                                </button>
                            ) : (
                                <button onClick={() => setSelectRequestOpen(true)}
                                    className='font-semibold text-white text-sm bg-dark-title border border-font-border rounded-md py-3 px-6 cursor-pointer'>
                                    <span className='mr-2'>+</span>Fazer Solicitação
                                </button>
                            )}

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
                        </div>

                        <Barra_pesquisa
                            busca={buscaNorma}
                            onBuscaChange={setBuscaNorma}
                            onOpenFilters={() => setFiltroModalOpen(true)}
                            filtrosAtivos={filtrosAtivos}
                            onOrdenar={(novaOrdem) => setOrdem(novaOrdem)}
                            ordemAtual={ordem}
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