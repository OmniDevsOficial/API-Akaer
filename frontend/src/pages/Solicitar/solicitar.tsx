import { useState } from 'react';
import Header from '../../components/header';
import Sidebar from '../../components/sidebar';
import BarraPesquisaSolicitar from './components/barra-pes-solicitar';
import TabelaSolicitar from './components/tabela-solicitar';
import { FilterAside, type FiltrosSelecionados } from '../../components/FilterAside/FilterAside';

const status = [
    { label: 'Pendentes', cor: 'bg-gray-500' },
    { label: 'Aprovadas', cor: 'bg-orange-400' },
    { label: 'Concluídas', cor: 'bg-green-500' },
    { label: 'Reprovadas', cor: 'bg-red-akaer' },
];

export default function Solicitar() {
    const [filtroModalOpen, setFiltroModalOpen] = useState(false);
    const [recarregarTabela, /* setRecarregarTabela */] = useState(0);
    const [buscaNorma, setBuscaNorma] = useState('');
    const [filtrosSelecionados, setFiltrosSelecionados] = useState<FiltrosSelecionados>({});
    const [filtroStatus, setFiltroStatus] = useState('todas');

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

                    <div className="text-sm text-gray-medium flex justify-between gap-3 ">
                        <span>Avalie e gerencie as solicitações enviadas pelos usuários</span>

                        <div className="flex gap-4 items-center">
                            {status.map(({ label, cor }, index) => (
                                <div key={label} className="flex items-center gap-1.5">
                                    {index > 0 && (
                                        <div className='w-[1.3px] h-4 bg-gray-medium/80' />
                                    )}

                                    <span className={`inline-block w-2 h-2 rounded-full ${cor}`} />
                                    <span className='leading-none'>{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

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
                    />

                    <TabelaSolicitar
                        refreshTrigger={recarregarTabela}
                        searchText={buscaNorma}
                        filtros={filtrosSelecionados}
                        filtroStatus={filtroStatus}
                    />
                </main>
            </div>
        </div>
    );
}