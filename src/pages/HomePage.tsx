import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { 
  FaVolleyballBall, 
  FaGlassCheers, 
  FaShieldAlt, 
  FaWhatsapp, 
  FaGraduationCap, 
  FaArrowRight
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import EventsSection from "../components/EventsSection";
import PricingCard from "../components/PricingCard";
import { planos } from "../data/planosData";
import Modal from "../components/Modal";
import WhatsappFloat from "../components/WhatsappFloat";

import modalPrincipal from "../assets/interno-koa-maio-full.png";
import bgKoaSand from "../assets/koa-sand-pscreen.png";
import bgKoaSandMobile from "../assets/koa-sand-mobile-text-true1.png";
import { Link } from "react-router-dom";

function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const plansRef = useRef(null);
  const eventsRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  useEffect(() => {
    setIsModalOpen(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  const features = [
    {
      title: "Quadras Premium de Areia",
      description: "Areia de quartzo tratada com absorção de impacto, drenagem rápida e iluminação LED de alta performance.",
      icon: FaVolleyballBall,
      color: "from-emerald-500 to-teal-700",
    },
    {
      title: "Corpo Docente de Elite",
      description: "Professores experientes para aulas de Futevôlei e Beach Tennis do iniciante ao nível avançado.",
      icon: FaGraduationCap,
      color: "from-amber-500 to-orange-600",
    },
    {
      title: "Bar & Lounge Gourmet",
      description: "Espaço exclusivo para o pós-jogo com bebidas geladas, porções, churrasqueira e eventos musicais.",
      icon: FaGlassCheers,
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Estrutura & Segurança",
      description: "Vestiários equipados com chuveiros quentes, loja esportiva e estacionamento monitorado.",
      icon: FaShieldAlt,
      color: "from-blue-500 to-indigo-600",
    },
  ];

  return (
    <div className="overflow-hidden bg-white text-gray-800">
      <Navbar />

      {/* Hero Section Restaurada */}
      <motion.section
        ref={heroRef}
        className="relative min-h-screen flex items-end justify-center pb-24"
        style={{
          y,
          opacity,
          backgroundImage: `url(${bgKoaSand})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Mobile Background */}
        <div
          className="absolute inset-0 md:hidden"
          style={{
            backgroundImage: `url(${bgKoaSandMobile})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Overlay para legibilidade */}
        <div className="absolute inset-0 bg-koa-dark/40" />

        <motion.div
          className="text-center z-10 px-4 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
        >
          <motion.p
            className="text-xl md:text-2xl text-emerald-100 mb-8 max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Viva a experiência única do futevôlei e beach tennis nas melhores
            quadras de areia da região
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={itemVariants}
          >
            <motion.a
              href="https://wa.me/5519981924006?text=Olá%20quero%20reservar%20uma%20quadra%20"
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-4 px-8 rounded-full text-lg shadow-2xl transform transition-all duration-300"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              RESERVE SUA QUADRA
            </motion.a>

            <motion.a
              href="https://wa.me/5519981924006?text=Olá%20quero%20fazer%20aula%20experimental%20"
              className="border-2 border-white text-white font-bold py-4 px-8 rounded-full text-lg backdrop-blur-sm bg-white/10 transition-all duration-300"
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(255,255,255,0.2)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              AULA EXPERIMENTAL
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2" />
          </div>
        </motion.div>
      </motion.section>

      {/* Por Que Escolher a Koa House */}
      <section ref={featuresRef} className="py-20 bg-gradient-to-b from-gray-50 via-amber-50/20 to-white relative">
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-14">
            <span className="text-amber-700 font-bold uppercase tracking-wider text-xs md:text-sm">Excelência & Experiência</span>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mt-1">
              Por Que Escolher a Koa House?
            </h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-amber-500 to-emerald-600 mx-auto rounded-full mt-3"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const IconComp = feature.icon;
              return (
                <motion.div
                  key={index}
                  whileHover={{ y: -6 }}
                  className="bg-white rounded-3xl p-7 shadow-lg border border-amber-100/70 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} text-white rounded-2xl flex items-center justify-center text-2xl mb-5 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <IconComp />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 leading-snug">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Planos em Destaque */}
      <section
        ref={plansRef}
        className="py-20 relative bg-gradient-to-br from-amber-900 via-amber-800 to-emerald-950 text-white"
      >
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-14">
            <span className="text-yellow-300 font-bold uppercase tracking-wider text-xs md:text-sm">Nossas Modalidades</span>
            <h2 className="text-3xl md:text-5xl font-black text-white mt-1 bg-gradient-to-r from-white via-yellow-100 to-amber-200 bg-clip-text text-transparent">
              Planos em Destaque
            </h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 mx-auto rounded-full mt-3"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {planos
              .filter((plano) => plano.destacado)
              .map((plano) => (
                <div key={plano.titulo} className="h-full flex">
                  <PricingCard plano={plano} mode="home" />
                </div>
              ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/planos"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 px-8 rounded-full backdrop-blur-md border border-white/30 transition-all duration-300 text-sm"
            >
              <span>VER TODOS OS PLANOS E VALORES</span>
              <FaArrowRight className="text-xs text-yellow-300" />
            </Link>
          </div>
        </div>
      </section>

      {/* Seção Próximos Eventos */}
      <section ref={eventsRef} className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-amber-700 font-bold uppercase tracking-wider text-xs md:text-sm">Diversão & Torneios</span>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mt-1">
              Próximos Eventos na Koa
            </h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-amber-500 to-emerald-600 mx-auto rounded-full mt-3"></div>
          </div>

          <EventsSection mode="home" />
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-emerald-950 rounded-3xl p-8 md:p-14 text-white text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white via-yellow-100 to-amber-200 bg-clip-text text-transparent">
              Pronto Para Jogar na Koa House?
            </h2>
            <p className="text-amber-100 text-base md:text-lg mb-8 leading-relaxed font-light">
              Escolha seu horário, agende uma aula experimental com nossos professores ou reserve a quadra com seus amigos agora mesmo!
            </p>

            <a
              href="https://wa.me/5519981924006?text=Olá,%20quero%20saber%20mais%20sobre%20a%20Koa%20House"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-gray-950 font-extrabold py-4 px-10 rounded-full text-base shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <FaWhatsapp className="text-xl" />
              <span>FALAR COM A EQUIPE VIA WHATSAPP</span>
            </a>
          </div>
        </div>
      </section>

      {/* Modal Promocional */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <img
            src={modalPrincipal}
            alt="Anúncio de torneio interno Koa Cup"
            className="w-full rounded-xl mb-2 shadow-md"
            loading="lazy"
          />
        </motion.div>
      </Modal>

      <WhatsappFloat />
    </div>
  );
}

export default HomePage;
