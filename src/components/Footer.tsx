import { Link } from 'react-router-dom';

function Footer() {
    return (
    <footer className="bg-green-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">

          {/* Coluna 1: Logo e Descrição */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Arena Brazuka</h3>
            <p className="text-sm">O melhor do esporte na areia, feito para você e seus amigos.</p>
          </div>

          {/* Coluna 2: Links Rápidos */}
          <div>
            <h4 className="font-bold text-white mb-4">Navegação</h4>
            <ul>
              <li className="mb-2"><Link to="/" className="hover:text-orange-400">Home</Link></li>
              <li className="mb-2"><Link to="/aulas" className="hover:text-orange-400">Aulas</Link></li>
              <li className="mb-2"><Link to="/eventos" className="hover:text-orange-400">Eventos</Link></li>
              <li className="mb-2"><Link to="/contato" className="hover:text-orange-400">Contato</Link></li>
            </ul>
          </div>

          {/* Coluna 3: Contato e Redes Sociais */}
          <div>
            <h4 className="font-bold text-white mb-4">Siga-nos</h4>
            <div className="flex justify-center md:justify-start space-x-4">
              <a href="#" className="hover:text-orange-400">
                {/* Ícone do Instagram (SVG) */}
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c-4.48 0-5.454.019-7.384.06-2.028.048-3.444.48-4.66.974a6.6 6.6 0 00-2.32 2.32c-.494 1.216-.926 2.636-.974 4.66C.019 11.546 0 12.52 0 17s.019 5.454.06 7.384c.048 2.028.48 3.444.974 4.66a6.6 6.6 0 002.32 2.32c1.216.494 2.636.926 4.66.974 1.93.041 2.904.06 7.384.06s5.454-.019 7.384-.06c2.028-.048 3.444-.48 4.66-.974a6.6 6.6 0 002.32-2.32c.494-1.216.926-2.636.974-4.66.041-1.93.06-2.904.06-7.384s-.019-5.454-.06-7.384c-.048-2.028-.48-3.444-.974-4.66a6.6 6.6 0 00-2.32-2.32c-1.216-.494-2.636-.926-4.66-.974C17.454 2.019 16.48 2 12.315 2zM8.51 12.315c0-2.1.84-3.99 2.1-5.25a7.04 7.04 0 015.25-2.1c2.1 0 3.99.84 5.25 2.1a7.04 7.04 0 012.1 5.25c0 2.1-.84 3.99-2.1 5.25a7.04 7.04 0 01-5.25 2.1c-2.1 0-3.99-.84-5.25-2.1a7.04 7.04 0 01-2.1-5.25zm5.66.635a2.53 2.53 0 11-5.06 0 2.53 2.53 0 015.06 0z" clipRule="evenodd" /></svg>
              </a>
              {/* (Você pode adicionar outros ícones aqui) */}
            </div>
          </div>

        </div>

        {/* Linha de Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
          <p>&copy; 2025 Arena Brazuka. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;