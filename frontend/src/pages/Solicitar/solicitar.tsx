import { useState } from 'react';
import Header from '../../components/header';
import Sidebar from '../../components/sidebar';
import Barra_pesquisa from '../../components/barra_pes';
import TabelaNormas from '../../components/tabela';
import AddStandardModal from '@/components/add-standard-modal';
import ReportErrorModal from '../../components/report-error-modal';
import SelectRequestModal, { type TipoSolicitacao } from '../../components/Solicitacoes/Selectrequestmodal';
import { ModalSolicitacaoNota } from '@/components/Solicitacoes/modalSolicitacaoNota';
import { getUserRole } from '../../utils/auth';
import { FilterAside, type FiltrosSelecionados } from '../../components/FilterAside/FilterAside';

export default function Solicitar() {

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

    const filtrosAtivos = Object.values(filtrosSelecionados).some(
        (v) => Array.isArray(v) && v.length > 0
    );

    const handleCadastroSucesso = () => {
        setRecarregarTabela((anterior) => anterior + 1);
    };

    const handleSelectTipo = (tipo: TipoSolicitacao) => {
        setSelectRequestOpen(false);

        switch (tipo) {
            case 'indicar_norma':
                setModoSolicitacao(true);
                setModalAberto(true);
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
            <div className="min-h-screen bg-[#fbfbfb] flex flex-col font-dm">

                <Header />

                <div className="flex flex-1">

                    <Sidebar />

                    <main className="flex-1 p-8">
                        <h2 className="text-red-akaer font-bold text-sm tracking-widest mb-2">GERENCIAMENTO</h2>

                        

                        <Barra_pesquisa
                            busca={buscaNorma}
                            onBuscaChange={setBuscaNorma}
                            onOpenFilters={() => setFiltroModalOpen(true)}
                            filtrosAtivos={filtrosAtivos}
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