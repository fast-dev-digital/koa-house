// src/components/EventsSection.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  } as const;

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  } as const;

  return (
    <section className="py-0">
      <div className="container mx-auto px-4">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {eventos.map((evento, index) => (
            <motion.div
              key={evento.titulo}
              variants={cardVariants}
              whileHover={{ 
                scale: 1.05, 
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
              className="group relative backdrop-blur-sm bg-white/90 rounded-2xl shadow-2xl overflow-hidden border border-white/20 hover:shadow-3xl transition-all duration-500"
            >
              {/* Gradient overlay on image */}
              <div className="relative overflow-hidden">
                <img
                  src={images[`../assets/${evento.imagem}`] as string}
                  alt={evento.titulo}
                  className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-emerald-500 to-amber-500 text-white text-xs font-bold rounded-full shadow-lg">
                    {evento.tipo}
                  </span>
                </div>
              </div>
              
              <div className="p-6 relative">
                <h3 className="font-black text-xl mb-3 text-gray-800 group-hover:text-emerald-700 transition-colors duration-300">
                  {evento.titulo}
                </h3>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">{evento.data}</p>

                {mode === 'home' ? (
                  <motion.a
                    href="/eventos"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center justify-center w-full bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-700 hover:to-amber-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform"
                  >
                    Ver todos os eventos
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.a>
                ) : (
                  <>
                    <motion.button
                      onClick={() => toggleExpand(evento.titulo)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-700 hover:to-amber-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mb-4"
                    >
                      {expandedEvent === evento.titulo ? 'Ver Menos' : 'Ver Mais'}
                    </motion.button>
                    {expandedEvent === evento.titulo && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-xl p-4 border border-emerald-100"
                      >
                        <div className="space-y-3 text-gray-700">
                          <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div>
                              <span className="font-semibold text-emerald-800">Local:</span>
                              <p className="text-sm">{evento.local}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                              <span className="font-semibold text-emerald-800">Horário:</span>
                              <p className="text-sm">{evento.horario}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                              <span className="font-semibold text-emerald-800">Descrição:</span>
                              <p className="text-sm">{evento.descricao}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default EventsSection;
