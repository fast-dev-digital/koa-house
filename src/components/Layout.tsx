import React from "react";
import { Outlet } from 'react-router-dom';
import Navbar from "./Navbar";

function Layout() {
    return (
        <div>
            <Navbar />
            <main>
                {/* O conteúdo da página específica (Login, Cadastro, etc.) será injetado aqui */}
                <Outlet />
            </main>
            {/* Futuramente, podemos adicionar um Rodapé (Footer) aqui */}
        </div>
    );
}

export default Layout;