// src/components/EventsSection.tsx
import React from 'react';

// No futuro, esses dados virão do seu banco de dados (Firestore).
// Por enquanto, usamos essa "massa de dados de exemplo" para construir o visual.

const eventos = [
    {
        tipo: 'Musica ao vivo',
        titulo: 'Pagode do Gordin',
        data: 'Sábado, 15 de Julho',
        imagem: 'torneio-img.png',
        link: '/eventos/pagode-do-gordin',
    },
    {
        tipo: 'Torneio',
        titulo: 'Torneio Interno de Futevôlei',
        data: 'Sábado e Domingo, 23 e 24 de Agosto a partir das 9h',
        imagem: 'torneio-img.png',
        link: '/torneios/interno-agosto',
    },
    // Você pode adicionar mais eventos aqui
];

// Importa as imagens dinamicamente (tecnica avançada, porém muito útil)
const images = import.meta.glob('../assets/*.png', { eager: true, as: 'url' });

function EventsSection() {
    return (
        <section className="bg-zinc-50 py-20">
      <div className="container mx-auto px-4">
        {/* Título da Seção */}
        <h2 className="text-3xl font-bold text-center text-zinc-800 mb-12">
          Nossos Próximos Eventos
        </h2>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {eventos.map((evento) => (
            <div key={evento.titulo} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <img src={images[`../assets/${evento.imagem}`]} alt={evento.titulo} className="w-full h-48 object-cover" />
              <div className="p-6">
                <span className="text-orange-500 font-semibold text-sm">{evento.tipo}</span>
                <h3 className="font-bold text-xl my-2 text-zinc-800">{evento.titulo}</h3>
                <p className="text-zinc-600 text-sm mb-4">{evento.data}</p>
                <a href={evento.link} className="bg-green-700 hover:bg-green-900 text-white font-bold py-2 px-4 rounded inline-block">
                  Saiba Mais
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default EventsSection;