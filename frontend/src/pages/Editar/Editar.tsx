import { useRef } from 'react';
/* import Header from '../../components/header'; */
import { HeaderEditar } from './components/headerEditar';
import BodyEditar, { type BodyEditarHandle } from './components/bodyEditar';
import Sidebar from '../../components/sidebar';

export default function Editar() {
    const bodyRef = useRef<BodyEditarHandle>(null);

    const handleSalvar = async () => {
        await bodyRef.current?.salvar();
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#fbfbfb] font-dm">
            <Sidebar />

            <main className="flex flex-col flex-1 overflow-hidden">
                <HeaderEditar onSalvar={handleSalvar} />

                <div className='flex-1 overflow-y-auto'>
                    <BodyEditar ref={bodyRef} />
                </div>
            </main>
        </div>
    );
}