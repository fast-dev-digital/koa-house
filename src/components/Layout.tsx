import { Outlet } from 'react-router-dom';
import Navbar from "./Navbar";
import Footer from './Footer';

function Layout() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                {/* O conteúdo da página específica (Login, Cadastro, etc.) será injetado aqui */}
                <Outlet />
            </main>
            <Footer /> {/* Adiciona o rodapé */}
        </div>
    );
}

export default Layout;