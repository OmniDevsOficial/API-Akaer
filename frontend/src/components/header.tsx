import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { handleLogout } from '../utils/auth';
import { LuLogOut, LuLayers } from "react-icons/lu";
import { FiUser } from "react-icons/fi";
import api from "@/services/api";

interface UsuarioAPI {
    nome: string;
    iniciais: string;
    role: string;
    cargo: string;
    corFundo: string;
}

export default function Header() {
    const [usuario, setUsuario] = useState<UsuarioAPI | null>(null);
    const [menuAberto, setMenuAberto] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const executarLogout = () => {
        handleLogout();
        navigate('/');
    }

    /* useEffect para fechar o modal do perfil ao clicar fora */
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Se o menu estiver aberto E o clique foi fora da div rastreada pelo ref, fecha o menu
            if (menuAberto && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setMenuAberto(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuAberto]);

    useEffect(() => {
        const buscarUsuario = async () => {
            try {
                // Aqui coloca a rota real do back-end (ex: '/usuarios/me')
                const response = await api.get('/usuario');

                const dados = response.data;

                setUsuario({
                    nome: dados.nome || 'Carlos',
                    iniciais: dados.iniciais || dados.nome.substring(0, 2).toUpperCase(),
                    role: dados.role || 'Admin',
                    cargo: dados.cargo || 'Cargo não definido',
                    corFundo: dados.corFundo || 'bg-[#73203A]'
                });

            } catch (error) {
                console.error("Erro ao buscar dados do usuário na API:", error);
            }
        };

        buscarUsuario();
    }, []); // O array vazio garante que a API só seja chamada 1 vez quando o Header aparecer

    // Loading enquanto o request da API não termina
    // Ativar apenas quando estiver recebendo os dados corretamente do backend
    /* if (!usuario) {  
        return (
            <header className="h-16 bg-white border-b border-font-border flex items-center justify-between px-8 w-full">
                <div className="flex gap-6 items-center"></div>
                <div className="flex items-center justify-end gap-2">
                    <span className="text-gray-400 text-sm font-semibold animate-pulse">
                        Carregando perfil...
                    </span>
                </div>
            </header>
        );
    } */

    return (
        <header className="h-16 bg-white border-b border-font-border flex items-center justify-between px-8 w-full z-10 relative">

            <div className="flex gap-6 items-center">
            </div>

            <div className="flex items-center justify-end gap-2">

                <div className="relative" ref={dropdownRef}>

                    <button
                        onClick={() => setMenuAberto(!menuAberto)}
                        className="flex items-center gap-3 border border-font-border rounded-lg cursor-pointer py-1.5 px-3 hover:bg-gray-50 transition-colors focus:outline-none"
                    >
                        <span className={`w-8 h-8 ${usuario?.corFundo} text-white text-sm font-medium flex items-center justify-center rounded`}>
                            {usuario?.iniciais}
                        </span>

                        <div className="flex flex-col text-left tracking-wider leading-none">
                            <span className="text-sm font-semibold leading-tight text-dark-title">{usuario?.nome}</span>
                            <span className="text-[11px] text-gray-medium uppercase tracking-widest mt-0.5">{usuario?.cargo}</span>
                        </div>
                    </button>

                    {/* Menu Dropdown */}
                    {menuAberto && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-font-border rounded-lg shadow-lg z-50 flex flex-col p-1 animate-fade-in">

                            {/* Botão de Perfil */}
                            <button
                                onClick={() => {
                                    setMenuAberto(false); // Fecha o menu ao clicar
                                    navigate('/home'); // Mudar para rota de perfil real
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-left text-sm rounded-md w-full font-medium text-dark-title hover:bg-gray-100 transition-colors"
                            >
                                <span className="flex-shrink-0 flex items-center justify-center">
                                    <FiUser className="text-sm" />
                                </span>
                                <span>Meu Perfil</span>
                            </button>

                            {/* Linha divisória */}
                            <div className="h-px bg-font-border my-1 mx-2" />

                            {/* Botão de Sair */}
                            <button
                                onClick={executarLogout}
                                className="flex items-center gap-2 px-3 py-2 text-left text-sm rounded-md w-full font-medium text-red-akaer hover:bg-red-50 transition-colors"
                            >
                                <span className="flex-shrink-0 flex items-center justify-center">
                                    <LuLogOut className="text-sm" />
                                </span>
                                <span>Sair</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}