// src/components/PricingCard.tsx
import { Link } from 'react-router-dom';
import type { Plano } from '../data/planosData';

type PricingCardProps = {
    plano: Plano;
    mode?: 'home' | 'planos'; // Adiciona prop opcional para diferenciar comportamentos
}

// O SVG do ícone de check
const CheckIcon = () => (
    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

function PricingCard({ plano, mode = 'planos' }: PricingCardProps) {
    // Classes condicionais baseadas na prop 'destacado'
    const cardClasses = plano.destacado ? 'border-green-500 border-2' : 'border-gray-200 border';
    const headerClasses = plano.destacado ? 'bg-green-500 text-white' : 'hidden';
    const buttonClasses = plano.destacado
        ? 'bg-green-500 hover:bg-green-600 text-white'
        : 'bg-white hover:bg-green-500 text-green-500 hover:text-white border border-green-500';

    const renderButton = () => {
      if (mode === 'home') {
        // Na HomePage: botão leva para página de planos
        return (
          <Link to="/planos" className={`block w-full font-bold py-3 px-6 rounded transition-colors duration-300 text-center ${buttonClasses}`}>
            VER PLANOS
          </Link>
        );
      } else {
          // Na página Planos: botão leva para whatsapp
          const whatsappMessage = `Olá, gostaria de saber mais sobre o plano ${plano.titulo}.`;
          const whatsappUrl = `https://wa.me/5519981924006?text=${encodeURIComponent(whatsappMessage)}`;

          return (
                <a 
                    href={whatsappUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`block w-full font-bold py-3 px-6 rounded transition-colors duration-300 text-center ${buttonClasses}`}
                >
                    EU QUERO
                </a>
            );
      }
    }
        
    return (
    <div className={`rounded-lg shadow-lg p-6 flex flex-col bg-white ${cardClasses}`}>
      <div className={`text-xs font-bold uppercase tracking-wider text-center py-1 px-3 rounded-full mb-4 self-center ${headerClasses}`}>
        Mais Vantajoso
      </div>
      <h3 className="text-xl font-bold text-zinc-800">{plano.titulo}</h3>
      <p className="text-5xl font-bold text-zinc-900 my-4">
        {plano.preco}
        {/* Esta span só será renderizada se plano.unidade tiver um valor */}
        {plano.unidade && (
          <span className="text-lg font-medium text-zinc-500">{plano.unidade}</span>
        )}
      </p>

      {/* Renderiza o botão baseado no mode */}
      {renderButton()}
      
      {/* Lista de features dos planos */}
            <ul className="mt-6 space-y-3 text-zinc-600">
                {plano.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                        <CheckIcon />
                        <span className="ml-3">{feature}</span>
                    </li>
                ))}
            </ul>
    </div>
  );
}

export default PricingCard;
