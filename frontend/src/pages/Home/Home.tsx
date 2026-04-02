import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Header from '../../components/header';
import Sidebar from '../../components/sidebar';
import Barra_pesquisa from '../../components/barra_pes';
import TabelaNormas from '../../components/tabela';
// import modalCadastro from '' é de onde vai vir o modal

export default function Home() {

    const navigate = useNavigate();

    // Usar para sair da plataforma, vai ser colocado no dropdown do perfil
    const handleLogout = async () => {
        localStorage.removeItem("token");
        navigate('/');
    };
    // Funções do modal para abri-lo
    const [modalAberto, setModalAberto] = useState(false);

    return (
        <>
            <div className="min-h-screen bg-[#fbfbfb] flex flex-col font-dm">
                {/* Mais tarde vou colocar essa função dentro do perfil */}
                <button onClick={() => handleLogout()}>Logout</button>
                
                <Header />

                {/* O container que divide a parte de baixo em duas colunas */}
                <div className="flex flex-1">

                    <Sidebar />

                    <main className="flex-1 p-8">
                        <h2 className="text-red-akaer font-bold text-sm tracking-widest mb-2">GERENCIAMENTO</h2>

                        {/* Botão de cadastro de norma */}
                        <div className='flex justify-between items-center'>
                            <h1 className="text-3xl font-dm font-semibold text-dark-title">Normas Aeronáuticas</h1>

                            <button onClick={() => setModalAberto(true)}
                                className='font-semibold text-white text-sm bg-dark-title border border-font-border rounded-md py-3 px-6 cursor-pointer'>
                                + Novo Cadastro
                            </button>

                            {/*Fecha o modal ao clicar no "X" ou botão de cancelar
                               {modalAberto && <modalCadastro onFechar={() => setModalAberto(false)} />} 
                            */}
                        </div>

                        {/* Barra de pesquisa, filtro e ordenar */}
                        <Barra_pesquisa />

                        {/* Tabela de normas */}
                        <TabelaNormas />
                    </main>
                </div>
            </div>
        </>
    )
}