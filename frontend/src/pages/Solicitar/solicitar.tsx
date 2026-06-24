import { useState } from 'react';
import Sidebar from '../../components/sidebar';
import BarraPesquisaSolicitar from './components/barra-pes-solicitar';
import TabelaSolicitar from './components/tabela-solicitar';
import { FilterAside, type FiltrosSelecionados } from '../../components/FilterAside/FilterAside';

export default function Solicitar() {
    const [filtroModalOpen, setFiltroModalOpen] = useState(false);
    const [recarregarTabela, /* setRecarregarTabela */] = useState(0);
    const [buscaNorma, setBuscaNorma] = useState('');
    const [filtrosSelecionados, setFiltrosSelecionados] = useState<FiltrosSelecionados>({});
    const [filtroStatus, setFiltroStatus] = useState('todas');
    const [contagens, setContagens] = useState<Record<string, number>>({});

    const filtrosAtivos = Object.values(filtrosSelecionados).some(
        (valor) => Array.isArray(valor) && valor.length > 0
    );

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#fbfbfb] font-dm">
            <Sidebar />

            <div className="flex flex-col flex-1 h-full overflow-hidden">

                <main className="flex-1 p-8 overflow-y-auto">
                    <h2 className="text-red-akaer font-bold text-sm tracking-widest mb-2">GERENCIAMENTO</h2>
                    <h1 className="text-2xl font-dm font-semibold text-dark-title">Solicitações</h1>
                    <p className="text-sm text-gray-medium mt-1">Avalie e gerencie as solicitações enviadas pelos usuários</p>

                    <FilterAside
                        isOpen={filtroModalOpen}
                        onClose={() => setFiltroModalOpen(false)}
                        onApplyFilters={setFiltrosSelecionados}
                    />

                    <BarraPesquisaSolicitar
                        busca={buscaNorma}
                        onBuscaChange={setBuscaNorma}
                        onOpenFilters={() => setFiltroModalOpen(true)}
                        filtrosAtivos={filtrosAtivos}
                        filtroStatus={filtroStatus}
                        onFiltroStatusChange={setFiltroStatus}
                        contagens={contagens}
                    />

                    <TabelaSolicitar
                        refreshTrigger={recarregarTabela}
                        searchText={buscaNorma}
                        filtros={filtrosSelecionados}
                        filtroStatus={filtroStatus}
                        onContagensChange={setContagens}
                    />
                </main>
            </div>
        </div>
    );
}