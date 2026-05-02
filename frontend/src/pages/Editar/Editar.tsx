import { useState } from 'react';
import Header from '../../components/header';
import { HeaderEditar } from '../../components/PasteEditar/headerEditar'
import BodyEditar from '../../components/PasteEditar/bodyEditar'
import Sidebar from '../../components/sidebar';
import { getUserRole } from '../../utils/auth';

export default function Editar() {

    const role = getUserRole();
    const isAdmin = role?.toLocaleLowerCase() === 'admin';
    return (
        <>
            <div className="min-h-screen bg-[#fbfbfb] flex flex-col font-dm">

                <Header />

                <div className="flex flex-1">

                    <Sidebar />

                    <main className="flex-1">
                        <HeaderEditar />

                        <BodyEditar />

                    </main>
                </div>
            </div>
        </>
    );
}