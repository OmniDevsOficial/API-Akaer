import { useState } from 'react';
import Header from '../../components/header';
import Sidebar from '../../components/sidebar';
import Barra_pesquisa from '../../components/barra_pes';
import TabelaNormas from '../../components/tabela';
import AddStandardModal from '@/components/add-standard-modal';
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

    const handleCadastroSucesso = () => {
        setRecarregarTabela((anterior) => anterior + 1);
    };

    return (
        <>
            <div className="min-h-screen bg-[#fbfbfb] flex flex-col font-dm">

                <Header />

                <div className="flex flex-1">

                    <Sidebar />

                    <main className="flex-1 p-8">
                        <h2 className="text-red-akaer font-bold text-sm tracking-widest mb-2">GERENCIAMENTO</h2>

                        <div className='flex justify-between items-center'>
                            <h1 className="text-3xl font-dm font-semibold text-dark-title">Normas Aeronáuticas</h1>

                            {isAdmin && (
                                <button onClick={() => setModalAberto(true)}
                                    className='font-semibold text-white text-sm bg-dark-title border border-font-border rounded-md py-3 px-6 cursor-pointer'>
                                    + Novo Cadastro
                                </button>
                            )}

                            <AddStandardModal
                                open={modalAberto}
                                onOpenChange={setModalAberto}
                                onSuccess={handleCadastroSucesso}
                            />
                        </div>

                        <Barra_pesquisa
                            busca={buscaNorma}
                            onBuscaChange={setBuscaNorma}
                            onOpenFilters={() => setFiltroModalOpen(true)}
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
                        />
                    </main>
                </div>
            </div>
        </>
    );
}