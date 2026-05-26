import { useState, useEffect } from "react";
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

    useEffect(() => {
        const buscarUsuario = async () => {
            try {
                // Aqui você coloca a rota real do seu back-end (ex: '/usuarios/me', '/perfil', etc)
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
        <header className="h-16 bg-white border-b border-font-border flex items-center justify-between px-8 w-full">
            <div className="flex gap-6 items-center"></div>

            <div className="flex items-center justify-end gap-2">
                <div className="flex items-center gap-3 border border-font-border rounded-lg cursor-pointer py-1.5 px-3 hover:bg-gray-50 transition-colors">

                    <span className={`w-8 h-8 ${usuario?.corFundo} text-white text-sm font-medium flex items-center justify-center rounded`}>
                        {usuario?.iniciais}
                    </span>

                    <div className="flex flex-col tracking-wider">
                        <span className="text-sm font-semibold leading-tight text-dark-title">{usuario?.nome}</span>
                        <span className="text-[11px] text-gray-medium uppercase tracking-widest">{usuario?.cargo}</span>
                    </div>

                </div>
            </div>
        </header>
    );
}