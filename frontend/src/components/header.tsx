import { useState, useEffect } from "react";

interface UsuarioAPI {
    nome: string;
    cargo: string;
    iniciais: string;
    corFundo: string;
}

export default function Home() {
    const [usuario, setUsuario] = useState<UsuarioAPI | null>(null);

    useEffect(() => {
        // Futuramente: conectar ao back-end
        // fetch('http://localhost:3000/usuario')
        //   .then(res => res.json())
        //   .then(dados => setUsuario(dados));

        // 🧪 Mock temporário enquanto não ativa o fetch
        setTimeout(() => {
            setUsuario({
                nome: 'Lucas G.',
                cargo: 'Engenheiro',
                iniciais: 'LG',
                corFundo: 'bg-red-akaer',
            });
        },);
    }, []);

    // função ativada quando não há recebimento dos dados do usuário vindo da API
    if (!usuario) {
        return (
            <div className="min-h-screen bg-[#fbfbfb] flex items-center justify-center font-sans">
                <span className="text-gray-500 text-lg font-semibold animate-pulse">
                    Buscando dados no servidor...
                </span>
            </div>
        );
    }

    return (
        <header className="h-16 bg-white border-b border-font-border flex items-center justify-between px-8">

            {/* Logo e título */}
            <div className="flex gap-6 items-center">
                <span className="text-[#9A9390]">Plataforma Normativa</span>
            </div>

            {/* Notificação e Perfil */}
            <div className="flex items-center gap-2">
                <div className="flex border border-font-border rounded-lg cursor-pointer p-2.5">
                    <img className='w-5' src="./src/assets/icons/notificacao.png" alt="" />
                </div>

                <div className="flex items-center gap-2 border border-font-border rounded-lg cursor-pointer py-1 px-2">
                    <span className={`w-8 h-8 ${usuario.corFundo} text-white text-sm font-medium flex items-center justify-center rounded`}>
                        {usuario.iniciais}
                    </span>

                    <div className="flex flex-col tracking-wider">
                        <span className="text-sm font-semibold leading-tight">{usuario.nome}</span>
                        <span className="text-xs text-gray-medium">{usuario.cargo}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}