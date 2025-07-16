import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <header className="bg-white bg-opacity-90 text-black h-20 px-4 absolute top-0 left-0 w-full z-10 flex items-center">
            <div className="container mx-auto flex justify-between items-center h-full">
                {/* Esquerda: Logo */}
                <Link to="/" className="flex items-center space-x-3">
                    <img src="/logo-brazuka.png" alt="Logo Arena Brazuka" className="h-24 w-auto" />
                   
                </Link>

                {/* Centro: Links */}
                <nav className="flex-1 flex justify-center items-center space-x-6">
                    <Link to="/aulas" className="hover:text-yellow-400">Aulas</Link>
                    <Link to="/eventos" className="hover:text-yellow-400">Eventos</Link>
                    <Link to="/contato" className="hover:text-yellow-400">Contato</Link>
                </nav>

                {/* Direita: Botão */}
                <Link to="/login">
                    <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">
                        ÁREA DO ALUNO
                    </button>
                </Link>
            </div>
        </header>
    )
}

export default Navbar;