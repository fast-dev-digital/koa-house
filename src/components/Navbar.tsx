import { useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white bg-opacity-90 text-black h-16 px-2 md:px-4 fixed top-0 left-0 w-full z-10 flex items-center text-sm md:text-base">
      <div className="container mx-auto flex justify-between items-center h-full relative scale-90">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 md:space-x-3">
          <img src="/logo-brazuka.png" alt="Logo Arena Brazuka" className="h-10 md:h-[68px] w-auto" />
        </Link>

        {/* Botão centralizado no mobile */}
        <div className="absolute left-1/2 -translate-x-1/2 flex md:hidden">
          <Link to="/login">
            <button className="bg-yellow-500 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded text-xs w-full">
              ÁREA DO ALUNO
            </button>
          </Link>
        </div>

        {/* Botão de menu (3 pontinhos) - sempre à direita no mobile */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="1.5"/>
            <circle cx="12" cy="12" r="1.5"/>
            <circle cx="12" cy="19" r="1.5"/>
          </svg>
        </button>

        {/* Links */}
        <nav className={`flex-col md:flex-row md:flex items-center space-y-2 md:space-y-0  md:space-x-5 absolute md:static top-16 left-0 w-full md:w-auto bg-white md:bg-transparent  transition-all duration-200 ease-in ${menuOpen ? 'flex' : 'hidden md:flex'}`}>
          <Link to="/sobrenos" className="hover:text-yellow-400 px-4 py-2 md:p-0">Sobre Nós</Link>
          <Link to="/eventos" className="hover:text-yellow-400 px-4 py-2 md:p-0">Eventos</Link>
          <Link to="/professores" className="hover:text-yellow-400 px-4 py-2 md:p-0">Professores</Link>
          <Link to="/aulas" className="hover:text-yellow-400 px-4 py-2 md:p-0">Aulas</Link>
          <Link to="/contato" className="hover:text-yellow-400 px-4 py-2 md:p-0">Contato</Link>
        </nav>

        {/* Botão à direita no desktop */}
        <div className="hidden md:flex md:ml-4">
          <Link to="/login">
            <button className="bg-yellow-500 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded text-sm w-full md:w-auto">
              ÁREA DO ALUNO
            </button>
          </Link>
        </div>
      </div>  
    </header>
  );
}

export default Navbar;