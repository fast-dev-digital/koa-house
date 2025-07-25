// src/components/EventsSection.tsx
import { useState } from 'react';

// Tipo da prop
type EventsSectionProps = {
  mode?: 'home' | 'page'; // define o comportamento do botão
};

const eventos = [
  {
    tipo: 'Musica ao vivo',
    titulo: 'Pagode do Gordin',
    data: 'Sábado, 15 de Julho',
    imagem: 'torneio-img.png',
    link: '/eventos/pagode-do-gordin',
    local: 'Rua das Flores, 123 - Centro, São Paulo',
    descricao: 'O Pagode do Gordin é um evento que acontece todos os sábados no nosso clube.',
    horario: '18:00 às 00:00',
  },
  {
    tipo: 'Torneio',
    titulo: 'Torneio Interno de Futevôlei',
    data: 'Sábado e Domingo, 23 e 24 de Agosto a partir das 9h',
    imagem: 'torneio-img.png',
    link: '/torneios/interno-agosto',
    local: 'Rua das Flores, 123 - Centro, São Paulo',
    descricao: 'O Torneio Interno de Futevôlei é um evento super aguardado no clube.',
    horario: '09:00 às 17:00',
  },
];

const images = import.meta.glob('../assets/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

function EventsSection({ mode = 'page' }: EventsSectionProps) {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const toggleExpand = (titulo: string) => {
    setExpandedEvent(expandedEvent === titulo ? null : titulo);
  };

  return (
    <section className="bg-zinc-50 py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {eventos.map((evento) => (
            <div
              key={evento.titulo}
              className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-90 transition-transform duration-300"
            >
              <img
                src={images[`../assets/${evento.imagem}`] as string}
                alt={evento.titulo}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <span className="text-orange-500 font-semibold text-sm">{evento.tipo}</span>
                <h3 className="font-bold text-xl my-2 text-zinc-800">{evento.titulo}</h3>
                <p className="text-zinc-600 text-sm mb-4">{evento.data}</p>

                {mode === 'home' ? (
                  <a
                    href="/eventos"
                    className="bg-green-700 hover:bg-green-900 text-white font-bold py-2 px-4 rounded inline-block"
                  >
                    Ver todos os eventos
                  </a>
                ) : (
                  <>
                    <button
                      onClick={() => toggleExpand(evento.titulo)}
                      className="bg-green-700 hover:bg-green-900 text-white font-bold py-2 px-4 rounded inline-block"
                    >
                      {expandedEvent === evento.titulo ? 'Ver Menos' : 'Ver Mais'}
                    </button>
                    {expandedEvent === evento.titulo && (
                      <div className="mt-4 text-zinc-600">
                        <ul>
                          <li>
                            <span className="font-bold">Local: </span>
                            {evento.local}
                          </li>
                          <li>
                            <span className="font-bold">Horário: </span>
                            {evento.horario}
                          </li>
                          <li>
                            <span className="font-bold">Descrição: </span>
                            {evento.descricao}
                          </li>
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default EventsSection;
