import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaTicketAlt, 
  FaWhatsapp, 
  FaChevronDown, 
  FaMusic, 
  FaTrophy,
  FaArrowRight
} from "react-icons/fa";

type EventsSectionProps = {
  mode?: "home" | "page";
  categoriaFiltro?: string;
};

export interface EventoItem {
  id: string;
  tipo: string;
  categoria: "Torneio" | "Festa";
  titulo: string;
  data: string;
  imagem: string;
  link: string;
  local: string;
  descricao: string;
  horario: string;
  status: string;
  highlightTag?: string;
}

const eventos: EventoItem[] = [
  {
    id: "interno-maio-2026",
    tipo: "Torneio",
    categoria: "Torneio",
    titulo: "KOA CUP - Torneio Interno de Futevôlei",
    data: "15, 16 e 17 de Maio",
    imagem: "interno-maio-koa.png",
    link: "/eventos/inauguracao-koa",
    local: "Koa House - R. Papa João XXIII, 45, Parque Ortolândia, Hortolândia - SP",
    descricao: "Participe do KOA CUP, nosso grande Torneio Interno de Futevôlei! Serão 3 dias de jogos acirrados, premiações exclusivas, troféus, DJ e aquele clima inconfundível de confraternização na areia.",
    horario: "08:00 às 18:00",
    status: "Inscrições Abertas",
    highlightTag: "Torneio Oficial"
  },
  {
    id: "pagode-koa",
    tipo: "Pagode & Sunset",
    categoria: "Festa",
    titulo: "Koa Sunset - Pagode do Adame & Grupo Presença",
    data: "12 de Abril",
    imagem: "evento-12-abril.png",
    link: "/eventos/pagode-koa",
    local: "Koa House - R. Papa João XXIII, 45, Parque Ortolândia, Hortolândia - SP",
    descricao: "Vem aí a 1ª edição do Koa Sunset! Um fim de tarde imperdível com o melhor do pagode ao vivo com PAGODE DO ADAME E GRUPO PRESENÇA no palco, drinks gelados e área gourmet.",
    horario: "13:00 às 18:00",
    status: "Ingressos Liberados",
    highlightTag: "Música Ao Vivo"
  },
];

const images = import.meta.glob("../assets/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});

function EventsSection({ mode = "page", categoriaFiltro = "Todos" }: EventsSectionProps) {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedEvent(expandedEvent === id ? null : id);
  };

  const eventosExibidos = categoriaFiltro === "Todos" 
    ? eventos 
    : eventos.filter(e => e.categoria === categoriaFiltro);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const cardVariants: Variants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="py-8 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-stretch max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {eventosExibidos.map((evento) => {
            const isExpanded = expandedEvent === evento.id;
            const imgSrc = (images[`../assets/${evento.imagem}`] as string) || "";
            const isTorneio = evento.categoria === "Torneio";

            return (
              <motion.div
                key={evento.id}
                layout
                variants={cardVariants}
                className="group relative bg-white rounded-3xl shadow-xl overflow-hidden border border-amber-100/70 hover:shadow-2xl transition-all duration-500 flex flex-col justify-between"
              >
                {/* Imagem do Evento com Badges */}
                <div className="relative overflow-hidden h-72 md:h-80 bg-gray-900">
                  <img
                    src={imgSrc}
                    alt={evento.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

                  {/* Badge Tipo/Categoria */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-amber-500/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-amber-300/40">
                      {isTorneio ? <FaTrophy className="text-yellow-200" /> : <FaMusic className="text-yellow-200" />}
                      {evento.highlightTag || evento.tipo}
                    </span>
                    <span className="bg-emerald-600/90 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md flex items-center gap-1 border border-emerald-300/30">
                      <FaTicketAlt /> {evento.status}
                    </span>
                  </div>

                  {/* Date Badge */}
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-2xl px-3.5 py-1.5 text-right shadow-lg">
                    <div className="text-xs font-bold tracking-wide uppercase text-yellow-300 flex items-center gap-1">
                      <FaCalendarAlt /> {evento.data}
                    </div>
                  </div>

                  {/* Título & Local na Foto */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-extrabold text-2xl lg:text-3xl text-white mb-2 leading-tight drop-shadow-md">
                      {evento.titulo}
                    </h3>
                    <div className="flex items-center text-amber-200 text-xs md:text-sm font-medium">
                      <FaMapMarkerAlt className="mr-1.5 text-amber-400 flex-shrink-0" />
                      <span className="truncate">Koa House • Hortolândia - SP</span>
                    </div>
                  </div>
                </div>

                {/* Conteúdo do Card */}
                <div className="p-6 md:p-8 flex flex-col justify-between flex-grow">
                  <div>
                    {/* Pills de horário e local */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center px-3 py-1 bg-amber-50 text-amber-800 rounded-lg text-xs font-semibold border border-amber-200/60">
                        <FaClock className="mr-1.5 text-amber-600" />
                        {evento.horario}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-200/60">
                        <FaMapMarkerAlt className="mr-1.5 text-emerald-600" />
                        Estrutura Completa
                      </span>
                    </div>

                    {/* Descrição em síntese */}
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                      {evento.descricao}
                    </p>
                  </div>

                  {/* Botões de Ação */}
                  <div>
                    {mode === "home" ? (
                      <a
                        href="/eventos"
                        className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg text-sm transition-all duration-300"
                      >
                        <span>VER TODOS OS EVENTOS</span>
                        <FaArrowRight className="text-xs" />
                      </a>
                    ) : (
                      <>
                        <button
                          onClick={() => toggleExpand(evento.id)}
                          className="w-full bg-gray-100 hover:bg-amber-50 text-gray-800 hover:text-amber-800 font-bold py-3 px-6 rounded-xl border border-gray-200 transition-all duration-300 text-sm flex items-center justify-center gap-2"
                        >
                          <span>{isExpanded ? "Ocultar Detalhes" : "Ver Detalhes do Evento"}</span>
                          <FaChevronDown className={`text-xs transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              key="details"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-4 pt-4 border-t border-gray-100 space-y-4"
                            >
                              <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/60 text-xs md:text-sm text-gray-700 space-y-2">
                                <p className="flex items-center gap-2 font-semibold text-amber-900">
                                  <FaMapMarkerAlt className="text-amber-600" />
                                  <span>{evento.local}</span>
                                </p>
                                <p className="flex items-center gap-2 font-semibold text-amber-900">
                                  <FaClock className="text-amber-600" />
                                  <span>Horário: {evento.horario}</span>
                                </p>
                              </div>

                              <a
                                href={`https://wa.me/5519981924006?text=${encodeURIComponent(`Olá! Quero me inscrever / comprar ingresso para o evento: ${evento.titulo}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg text-sm transition-all duration-300"
                              >
                                <FaWhatsapp className="text-lg" />
                                <span>GARANTIR VAGA / INGRESSO VIA WHATSAPP</span>
                              </a>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default EventsSection;
