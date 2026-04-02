export default function Sidebar() {
    const itemSidebar = [
        { id: 1, nome: 'Normas', icone: '📋', ativo: true },
        /* {id: 2, nome: 'calendário', icone: '📋', ativo: false } */
    ];

    return (

        < div className="flex" >
            <aside className="w-60 bg-white border-r border-font-border p-6">
                <span className="text-gray-medium tracking-wide">PRINCIPAIS</span>

                {itemSidebar.map((item) => (
                    <button key={item.id} className={`flex items-center my-2 gap-2 px-4 py-2  text-left rounded-md w-full shadow-xl font-semibold transition-colors cursor-pointer
                    ${item.ativo ? 'bg-[#73203A] text-white' : 'text-black hover:bg-[#73203a] hover:text-white'}`}>
                        <span>{item.icone}</span>
                        <span>{item.nome}</span>
                    </button>
                ))}

            </aside>
        </div>
    )
}