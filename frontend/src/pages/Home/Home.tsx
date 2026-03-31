import { useNavigate } from 'react-router-dom';
import Header from '../../components/header';
import Sidebar from '../../components/sidebar';
import Footer from '../../components/footer';
/* Import Filtros from '../../components/filtros' */

export default function Home() {

    const navigate = useNavigate();

    // Usar para sair da plataforma, vai ser colocado no dropdown do perfil
    const handleLogout = async () => {
        localStorage.removeItem("token");
        navigate('/');
    };

    return (
        <>
            <div className="min-h-screen bg-[#fbfbfb] flex flex-col font-dm">
                {/* A sua peça do cabeçalho */}
                <Header />

                {/* O container que divide a parte de baixo em duas colunas */}
                <div className="flex flex-1">

                    <Sidebar />

                    <main className="flex-1 p-8">
                        {/* Mais pra frente, os componentes da tabela entram aqui */}
                        <h2 className="text-red-akaer font-bold text-sm tracking-widest mb-2">GERENCIAMENTO</h2>

                        {/* Botão de cadastro de norma */}
                        <div className='flex justify-between items-center'>
                            <h1 className="text-3xl font-dm font-semibold text-dark-title">Normas Aeronáuticas</h1>

                            <button className='text-white text-sm bg-dark-title border border-font-border rounded-md py-3 px-6 cursor-pointer'>
                                + Novo Cadastro
                            </button>
                        </div>

                        {/* Barra de pesquisa, filtro e ordenar */}
                        <div className='flex justify-between gap-4'>
                            <div>

                            </div>

                            {/* Filtros e Ordenação */}
                            <div>

                            </div>

                        </div>
                        
                        {/* Tabela de normas */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center text-gray-500">
                            A nossa tabela gigante vai entrar bem aqui!
                        </div>

                    </main>

                </div>
                <Footer />
            </div>
        </>
    )
}