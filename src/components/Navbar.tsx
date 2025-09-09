import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`text-black h-16 px-2 md:px-4 fixed top-0 left-0 w-full z-50 flex items-center text-sm md:text-base transition-all duration-300 ${
        scrolled 
          ? 'backdrop-blur-md bg-white/80 shadow-lg border-b border-white/20' 
          : 'backdrop-blur-sm bg-white/60'
      }`}
    >
      <div className="container mx-auto flex justify-between items-center h-full relative scale-90">
        
        {/* --- LÓGICA DESKTOP --- */}
        <div className="hidden md:flex w-full items-center">
          {/* Coluna Esquerda: Logo */}
          <div className="w-1/4"> {/* Definimos um espaço para o logo */}
            <Link to="/" className="flex items-center space-x-2 md:space-x-3">
              <img src="/logo-brazuka.png" alt="Logo Arena Brazuka" className="h-8 md:h-[50px] w-auto" />
            </Link>
          </div>

          {/* Coluna Central: Navegação (cresce para ocupar o espaço) */}
          <div className="flex-grow">
            <nav className="flex justify-center items-center space-x-8">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/sobre-nos" className="relative group font-medium transition-colors duration-300 hover:text-yellow-600">
                  Sobre Nós
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/eventos" className="relative group font-medium transition-colors duration-300 hover:text-yellow-600">
                  Eventos
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/professores" className="relative group font-medium transition-colors duration-300 hover:text-yellow-600">
                  Professores
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/planos" className="relative group font-medium transition-colors duration-300 hover:text-yellow-600">
                  Planos
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </motion.div>
            </nav>
          </div>
          
          {/* Coluna Direita: Botões */}
          <div className="w-1/4 flex justify-end items-center space-x-3">
            <Link to="/login">
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-koa-beige to-koa-brown hover:from-koa-brown hover:to-koa-brown text-white font-bold py-2.5 px-5 rounded-lg text-sm whitespace-nowrap shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
              >
                ÁREA DO ALUNO
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`border-2 border-koa-brown backdrop-blur-sm text-koa-brown py-2.5 px-4 rounded-lg hover:bg-yellow-50 hover:border-yellow-600 font-bold text-sm whitespace-nowrap shadow-lg hover:shadow-xl transition-all duration-300 ${
                  scrolled ? 'bg-transparent' : 'bg-transparent'
                }`}
              >
                ACESSO RESTRITO
              </motion.button>
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
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-2 px-4 rounded-lg text-xs shadow-lg transition-all duration-300"
                    >
                        ÁREA DO ALUNO
                    </motion.button>
                </Link>
            </div>

            {/* Botão de menu (3 pontinhos) */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg hover:bg-yellow-100 transition-colors duration-200"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Abrir menu"
            >
                <motion.svg 
                    className="w-6 h-6" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    animate={{ rotate: menuOpen ? 90 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <circle cx="12" cy="5" r="1.5"/>
                    <circle cx="12" cy="12" r="1.5"/>
                    <circle cx="12" cy="19" r="1.5"/>
                </motion.svg>
            </motion.button>
        </div>
        
        {/* Menu Dropdown Mobile */}
        <motion.nav 
            initial={{ opacity: 0, y: -20 }}
            animate={{ 
                opacity: menuOpen ? 1 : 0, 
                y: menuOpen ? 0 : -20,
                display: menuOpen ? 'flex' : 'none'
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="md:hidden flex-col absolute top-20 left-0 w-full backdrop-blur-md bg-white/90 shadow-xl border-b border-white/20 z-40"
        >
            <motion.div whileHover={{ x: 10 }} transition={{ duration: 0.2 }}>
                <Link to="/sobre-nos" className="block hover:bg-yellow-50 px-6 py-4 font-medium transition-colors duration-200 border-b border-gray-100 focus:outline-none focus:bg-yellow-50 active:bg-yellow-100 text-center" onClick={() => setMenuOpen(false)}>Sobre Nós</Link>
            </motion.div>
            <motion.div whileHover={{ x: 10 }} transition={{ duration: 0.2 }}>
                <Link to="/eventos" className="block hover:bg-yellow-50 px-6 py-4 font-medium transition-colors duration-200 border-b border-gray-100 focus:outline-none focus:bg-yellow-50 active:bg-yellow-100 text-center" onClick={() => setMenuOpen(false)}>Eventos</Link>
            </motion.div>
            <motion.div whileHover={{ x: 10 }} transition={{ duration: 0.2 }}>
                <Link to="/professores" className="block hover:bg-yellow-50 px-6 py-4 font-medium transition-colors duration-200 border-b border-gray-100 focus:outline-none focus:bg-yellow-50 active:bg-yellow-100 text-center" onClick={() => setMenuOpen(false)}>Professores</Link>
            </motion.div>
            <motion.div whileHover={{ x: 10 }} transition={{ duration: 0.2 }}>
                <Link to="/planos" className="block hover:bg-yellow-50 px-6 py-4 font-medium transition-colors duration-200 border-b border-gray-100 focus:outline-none focus:bg-yellow-50 active:bg-yellow-100 text-center" onClick={() => setMenuOpen(false)}>Planos</Link>
            </motion.div>
          
            {/* Adicionamos o botão de admin aqui também para consistência */}
            <div className='p-6 text-center'>
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="border-2 border-yellow-500 bg-white/80 backdrop-blur-sm text-yellow-600 py-3 px-6 rounded-lg hover:bg-yellow-50 hover:border-yellow-600 font-medium shadow-md hover:shadow-lg transition-all duration-300 w-full focus:outline-none focus:bg-yellow-50 focus:border-yellow-600 active:bg-yellow-100"
                    >
                        ACESSO RESTRITO
                    </motion.button>
                </Link>
            </div>
        </motion.nav>
       </div>
     </motion.header>
  );
}

export default Navbar;