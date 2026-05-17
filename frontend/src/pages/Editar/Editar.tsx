import { useRef } from 'react';
import Header from '../../components/header';
import { HeaderEditar } from './components/headerEditar';
import BodyEditar, { type BodyEditarHandle } from './components/bodyEditar';
import Sidebar from '../../components/sidebar';

export default function Editar() {
    const bodyRef = useRef<BodyEditarHandle>(null);

    const handleSalvar = async () => {
        await bodyRef.current?.salvar();
    };

    return (
        <div className="min-h-screen bg-[#fbfbfb] flex flex-col font-dm">
            <Header />

            <div className="flex flex-1">
                <Sidebar />

                <main className="flex-1">
                    <HeaderEditar onSalvar={handleSalvar} />
                    <BodyEditar ref={bodyRef} />
                </main>
            </div>
        </div>
    );
}