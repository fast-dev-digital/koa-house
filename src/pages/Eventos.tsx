import { useState } from "react";
import { motion } from "framer-motion";
import { 
  FaGlassCheers, 
  FaTrophy, 
  FaWhatsapp, 
  FaCalendarCheck, 
  FaMusic, 
  FaCheckCircle 
} from "react-icons/fa";
import EventsSection from "../components/EventsSection";
import WhatsappFloat from "../components/WhatsappFloat";

function Eventos() {
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("Todos");

  const categorias = [
    { id: "Todos", label: "Todos os Eventos", icon: FaCalendarCheck },
    { id: "Torneio", label: "Torneios Internos", icon: FaTrophy },
    { id: "Festa", label: "Sunset & Pagode", icon: FaMusic },
  ];

  const diferenciaisEvento = [
    {
      title: "4 Quadras com Areia Premium",
      desc: "Estrutura oficial com iluminação de alta performance para torneios diurnos e noturnos."
    },
    {
      title: "Espaço Gourmet & Churrasqueira",
      desc: "Área exclusiva para receber seus convidados com conforto, mesas e grelha completa."
    },
    {
      title: "Bar Completo & Gastronomia",
      desc: "Cerveja trincando, chopp, drinks tropicais e cardápio de porções preparadas na hora."
    },
    {
      title: "Apoio de Staff & Infraestrutura",
      desc: "Vestiários estruturados, sonorização e equipe de apoio para seu evento ser um sucesso."
    }
  ];

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-b from-amber-50/30 via-white to-gray-50 text-gray-800 pb-16">
      {/* Hero Header */}
      <section className="relative bg-gradient-to-br from-amber-900 via-amber-800 to-emerald-950 text-white py-16 px-4 md:px-10 overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 bg-white/10 text-yellow-300 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold mb-3 backdrop-blur-md border border-white/20">
              <FaGlassCheers className="text-yellow-400" /> Torneios, Música & Confraternização
            </span>
            <h1 className="text-3xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white via-yellow-100 to-amber-200 bg-clip-text text-transparent">
              Eventos Koa House
            </h1>
            <p className="text-base md:text-lg text-amber-100 max-w-2xl mx-auto leading-relaxed font-light mb-6">
              Confira os próximos torneios de futevôlei, sunsets com pagode ao vivo e festas exclusivas na nossa casa.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Container Principal */}
      <div className="max-w-6xl mx-auto px-4 mt-10 md:mt-12">
        {/* Filtro por Categoria */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8">
          {categorias.map(cat => {
            const IconComp = cat.icon;
            const isSelected = categoriaFiltro === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoriaFiltro(cat.id)}
                className={`py-2.5 px-5 rounded-full font-bold text-xs md:text-sm transition-all duration-300 flex items-center gap-2 shadow-sm ${
                  isSelected
                    ? "bg-gradient-to-r from-amber-600 to-amber-800 text-white shadow-md scale-105"
                    : "bg-white text-gray-700 hover:bg-amber-50 border border-gray-200 hover:border-amber-300"
                }`}
              >
                <IconComp className={isSelected ? "text-yellow-300 text-sm" : "text-amber-600 text-sm"} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Lista / Grid de Eventos */}
        <EventsSection mode="page" categoriaFiltro={categoriaFiltro} />

        {/* Seção "Organize Seu Evento na Koa House" */}
        <section className="mt-16 bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-amber-100/80">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-amber-700 font-bold uppercase tracking-wider text-xs md:text-sm">Eventos Privados & Confraternizações</span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 mt-1">
              Faça Seu Evento Privado na Koa House
            </h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-amber-500 to-emerald-600 mx-auto rounded-full mt-3"></div>
            <p className="text-gray-600 mt-4 text-sm md:text-base">
              Aniversários, torneios de empresa, confraternizações ou jogos com os amigos. Monte seu pacote exclusivo com quadra e área gourmet!
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {diferenciaisEvento.map((item, idx) => (
              <div key={idx} className="bg-amber-50/50 rounded-2xl p-5 border border-amber-200/50 flex items-start gap-3">
                <FaCheckCircle className="text-amber-600 text-lg flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h4>
                  <p className="text-gray-600 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <a
              href="https://wa.me/5519981924006?text=Olá!%20Gostaria%20de%20solicitar%20um%20orçamento%20para%20realizar%20um%20evento%20privado%20na%20Koa%20House."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 text-sm md:text-base"
            >
              <FaWhatsapp className="text-xl" />
              <span>ORÇAMENTO PARA EVENTO PRIVADO</span>
            </a>
          </div>
        </section>
      </div>

      <WhatsappFloat />
    </div>
  );
}

export default Eventos;