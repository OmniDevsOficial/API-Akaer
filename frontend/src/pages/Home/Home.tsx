import { useNavigate } from 'react-router-dom';
import Header from '../../components/header';
import Sidebar from '../../components/sidebar';
import Barra_pesquisa from '../../components/barra_pes';
import Footer from '../../components/footer';

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
                <Header />

                {/* O container que divide a parte de baixo em duas colunas */}
                <div className="flex flex-1">

                    <Sidebar />

                    <main className="flex-1 p-8">
                        <h2 className="text-red-akaer font-bold text-sm tracking-widest mb-2">GERENCIAMENTO</h2>

                        {/* Botão de cadastro de norma */}
                        <div className='flex justify-between items-center'>
                            <h1 className="text-3xl font-dm font-semibold text-dark-title">Normas Aeronáuticas</h1>

                            <button className='font-semibold text-white text-sm bg-dark-title border border-font-border rounded-md py-3 px-6 cursor-pointer'>
                                + Novo Cadastro
                            </button>
                        </div>

                        {/* Barra de pesquisa, filtro e ordenar */}
                        <Barra_pesquisa />

                        {/* Tabela de normas */}
                        <div className="border-2 border-[0.5px] border-font-border rounded-lg p-10 text-center text-gray-medium">

                            A nossa tabela gigante vai entrar bem aqui!
                        </div>
                    </main>
                </div>
                {/* <Footer /> */}
            </div>
        </>
    )
}