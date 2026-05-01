import { useState } from 'react';
import Header from '../../components/header';
import { HeaderEditar } from '../../components/header_editar'
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

                        <h2 className="text-red-akaer font-bold text-sm tracking-widest mb-2">GERENCIAMENTO</h2>


                    </main>
                </div>
            </div>
        </>
    );
}