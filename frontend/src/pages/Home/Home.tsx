import { useNavigate } from 'react-router-dom';
import Header from '../../components/header';
import Sidebar from '../../components/sidebar';
/* Import Filtros from '../../components/filtros' */

export default function Home() {

    const navigate = useNavigate();

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
                        <h1 className="text-3xl font-inter text-dark-title">Normas Aeronáuticas</h1>
                    </main>

                </div>
            </div>
            <br />
            <button onClick={() => handleLogout()}>Logout</button>
        </>
    )
}