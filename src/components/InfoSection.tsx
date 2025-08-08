// src/components/InfoSection.tsx
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

// Definimos os "ingredientes" que nosso componente InfoSection vai receber
type InfoSectionProps = {
    title: string;
    description: string;
    buttonText: string;
    imageUrl: string;
    imageAlt: string;
    linkTo: string;
    reverse?: boolean; // A interrogação indica que este campo é opcional
};

function InfoSection({ title, description, buttonText, imageUrl, imageAlt, linkTo, reverse = false }: InfoSectionProps) {
    // Define a ordem dos elementos com base na propriedade "reverse"
    // Se reverse for true, a imagem ficará à direita, caso contrário, à esquerda
    const orderClass = reverse ? 'flex-row-reverse' : 'flex-row';
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    // Variantes de animação
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                staggerChildren: 0.2
            }
        }
    };

    const textVariants = {
        hidden: { 
            opacity: 0, 
            x: reverse ? 50 : -50 
        },
        visible: {
            opacity: 1,
            x: 0,
            transition: { 
                duration: 0.6, 
                ease: [0.25, 0.46, 0.45, 0.94] as const
            }
        }
    };

    const imageVariants = {
        hidden: { 
            opacity: 0, 
            x: reverse ? -50 : 50, 
            scale: 0.9 
        },
        visible: {
            opacity: 1,
            x: 0,
            scale: 1,
            transition: { 
                duration: 0.6, 
                ease: [0.25, 0.46, 0.45, 0.94] as const
            }
        }
    };

    return (
    <motion.section 
        ref={ref}
        className="py-16 bg-gradient-to-br from-white via-gray-50 to-white relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
    >
      {/* Background decorativo */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-50/30 to-green-50/30 opacity-50"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className={`flex flex-wrap items-center ${orderClass} -mx-4`}>
          {/* Coluna do Texto */}
          <motion.div 
            className="w-full md:w-1/2 px-4 mb-8 md:mb-0"
            variants={textVariants}
          >
            <motion.h2 
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-zinc-800 to-zinc-600 bg-clip-text text-transparent mb-4"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              {title}
            </motion.h2>
            <motion.p 
              className="text-zinc-600 mb-6 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {description}
            </motion.p>
            {/* Dentro do InfoSection*/}
            <motion.a
              href={linkTo}
              target={linkTo.startsWith("http") ? "_blank" : "_self"}
              rel={linkTo.startsWith("http") ? "noopener noreferrer" : undefined}
              className="inline-block bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-2 px-3 md:py-3 md:px-4 rounded-lg shadow-lg hover:shadow-xl text-xs md:text-sm leading-tight text-center md:w-auto transition-all duration-300 transform hover:scale-105"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {buttonText}
            </motion.a>
          </motion.div>

          {/* Coluna da Imagem */}
          <motion.div 
            className="w-full md:w-1/2 px-4"
            variants={imageVariants}
          >
            <motion.div
              className="relative group overflow-hidden rounded-xl shadow-2xl"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <motion.img 
                src={imageUrl} 
                alt={imageAlt} 
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              {/* Overlay gradiente sutil */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.div>
          </motion.div>
        </div>
       </div>
     </motion.section>
  );
}

export default InfoSection;