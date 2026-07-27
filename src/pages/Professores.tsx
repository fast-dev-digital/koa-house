import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';
import type { Swiper as SwiperClass } from 'swiper';
import { FaChevronLeft, FaChevronRight, FaWhatsapp, FaGraduationCap, FaStar } from 'react-icons/fa';
import WhatsappFloat from "../components/WhatsappFloat";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Importação de imagens dos professores
import imgAndrey from "../assets/ft-andrey.png";
import imgVitinho from "../assets/ft-vitinho-1.jpeg";
import imgKlebao from "../assets/ft-klebao.png";
import imgClebinho from "../assets/ft-clebinho.png";
import imgLeo from "../assets/ft-leo.jpg";

interface Professor {
    id: string;
    name: string;
    nickname: string;
    specialty: string;
    tags: string[];
    description: string;
    imageUrl: string;
    imageAlt: string;
    whatsappLink: string;
    buttonText: string;
}

const professoresData: Professor[] = [
    {
        id: "andrey",
        name: "Professor Andrey",
        nickname: "Andrey",
        specialty: "Fundamentos & Preparação Física na Areia",
        tags: ["Futevôlei", "Técnica de Controle", "Condicionamento"],
        description: "Especialista em desenvolvimento técnico e movimentação de areia. Suas aulas combinam treino tático intenso e ajuste fino de recepção e ataque para alunos de todos os níveis.",
        imageUrl: imgAndrey,
        imageAlt: "Foto do professor Andrey",
        whatsappLink: "https://wa.me/5519981924006?text=Olá%20quero%20fazer%20aula%20experimental%20com%20o%20Andrey",
        buttonText: "AULA EXPERIMENTAL COM PROF° ANDREY"
    },
    {
        id: "vitinho",
        name: "Professor Vitinho",
        nickname: "Vitinho",
        specialty: "Leitura de Jogo & Dinâmica de Quadra",
        tags: ["Futevôlei", "Ataque & Defesa", "Agilidade"],
        description: "Com didática ágil e alta energia, Vitinho foca na visão de jogo, transições rápidas e consistência nos ralis. Ideal para quem quer evoluir o ritmo de partida.",
        imageUrl: imgVitinho,
        imageAlt: "Foto do professor Vitinho",
        whatsappLink: "https://wa.me/5519981924006?text=Olá%20quero%20fazer%20aula%20experimental%20com%20o%20Vitinho",
        buttonText: "AULA EXPERIMENTAL COM PROF° VITINHO"
    },
    {
        id: "klebao",
        name: "Professor Klebão",
        nickname: "Klebão",
        specialty: "Alta Performance & Tática Avançada",
        tags: ["Performance", "Tática Avançada", "Potência"],
        description: "Referência nos esportes de areia, Klebão trabalha potência de ataque, cobertura defensiva e inteligência tática sob pressão para transformar seu nível em quadra.",
        imageUrl: imgKlebao,
        imageAlt: "Foto do professor Kleber",
        whatsappLink: "https://wa.me/5519981924006?text=Olá%20quero%20fazer%20aula%20experimental%20com%20o%20Klebão",
        buttonText: "AULA EXPERIMENTAL COM PROF° KLEBÃO"
    },
    {
        id: "clebinho",
        name: "Professor Clebinho",
        nickname: "Clebinho",
        specialty: "Formação Inicial & Aperfeiçoamento",
        tags: ["Iniciante ao Avançado", "Passe & Levada", "Didática"],
        description: "Reconhecido pela atenção aos detalhes e didática paciente, Clebinho garante que alunos iniciantes e intermediários ganhem confiança e domínio absoluto de bola.",
        imageUrl: imgClebinho,
        imageAlt: "Foto do professor Clebinho",
        whatsappLink: "https://wa.me/5519981924006?text=Olá%20quero%20fazer%20aula%20experimental%20com%20o%20Clebinho",
        buttonText: "AULA EXPERIMENTAL COM PROF° CLEBINHO"
    },
    {
        id: "leo",
        name: "Professor Leo",
        nickname: "Leo",
        specialty: "Resistência & Fundamentos de Areia",
        tags: ["Mobilidade na Areia", "Fundamentos", "Resistência"],
        description: "Foco no fortalecimento muscular específico e aprimoramento dos fundamentos básicos e avançados, garantindo evolução constante e prevenção de lesões.",
        imageUrl: imgLeo,
        imageAlt: "Foto do professor Leo",
        whatsappLink: "https://wa.me/5519981924006?text=Olá%20quero%20fazer%20aula%20experimental%20com%20o%20Leo",
        buttonText: "AULA EXPERIMENTAL COM PROF° LEO"
    }
];

function Professores() {
    const [swiperInstance, setSwiperInstance] = useState<SwiperClass | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const headerRef = useRef(null);
    const isHeaderInView = useInView(headerRef, { once: true });

    const handleSelectProfessor = (index: number) => {
        if (swiperInstance) {
            swiperInstance.slideToLoop(index);
        }
    };

    return (
        <div className="pt-20 relative bg-gradient-to-b from-amber-50/40 via-white to-gray-50 min-h-screen pb-16">
            {/* Hero Section */}
            <motion.div 
                ref={headerRef}
                className="relative bg-gradient-to-r from-koa-beige to-amber-800 text-white py-14 px-4 md:px-10 overflow-hidden shadow-md"
                initial={{ opacity: 0, y: -30 }}
                animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-transparent"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32 pointer-events-none"></div>
                
                <div className="container mx-auto relative z-10 text-center max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={isHeaderInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <span className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-200 px-3 py-1 rounded-full text-xs md:text-sm font-medium mb-3 backdrop-blur-sm border border-yellow-300/30">
                            <FaGraduationCap className="text-yellow-300" /> Corpo Docente Koa House
                        </span>
                        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-white via-yellow-100 to-yellow-300 bg-clip-text text-transparent">
                            Conheça Nossos Professores
                        </h1>
                        <p className="text-base md:text-lg text-amber-100 max-w-2xl mx-auto leading-relaxed">
                            Profissionais capacitados e apaixonados pelo esporte na areia. Selecione um professor para ver os detalhes e agendar sua aula!
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            {/* Container do Carrossel */}
            <div className="max-w-5xl mx-auto px-4 mt-8 md:mt-12">
                {/* Tabs de Seleção Rápida */}
                <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8">
                    {professoresData.map((prof, idx) => {
                        const isActive = activeIndex === idx;
                        return (
                            <button
                                key={prof.id}
                                onClick={() => handleSelectProfessor(idx)}
                                className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 shadow-sm ${
                                    isActive
                                        ? "bg-gradient-to-r from-koa-beige to-amber-700 text-white shadow-md scale-105"
                                        : "bg-white text-gray-700 hover:bg-amber-50 border border-gray-200 hover:border-amber-300"
                                }`}
                            >
                                <FaStar className={isActive ? "text-yellow-300 text-xs" : "text-amber-500 text-xs"} />
                                {prof.nickname}
                            </button>
                        );
                    })}
                </div>

                {/* Wrapper do Swiper com Botões de Navegação Customizados */}
                <div className="relative group px-2 md:px-10">
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
                        effect="coverflow"
                        coverflowEffect={{
                            rotate: 5,
                            stretch: 0,
                            depth: 80,
                            modifier: 1,
                            slideShadows: false,
                        }}
                        spaceBetween={30}
                        slidesPerView={1}
                        loop={true}
                        autoplay={{
                            delay: 5000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}
                        onSwiper={setSwiperInstance}
                        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                        className="pb-14 pt-2"
                    >
                        {professoresData.map((prof) => (
                            <SwiperSlide key={prof.id}>
                                <div className="bg-white rounded-3xl shadow-xl border border-amber-100/70 overflow-hidden transition-all duration-300 hover:shadow-2xl">
                                    <div className="flex flex-col md:flex-row items-center">
                                        {/* Coluna da Imagem */}
                                        <div className="w-full md:w-5/12 bg-gradient-to-b from-amber-50/60 to-orange-50/40 p-6 flex justify-center items-center relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full blur-2xl"></div>
                                            <div className="relative z-10 w-full max-w-[260px] md:max-w-[280px] h-[280px] md:h-[320px] rounded-2xl overflow-hidden shadow-lg border-2 border-white/80 group">
                                                <img
                                                    src={prof.imageUrl}
                                                    alt={prof.imageAlt}
                                                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
                                            </div>
                                        </div>

                                        {/* Coluna de Informações e Texto Customizado */}
                                        <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col justify-between">
                                            <div>
                                                {/* Tags do Professor */}
                                                <div className="flex flex-wrap gap-1.5 mb-3">
                                                    {prof.tags.map((tag, tIdx) => (
                                                        <span
                                                            key={tIdx}
                                                            className="bg-amber-100/80 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-md border border-amber-200/50"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>

                                                {/* Nome e Especialidade */}
                                                <h2 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-zinc-900 via-amber-900 to-amber-700 bg-clip-text text-transparent mb-1">
                                                    {prof.name}
                                                </h2>
                                                <p className="text-sm font-semibold text-amber-700 mb-4 flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                                                    {prof.specialty}
                                                </p>

                                                {/* Descrição Personalizada */}
                                                <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6 bg-gray-50/80 p-4 rounded-xl border border-gray-100">
                                                    "{prof.description}"
                                                </p>
                                            </div>

                                            {/* Botão de Ação WhatsApp */}
                                            <div>
                                                <a
                                                    href={prof.whatsappLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-500 hover:to-green-600 text-white font-bold py-3 px-5 rounded-xl shadow-md hover:shadow-lg text-xs md:text-sm transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95"
                                                >
                                                    <FaWhatsapp className="text-lg text-white" />
                                                    <span>{prof.buttonText}</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Botões Customizados Anterior / Próximo */}
                    <button
                        onClick={() => swiperInstance?.slidePrev()}
                        aria-label="Professor anterior"
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-5 z-20 bg-white/90 hover:bg-white text-gray-800 hover:text-amber-800 p-3 rounded-full shadow-lg border border-gray-200 transition-all duration-200 hover:scale-110 focus:outline-none"
                    >
                        <FaChevronLeft className="text-base" />
                    </button>
                    <button
                        onClick={() => swiperInstance?.slideNext()}
                        aria-label="Próximo professor"
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-5 z-20 bg-white/90 hover:bg-white text-gray-800 hover:text-amber-800 p-3 rounded-full shadow-lg border border-gray-200 transition-all duration-200 hover:scale-110 focus:outline-none"
                    >
                        <FaChevronRight className="text-base" />
                    </button>
                </div>
            </div>

            <WhatsappFloat />
        </div>
    );
}

export default Professores;
