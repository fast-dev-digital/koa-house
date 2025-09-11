import InfoSection from "../components/InfoSection";
import WhatsappFloat from "../components/WhatsappFloat";
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

// importação de imagens dos professores
import imgChris from "../assets/ft-chris.jpeg";
import imgVitinho from "../assets/ft-vitinho-1.jpeg";
import imgKlebao from "../assets/ft-klebao.png";
import imgClebinho from "../assets/ft-clebinho.png";
import imgMello from "../assets/ft-mellinho.png";

function Professores() {
    const headerRef = useRef(null);
    const isHeaderInView = useInView(headerRef, { once: true });

    const headerVariants = {
        hidden: { opacity: 0, y: -50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94] as const
            }
        }
    };

    const titleVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.6,
                delay: 0.2,
                ease: [0.25, 0.46, 0.45, 0.94] as const
            }
        }
    };

    return (
        <div className="pt-20 relative">
            {/* Hero Section com gradiente */}
            <motion.div 
                ref={headerRef}
                className="relative bg-gradient-to-r from-koa-beige to-amber-800 text-white py-16 px-4 md:px-10 overflow-hidden"
                variants={headerVariants}
                initial="hidden"
                animate={isHeaderInView ? "visible" : "hidden"}
            >
                {/* Background decorativo */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-transparent"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
                
                <div className="container mx-auto relative z-10">
                    <motion.div 
                        className="text-center max-w-4xl mx-auto"
                        variants={titleVariants}
                    >
                        <motion.h1 
                            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                        >
                            Nosso Time de Professores
                        </motion.h1>
                        <motion.p 
                            className="text-lg md:text-xl text-green-100 leading-relaxed"
                            initial={{ opacity: 0, y: 20 }}
                            animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                        >
                            Conheça nossos professores especializados e experientes, prontos para elevar seu jogo ao próximo nível
                        </motion.p>
                    </motion.div>
                </div>
            </motion.div>

            {/* Container dos professores */}
            <div className="bg-gradient-to-b from-gray-50 to-white">
                {/*Chris*/}
                <InfoSection
                title="Professor Chris"
                description="Escolha seu horário e aproveite nossas quadras premium para jogar com os amigos. Estrutura moderna, bar e estacionamento seguro!"
                buttonText="FAÇA SUA AULA EXPERIMENTAL COM O PROF° CHRIS AGORA!"
                imageUrl={imgChris}
                imageAlt="Foto do professor Chris"
                linkTo="https://wa.me/5519981924006?text=Olá%20quero%20fazer%20aula%20experimental%20com%20o%20Chris"
                />
    
                {/*Vitinho*/}
                <InfoSection
                title="Professor Vitinho"
                description="Escolha seu horário e aproveite nossas quadras premium para jogar com os amigos. Estrutura moderna, bar e estacionamento seguro!"
                buttonText="FAÇA SUA AULA EXPERIMENTAL COM O PROF° VITINHO AGORA!"
                imageUrl={imgVitinho}
                imageAlt="Foto do professor Victor"
                linkTo="https://wa.me/5519981924006?text=Olá%20quero%20fazer%20aula%20experimental%20com%20o%20Vitinho"
                reverse={true}
                />

                {/*Klebão*/}
                <InfoSection
                title="Professor Klebão"
                description="Escolha seu horário e aproveite nossas quadras premium para jogar com os amigos. Estrutura moderna, bar e estacionamento seguro!"
                buttonText="FAÇA SUA AULA EXPERIMENTAL COM O PROF° KLEBÃO AGORA!"
                imageUrl={imgKlebao}
                imageAlt="Foto do professor Kleber"
                linkTo="https://wa.me/5519981924006?text=Olá%20quero%20fazer%20aula%20experimental%20com%20o%20Klebão"                
                />

                {/*Clebinho*/}
                <InfoSection
                title="Professor Clebinho"
                description="Escolha seu horário e aproveite nossas quadras premium para jogar com os amigos. Estrutura moderna, bar e estacionamento seguro!"
                buttonText="FAÇA SUA AULA EXPERIMENTAL COM O PROF° Clebinho AGORA!"
                imageUrl={imgClebinho}
                imageAlt="Foto do professor Clebinho"
                linkTo="https://wa.me/5519981924006?text=Olá%20quero%20fazer%20aula%20experimental%20com%20o%20Clebinho"
                reverse={true}
                />

                {/*Melinho*/}
                <InfoSection
                title="Professor Mellinho"
                description="Escolha seu horário e aproveite nossas quadras premium para jogar com os amigos. Estrutura moderna, bar e estacionamento seguro!"
                buttonText="FAÇA SUA AULA EXPERIMENTAL COM O PROF° MELLINHO AGORA!"
                imageUrl={imgMello}
                imageAlt="Foto do professor Mello"
                linkTo="https://wa.me/5519981924006?text=Olá%20quero%20fazer%20aula%20experimental%20com%20o%20Mellinho"
                />
            </div>
            
            <WhatsappFloat />
        </div>
    );
}
export default Professores;
