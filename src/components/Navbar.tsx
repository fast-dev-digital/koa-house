import { useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white text-black h-16 px-2 md:px-4 fixed top-0 left-0 w-full z-10 flex items-center text-sm md:text-base">
      <div className="container mx-auto flex justify-between items-center h-full relative scale-90">
        
        {/* --- LÓGICA DESKTOP --- */}
        <div className="hidden md:flex w-full items-center">
          {/* Coluna Esquerda: Logo */}
          <div className="w-1/4"> {/* Definimos um espaço para o logo */}
            <Link to="/" className="flex items-center space-x-2 md:space-x-3">
              <img src="/logo-brazuka.png" alt="Logo Arena Brazuka" className="h-10 md:h-[68px] w-auto" />
            </Link>
          </div>

          {/* Coluna Central: Navegação (cresce para ocupar o espaço) */}
          <div className="flex-grow">
            <nav className="flex justify-center items-center space-x-5">
              <Link to="/sobre-nos" className="hover:text-yellow-400">Sobre Nós</Link>
              <Link to="/eventos" className="hover:text-yellow-400">Eventos</Link>
              <Link to="/professores" className="hover:text-yellow-400">Professores</Link>
              <Link to="/planos" className="hover:text-yellow-400">Planos</Link>
            </nav>
          </div>
          
          {/* Coluna Direita: Botões */}
          <div className="w-1/4 flex justify-end items-center space-x-2">
            <Link to="/login">
              <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded text-sm whitespace-nowrap">
                ÁREA DO ALUNO
              </button>
            </Link>
            <Link to="/login">
              
              <button className="border border-yellow-500 bg-white text-yellow-500 py-1.5 px-4 rounded hover:bg-yellow-100">
                
                ACESSO RESTRITO
              </button>
            </Link>
          </div>
        </div>


        {/* --- LÓGICA MOBILE (permanece a mesma) --- */}
        <div className="md:hidden flex w-full justify-between items-center">
            {/* Logo Mobile */}
            <Link to="/" className="flex items-center space-x-2">
                <img src="/logo-brazuka.png" alt="Logo Arena Brazuka" className="h-10 w-auto" />
            </Link>

            {/* Botão centralizado no mobile */}
            <div className="flex">
                <Link to="/login">
                    <button className="bg-yellow-500 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded text-xs">
                    ÁREA DO ALUNO
                    </button>
                </Link>
            </div>

            {/* Botão de menu (3 pontinhos) */}
            <button
                className="p-2"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Abrir menu"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="5" r="1.5"/>
                    <circle cx="12" cy="12" r="1.5"/>
                    <circle cx="12" cy="19" r="1.5"/>
                </svg>
            </button>
        </div>
        
        {/* Menu Dropdown Mobile */}
        <nav className={`md:hidden flex-col absolute top-16 left-0 w-full bg-white shadow-lg transition-all duration-300 ease-in-out ${menuOpen ? 'flex' : 'hidden'}`}>
            <Link to="/sobre-nos" className="hover:bg-gray-100 px-4 py-2" onClick={() => setMenuOpen(false)}>Sobre Nós</Link>
            <Link to="/eventos" className="hover:bg-gray-100 px-4 py-2" onClick={() => setMenuOpen(false)}>Eventos</Link>
            <Link to="/professores" className="hover:bg-gray-100 px-4 py-2" onClick={() => setMenuOpen(false)}>Professores</Link>
            <Link to="/planos" className="hover:bg-gray-100 px-4 py-2" onClick={() => setMenuOpen(false)}>Planos</Link>
          
            {/* Adicionamos o botão de admin aqui também para consistência */}
            <div className='p-4'>
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                    <button className="border border-yellow-500 bg-white text-yellow-500 py-1.5 px-4 rounded hover:bg-yellow-100 w-full">
                        ACESSO RESTRITO
                    </button>
                </Link>
            </div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;