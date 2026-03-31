export default function Sidebar() {
    return (
        <div className="flex">
            <aside className="w-64 bg-white border-r border-font-border p-6">
                <span className="text-[#B5B0AB] tracking-wide">PRINCIPAIS</span>
                <button className="flex items-center my-2 gap-2 px-4 py-2 bg-[#73203A] text-white text-left rounded-md w-full shadow-xl font-semibold">
                    <span>📋</span>
                    <span>Normas</span>
                </button>
            </aside>
        </div>
    )
}