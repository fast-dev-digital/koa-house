import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef } from 'react';
import Navbar from '../components/Navbar';
import EventsSection from '../components/EventsSection';
import PricingCard from '../components/PricingCard';
import { planos } from '../data/planosData';
import Modal from '../components/Modal';
import WhatsappFloat from '../components/WhatsappFloat';
import modalTeste from '../assets/interno-img.png';
import bgHawaiiDesk from '../assets/bg-hawaii-desk.png';
import bgHawaiiMobile from '../assets/bg-hawaii-mobile.png';

function HomePage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { scrollYProgress } = useScroll();
    const heroRef = useRef(null);
    const featuresRef = useRef(null);
    const plansRef = useRef(null);
    const eventsRef = useRef(null);
    
    const heroInView = useInView(heroRef, { once: true });
    const featuresInView = useInView(featuresRef, { once: true });
    const plansInView = useInView(plansRef, { once: true });
    const eventsInView = useInView(eventsRef, { once: true });
    
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
    const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

    useEffect(() => {
        setIsModalOpen(true);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1
        }
    };

    const itemVariants = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    const containerTransition = {
        staggerChildren: 0.3,
        delayChildren: 0.2
    };

    const itemTransition = {
        duration: 0.8,
        ease: "easeOut" as const
    };



    return (
        <div className="overflow-hidden">
            <Navbar />
            
            {/* Hero Section Moderna */}
            <motion.section 
                ref={heroRef}
                className="relative min-h-screen flex items-center justify-center"
                style={{ 
                    y, 
                    opacity,
                    backgroundImage: `url(${bgHawaiiDesk})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                {/* Mobile Background */}
                <div 
                    className="absolute inset-0 md:hidden"
                    style={{
                        backgroundImage: `url(${bgHawaiiMobile})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                />
                
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-black bg-opacity-30" />
                
                {/* Floating Elements */}
                <motion.div 
                    className="absolute top-20 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-20"
                    animate={{
                        y: [-10, 10, -10],
                        transition: {
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }
                    }}
                />
                <motion.div 
                    className="absolute top-40 right-20 w-16 h-16 bg-emerald-400 rounded-full opacity-20"
                    animate={{
                        y: [-10, 10, -10],
                        transition: {
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1
                        }
                    }}
                />
                <motion.div 
                    className="absolute bottom-40 left-20 w-12 h-12 bg-orange-400 rounded-full opacity-20"
                    animate={{
                        y: [-10, 10, -10],
                        transition: {
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2
                        }
                    }}
                />
                
                <motion.div 
                    className="text-center z-10 px-4 max-w-6xl mx-auto"
                    variants={containerVariants}
                    initial="hidden"
                    animate={heroInView ? "visible" : "hidden"}
                    transition={containerTransition}
                >
                    <motion.h1 
                        className="text-6xl md:text-8xl font-black text-white mb-6 leading-tight"
                        variants={itemVariants}
                        transition={itemTransition}
                    >
                        ARENA
                        <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                            BRAZUKA
                        </span>
                    </motion.h1>
                    
                    <motion.p 
                        className="text-xl md:text-2xl text-emerald-100 mb-8 max-w-3xl mx-auto leading-relaxed"
                        variants={itemVariants}
                        transition={itemTransition}
                    >
                        Viva a experiência única do futevôlei e beach tennis nas melhores quadras de areia da região
                    </motion.p>
                    
                    <motion.div 
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        variants={itemVariants}
                        transition={itemTransition}
                    >
                        <motion.a
                            href="https://wa.me/5519981924006?text=Olá%20quero%20reservar%20uma%20quadra%20"
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-4 px-8 rounded-full text-lg shadow-2xl transform transition-all duration-300"
                            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
                            whileTap={{ scale: 0.95 }}
                        >
                            RESERVE SUA QUADRA
                        </motion.a>
                        
                        <motion.a
                            href="https://wa.me/5519981924006?text=Olá%20quero%20fazer%20aula%20experimental%20"
                            className="border-2 border-white text-white font-bold py-4 px-8 rounded-full text-lg backdrop-blur-sm bg-white/10 transition-all duration-300"
                            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
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

            {/* Features Section */}
            <motion.section 
                ref={featuresRef}
                className="py-20 relative"
                style={{
                    backgroundImage: `url(${bgHawaiiDesk})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed'
                }}
                variants={containerVariants}
                initial="hidden"
                animate={featuresInView ? "visible" : "hidden"}
                transition={containerTransition}
            >
                {/* Mobile Background */}
                <div 
                    className="absolute inset-0 md:hidden"
                    style={{
                        backgroundImage: `url(${bgHawaiiMobile})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                />
                {/* Overlay for better readability */}
                 <div className="absolute inset-0 bg-white bg-opacity-85" />
                 <div className="container mx-auto px-4 relative z-10">
                    <motion.h2 
                        className="text-5xl font-black text-center mb-16 bg-gradient-to-r from-emerald-800 to-amber-700 bg-clip-text text-transparent"
                        variants={itemVariants}
                        transition={itemTransition}
                    >
                        Por que escolher a Arena Brazuka?
                    </motion.h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[
                            {
                                title: "Quadras Premium",
                                description: "Areia de qualidade profissional, iluminação LED e estrutura moderna para sua melhor experiência",
                                icon: "🏐",
                                color: "from-emerald-500 to-emerald-700"
                            },
                            {
                                title: "Professores Expert",
                                description: "Equipe de profissionais experientes para te levar ao próximo nível no futevôlei e beach tennis",
                                icon: "🏆",
                                color: "from-amber-500 to-orange-600"
                            },
                            {
                                title: "Estrutura Completa",
                                description: "Bar, vestiários, estacionamento seguro e loja de equipamentos. Tudo que você precisa!",
                                icon: "🌟",
                                color: "from-orange-500 to-red-500"
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                className="relative group"
                                variants={itemVariants}
                                transition={itemTransition}
                                whileHover={{ y: -10 }}
                            >
                                <div className="bg-white rounded-3xl p-8 shadow-xl border border-emerald-100 h-full transform transition-all duration-300 group-hover:shadow-2xl">
                                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto`}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold text-emerald-900 mb-4 text-center">{feature.title}</h3>
                                    <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Planos Section */}
            <motion.section 
                ref={plansRef}
                className="py-20 relative"
                style={{
                    backgroundImage: `url(${bgHawaiiDesk})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed'
                }}
                variants={containerVariants}
                initial="hidden"
                animate={plansInView ? "visible" : "hidden"}
                transition={containerTransition}
            >
                {/* Mobile Background */}
                <div 
                    className="absolute inset-0 md:hidden"
                    style={{
                        backgroundImage: `url(${bgHawaiiMobile})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                />
                {/* Overlay for better readability */}
                 <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 via-amber-800/80 to-orange-600/80" />
                 <div className="container mx-auto px-4 relative z-10">
                    <motion.h2 
                        className="text-5xl font-black text-center text-white mb-16"
                        variants={itemVariants}
                        transition={itemTransition}
                    >
                        Planos em Destaque
                    </motion.h2>
                    
                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
                        variants={containerVariants}
                        transition={containerTransition}
                    >
                        {planos.filter(plano => plano.destacado).map((plano, index) => (
                            <motion.div
                                key={plano.titulo}
                                variants={itemVariants}
                                transition={itemTransition}
                                whileHover={{ scale: 1.05, rotateY: 5 }}
                                className="transform-gpu"
                            >
                                <PricingCard plano={plano} mode="home" />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </motion.section>

            {/* Events Section */}
            <motion.section 
                ref={eventsRef}
                className="py-20 relative"
                style={{
                    backgroundImage: `url(${bgHawaiiDesk})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed'
                }}
                variants={containerVariants}
                initial="hidden"
                animate={eventsInView ? "visible" : "hidden"}
                transition={containerTransition}
            >
                {/* Mobile Background */}
                <div 
                    className="absolute inset-0 md:hidden"
                    style={{
                        backgroundImage: `url(${bgHawaiiMobile})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                />
                {/* Overlay for better readability */}
                 <div className="absolute inset-0 bg-emerald-50/90" />
                 <div className="container mx-auto px-4 relative z-10">
                    <motion.h2 
                        className="text-5xl font-black text-center mb-16 bg-gradient-to-r from-emerald-800 to-amber-700 bg-clip-text text-transparent"
                        variants={itemVariants}
                        transition={itemTransition}
                    >
                        Próximos Eventos
                    </motion.h2>
                    
                    <motion.div variants={itemVariants} transition={itemTransition}>
                        <EventsSection mode='home' />
                    </motion.div>
                </div>
            </motion.section>

            {/* CTA Section */}
            <motion.section 
                className="py-20 bg-gradient-to-r from-emerald-900 to-amber-800 relative overflow-hidden"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                <div className="absolute inset-0 bg-black/20" />
                <div className="container mx-auto px-4 text-center relative z-10">
                    <motion.h2 
                        className="text-5xl font-black text-white mb-6"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        Pronto para começar?
                    </motion.h2>
                    
                    <motion.p 
                        className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Entre em contato conosco e descubra como a Arena Brazuka pode transformar sua experiência no esporte!
                    </motion.p>
                    
                    <motion.a
                        href="https://wa.me/5519981924006?text=Olá%20quero%20saber%20mais%20sobre%20a%20Arena%20Brazuka"
                        className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-4 px-12 rounded-full text-xl shadow-2xl"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        FALE CONOSCO AGORA
                    </motion.a>
                </div>
            </motion.section>

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <h3 className="text-2xl font-bold text-white mb-4 text-center">Nosso Torneio Interno!</h3>
                    <img src={modalTeste} alt="Anúncio de torneio interno" className="w-full rounded-md mb-4" />
                    <p className="text-white text-center">
                        Ei, aluno! Participe do melhor torneio interno da região, que ocorrerá nos dias 30 e 31 de Agosto, com muita resenha, futevôlei e brindes para os campeões!
                    </p>
                </motion.div>
            </Modal>
            
            <WhatsappFloat />
        </div>
    );
}

export default HomePage;