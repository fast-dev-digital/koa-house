// src/components/EventsSection.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Tipo da prop
type EventsSectionProps = {
  mode?: "home" | "page"; // define o comportamento do botão
};

const eventos = [
  {
    id: "interno-dez-2025",
    tipo: "Evento",
    titulo: "Torneio Interno Dezembro",
    data: "Sábado e domingo, 13 e 14 de Dezembro a partir das 8h",
    imagem: "interno-dezembro-2025-koa.png",
    link: "/eventos/inauguracao-koa",
    local:
      "R. Papa João XXIII, 45 - Parque Ortolândia, Hortolândia - SP, 13184-180",
    descricao:
      `Participe do nosso grande Torneio Interno de Futevôlei que acontecerá nos dias 12, 13 e 14 de Dezembro a partir das 8h com muita diversão e competitividade saudável!`,
    horario: "08:00 às 18:00",
  },
  {
    id: "happy-hour",
    tipo: "Happy Hour",
    titulo: "Happy Hour",
    data: "Toda Sexta-feira, das 17h às 20h",
    imagem: "happyhour-koa.png",
    link: "/eventos/happy-hour",
    local: "R. Papa João XXIII, 45 - Parque Ortolândia, Hortolândia - SP, 13184-180",
    descricao: `
      Eu ouvi happy hour? Agora é oficial: toda sexta-feira, das 17h às 20h, tem Happy Hour na arena!🔥
      🍻 Chopp em dobro
      🫒 Cardápio exclusivo
      ✌️ Aquela vibe pra você relaxar depois de um dia puxado 💼
    `,
    horario: "17:00 às 20:00",
  },
];

const images = import.meta.glob("../assets/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});

function EventsSection({ mode = "page" }: EventsSectionProps) {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedEvent(expandedEvent === id ? null : id);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  } as const;

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  } as const;

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:items-stretch"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {eventos.map((evento) => (
            <motion.div
              key={evento.id}
              layout // 👈 AQUI para layout animations
              transition={{ layout: { duration: 0.5, ease: "easeOut" } }} // 👈 AQUI para suavizar
              variants={cardVariants}
              whileHover={{
                scale: 1.03,
                y: -8,
                transition: { duration: 0.4, ease: "easeOut" },
              }}
              className="group relative bg-white/90 rounded-3xl shadow-lg overflow-hidden border border-white/30 hover:shadow-yellow-500/20 hover:shadow-xl transition-all duration-700 hover:border-yellow-300/50"
            >
              {/* Enhanced image section */}
              <div className="relative overflow-hidden h-80">
                <img
                  src={images[`../assets/${evento.imagem}`] as string}
                  alt={evento.titulo}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                  loading="lazy"
                />
                {/* Simplified gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Floating date badge */}
                <div className="absolute top-6 right-6">
                  <div className="bg-white/25 rounded-2xl px-4 py-2 border border-white/30">
                    <p className="text-white text-sm font-semibold">
                      {evento.data.split(",")[0]}
                    </p>
                    <p className="text-white/80 text-xs">
                      {evento.data.split(",")[1]}
                    </p>
                  </div>
                </div>

                {/* Bottom title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-black text-2xl lg:text-3xl text-white mb-2 drop-shadow-lg">
                    {evento.titulo}
                  </h3>
                  <div className="flex items-center text-white/90 text-sm">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Koa House
                  </div>
                </div>
              </div>

              {/* Enhanced content section */}
              <div className="p-8 relative">
                {/* Quick info pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <div className="inline-flex items-center px-3 py-1 bg-blue-500/25 rounded-full border border-white/30">
                    <svg
                      className="w-3 h-3 mr-1 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-xs font-medium text-gray-700">
                      {evento.horario}
                    </span>
                  </div>
                  <div className="inline-flex items-center px-3 py-1 bg-green-500/25 rounded-full border border-white/30">
                    <svg
                      className="w-3 h-3 mr-1 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-xs font-medium text-gray-700">
                      Koa House
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-8 leading-relaxed line-clamp-3">
                  {evento.descricao}
                </p>

                {/* Action buttons */}
                <div className="space-y-4">
                  {mode === "home" ? (
                    <motion.a
                      href="/eventos"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="group/btn relative inline-flex items-center justify-center w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:via-yellow-600 hover:to-yellow-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-yellow-500/25 transition-all duration-500 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                      <span className="relative z-10 flex items-center">
                        Ver todos os eventos
                        <svg
                          className="ml-3 w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </span>
                    </motion.a>
                  ) : (
                    <>
                      <motion.button
                        onClick={() => toggleExpand(evento.id)}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="group/btn relative w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:via-yellow-600 hover:to-yellow-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-yellow-500/25 transition-all duration-500 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                        <span className="relative z-10 flex items-center justify-center">
                          {expandedEvent === evento.id ? (
                            <>
                              Ver Menos
                              <svg
                                className="ml-2 w-4 h-4 transition-transform duration-300 rotate-180"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </>
                          ) : (
                            <>
                              Ver Mais Detalhes
                              <svg
                                className="ml-2 w-4 h-4 transition-transform duration-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </>
                          )}
                        </span>
                      </motion.button>
                      <AnimatePresence>
                      {expandedEvent === evento.id && (
                        <motion.div
                          key="details" // Importante ter a key pro AnimatePresence funcionar
                          initial={{ opacity: 0, height: 0, y: -20 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="bg-white/80 rounded-2xl p-6 border border-white/40 shadow-lg"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div className="flex items-start gap-3 p-4 bg-white/50 rounded-xl border border-white/30">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                                  <svg
                                    className="w-4 h-4 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                  </svg>
                                </div>
                                <div>
                                  <span className="font-bold text-gray-800 block">
                                    Local
                                  </span>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {evento.local}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3 p-4 bg-white/50 rounded-xl border border-white/30">
                                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                                  <svg
                                    className="w-4 h-4 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                </div>
                                <div>
                                  <span className="font-bold text-gray-800 block">
                                    Horário
                                  </span>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {evento.horario}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-white/50 rounded-xl border border-white/30 md:col-span-1">
                              <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
                                <svg
                                  className="w-4 h-4 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </div>
                              <div>
                                <span className="font-bold text-gray-800 block">
                                  Sobre o Evento
                                </span>
                                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                  {evento.descricao}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Call to action */}
                          <div className="mt-6 pt-6 border-t border-white/30">
                            <motion.a
                              href="https://wa.me/5519981924006"
                              target="_blank"
                              rel="noopener noreferrer"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
                            >
                              <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                              </svg>
                              Entrar em Contato
                            </motion.a>
                          </div>
                        </motion.div>
                      )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default EventsSection;
