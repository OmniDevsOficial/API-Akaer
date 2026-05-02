import Header from '../../components/header';
import { HeaderEditar } from '../../components/PasteEditar/headerEditar'
import BodyEditar from '../../components/PasteEditar/bodyEditar'
import Sidebar from '../../components/sidebar';

export default function Editar() {
    const handleApplyCampos = () => {
        // Implementar lógica de aplicar campos
    };

    return (
        <>
            <div className="min-h-screen bg-[#fbfbfb] flex flex-col font-dm">

                <Header />

                <div className="flex flex-1">

                    <Sidebar />

                    <main className="flex-1">
                        <HeaderEditar onApplyCampos={handleApplyCampos} />

                        <BodyEditar />

                    </main>
                </div>
            </div>
        </>
    );
}