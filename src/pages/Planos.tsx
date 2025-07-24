// src/pages/Planos.tsx

import React, { useState } from 'react';
import { planos } from '../data/planosData'; // Importa nossos dados
import PricingCard from '../components/PricingCard'; // Importa nosso card de planos

function PlanosPage() {
    const [filtro, setFiltro] = useState<'Futevôlei' | 'Beach Tennis' >('Futevôlei');

    const planosFiltrados = planos.filter(plano => plano.tipo === filtro);
    const categorias = ['Futevôlei', 'Beach Tennis']; // Adicionar mais se preciso.
    const planosLocacao = planos.filter(plano => plano.tipo === 'Locação');

    return (
    <div className="py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Título e Descrição */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-zinc-800 mb-4">Escolha seu Plano Ideal e Vem pra Areia!</h1>
          <p className="text-zinc-600">
            Experimente a energia do esporte na areia! Faça aulas de beach tennis ou futevôlei
            com professores qualificados e descubra a modalidade que mais combina com
            você. Agende sua aula experimental e conheça a nossa estrutura completa!
          </p>
        </div>

        {/* Botões de Filtro */}
        <div className="flex justify-center space-x-2 mb-12">
          {categorias.map(categoria => (
            <button
              key={categoria}
              onClick={() => setFiltro(categoria as 'Futevôlei' | 'Beach Tennis')}
              className={`py-2 px-6 rounded font-semibold transition-colors duration-300 ${
                filtro === categoria
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {categoria}
            </button>
          ))}
        </div>

        {/* Grid de Planos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {planosFiltrados.map(plano => (
            <PricingCard key={plano.titulo} plano={plano} />
          ))}
        </div>
        
        {/* --- NOVA SEÇÃO DE LOCAÇÃO --- */}
        <div className="text-center max-w-2xl mx-auto mt-20 mb-12">
          <h2 className="text-4xl font-bold text-zinc-800 mb-4">Alugue Nossos Espaços</h2>
          <p className="text-zinc-600">
            Traga seus amigos para um jogo casual ou reserve nossa área gourmet para seu evento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {planosLocacao.map(plano => (
            <PricingCard key={plano.titulo} plano={plano} />
          ))}
        </div>
        {/* --- FIM DA NOVA SEÇÃO --- */}
      </div>
    </div>
  );
}

export default PlanosPage;