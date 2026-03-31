export default function Home() {
    return (
        <header className="h-18 bg-white border-b border-font-border flex items-center justify-between px-8">
            {/* Logo e título */}
            <div className="flex gap-6 items-center">
                {/* 
                <img className='w-30' src="./src/assets/icons/akaer-logotipo.png" alt="" />

                // Linha vertical
                <div className="h-6 w-px bg-font-border"></div> 
                */}
                <span className="text-[#9A9390]">Plataforma Normativa</span>
            </div>

            {/* Notificação e Perfil */}
            <div className="flex items-center gap-2">
                <div className="flex border border-font-border rounded-lg p-[10px]">

                    <button className="text-gray-medium hover:text-gray-600 transition-colors">
                        <img className='w-5' src="./src/assets/icons/notificacao.png" alt="" />
                    </button>
                </div>

                <div className="flex gap-2 border border-font-border rounded-lg py-1 px-2">

                    <span className="w-8 h-8 bg-red-akaer text-white text-sm flex items-center justify-center rounded">
                        LG
                    </span>

                    <div className="flex flex-col traking-widest">
                        <span className="text-sm font-semibold leading-tight">Lucas G.</span>
                        <span className="text-xs text-gray-medium">Engenheiro</span>
                    </div>
                </div>
            </div>
        </header>
    )
}