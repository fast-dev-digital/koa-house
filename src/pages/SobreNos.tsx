import { motion, type Variants } from "framer-motion";
import { 
  FaVolleyballBall, 
  FaUsers, 
  FaAward, 
  FaGlassCheers, 
  FaHeart, 
  FaShieldAlt, 
  FaSun, 
  FaWhatsapp
} from "react-icons/fa";
import { Link } from "react-router-dom";
import WhatsappFloat from "../components/WhatsappFloat";
import GaleriaSwiper from "../components/GaleriaSwiper";

function SobreNos() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 25, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const stats = [
    { value: "4", label: "Quadras Premium de Areia", icon: FaVolleyballBall },
    { value: "+500", label: "Alunos & Atletas Ativos", icon: FaUsers },
    { value: "5", label: "Professores Especialistas", icon: FaAward },
    { value: "100%", label: "Energia & Vibe Positiva", icon: FaSun }
  ];

  const diferenciais = [
    {
      icon: FaVolleyballBall,
      title: "Areia Tratada e Nivelada",
      description: "Quadras projetadas com granulometria ideal para absorção de impacto, conforto térmico e jogabilidade profissional."
    },
    {
      icon: FaGlassCheers,
      title: "Bar & Lounge Exclusivo",
      description: "O espaço perfeito para o pós-jogo: drinks gelados, porções, música e o clima acolhedor de praia."
    },
    {
      icon: FaUsers,
      title: "Comunidade Integrada",
      description: "Promovemos torneios internos, day-use, eventos festivos e a união entre iniciantes e avançados."
    },
    {
      icon: FaShieldAlt,
      title: "Estrutura Segura & Completa",
      description: "Vestiários higienizados, duchas, estacionamento privativo e monitoramento constante para sua tranquilidade."
    }
  ];

  const valores = [
    {
      title: "Comunidade",
      description: "Acreditamos no esporte como elo entre pessoas. Aqui cada aluno faz amigos para a vida toda.",
      color: "from-emerald-500 to-teal-600",
      icon: FaUsers
    },
    {
      title: "Qualidade",
      description: "Compromisso em oferecer a melhor infraestrutura de areia e atendimento atencioso em cada detalhe.",
      color: "from-amber-500 to-yellow-600",
      icon: FaAward
    },
    {
      title: "Paixão",
      description: "Movidos pelo amor ao futevôlei e pelos esportes de areia. Essa energia é sentida em cada quadra.",
      color: "from-orange-500 to-red-500",
      icon: FaHeart
    }
  ];

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-b from-amber-50/30 via-white to-gray-50 text-gray-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-900 via-amber-800 to-emerald-950 text-white py-20 px-4 md:px-10 overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 bg-white/10 text-yellow-300 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold mb-4 backdrop-blur-md border border-white/20">
              <FaSun className="text-yellow-400" /> A Vibe da Areia em Cada Detalhe
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white via-yellow-100 to-amber-200 bg-clip-text text-transparent leading-tight">
              Sobre a Koa House
            </h1>
            <p className="text-lg md:text-2xl text-amber-100 max-w-3xl mx-auto leading-relaxed font-light mb-8">
              Mais do que uma quadra, somos uma comunidade viva e acolhedora apaixonada pelo estilo de vida praiano e pelo futevôlei.
            </p>
          </motion.div>

          {/* Grid de Estatísticas */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {stats.map((stat, idx) => {
              const IconComp = stat.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 md:p-6 text-center hover:bg-white/15 transition-all duration-300"
                >
                  <IconComp className="text-yellow-300 text-2xl md:text-3xl mx-auto mb-2 opacity-90" />
                  <div className="text-2xl md:text-4xl font-extrabold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-amber-100/90 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Nossa História & Propósito */}
      <section className="max-w-5xl mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-14">
          <span className="text-amber-700 font-bold uppercase tracking-wider text-xs md:text-sm">Nossa Origem & Vibe</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-1">
            O Point Onde a Rede é Só o Começo
          </h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-amber-500 to-emerald-600 mx-auto rounded-full mt-3"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          <motion.div 
            className="bg-white rounded-3xl p-8 shadow-xl border border-amber-100/70 flex flex-col justify-between"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-800 text-xl font-bold mb-6 shadow-sm">
                01
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                Nossa Missão
              </h3>
              <p className="text-gray-600 leading-relaxed text-base mb-6">
                Promover o bem-estar físico e mental, a saúde e a integração social através dos esportes de areia. Queremos que cada atleta — seja iniciante nos primeiros toques ou competidor experiente — sinta o calor e o acolhimento de uma verdadeira família.
              </p>
            </div>
            <div className="bg-amber-50/70 rounded-2xl p-4 border-l-4 border-amber-500">
              <p className="text-amber-900 font-semibold italic text-sm">
                "Aqui, a areia transforma o dia a dia em momentos inesquecíveis."
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-3xl p-8 shadow-xl border border-amber-100/70 flex flex-col justify-between"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-800 text-xl font-bold mb-6 shadow-sm">
                02
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Nossa Energia & Filosofia
              </h3>
              <p className="text-gray-600 leading-relaxed text-base mb-6">
                Na Koa House, a energia vai além das linhas da quadra. Planejamos um ambiente completo onde o treino se conecta com a resenha no bar, a música boa e o respeito mútuo. É o refúgio perfeito para recarregar as energias após a rotina agitada.
              </p>
            </div>
            <div className="bg-emerald-50/70 rounded-2xl p-4 border-l-4 border-emerald-500">
              <p className="text-emerald-900 font-semibold italic text-sm">
                "Esporte, amizade e diversão na mesma frequência."
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Nossos Diferenciais */}
      <section className="bg-gradient-to-b from-gray-100/70 via-amber-50/40 to-white py-16 md:py-20 border-y border-gray-200/60">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-amber-700 font-bold uppercase tracking-wider text-xs md:text-sm">Estrutura de Excelência</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-1">
              Por Que Escolher a Koa House?
            </h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-amber-500 to-emerald-600 mx-auto rounded-full mt-3"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {diferenciais.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <motion.div
                  key={idx}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl border border-gray-100 transition-all duration-300 flex flex-col justify-between group"
                  whileHover={{ y: -5 }}
                >
                  <div>
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-2xl flex items-center justify-center text-2xl mb-5 shadow-md group-hover:scale-110 transition-transform duration-300">
                      <IconComp />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Nossos Valores */}
      <section className="max-w-5xl mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-14">
          <span className="text-amber-700 font-bold uppercase tracking-wider text-xs md:text-sm">Nossa Essência</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-1">
            Valores Que Guiam Nossas Passadas
          </h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-amber-500 to-emerald-600 mx-auto rounded-full mt-3"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {valores.map((val, idx) => {
            const IconComp = val.icon;
            return (
              <motion.div
                key={idx}
                className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 text-center flex flex-col items-center hover:shadow-xl transition-shadow duration-300"
                whileHover={{ scale: 1.02 }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${val.color} text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg`}>
                  <IconComp />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {val.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {val.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Galeria de Fotos - Nossa Casa */}
      <section className="bg-gradient-to-b from-white to-amber-50/50 py-16 md:py-20 border-t border-gray-200/50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-amber-700 font-bold uppercase tracking-wider text-xs md:text-sm">Fotos & Momentos</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-1">
              Conheça Nossa Casa
            </h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-amber-500 to-emerald-600 mx-auto rounded-full mt-3"></div>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-sm md:text-base">
              Confira os melhores registros dos nossos treinos, jogos e eventos na Koa House.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-4 md:p-8 shadow-xl border border-amber-100/70">
            <GaleriaSwiper />
          </div>
        </div>
      </section>

      {/* Call to Action Final */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="relative bg-gradient-to-r from-amber-900 via-amber-800 to-emerald-950 rounded-3xl p-8 md:p-14 text-white shadow-2xl overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white via-yellow-100 to-amber-200 bg-clip-text text-transparent">
              Vem Fazer Parte da Família Koa!
            </h2>
            <p className="text-amber-100 text-base md:text-lg mb-8 leading-relaxed">
              Agende uma aula experimental, conheça nossos planos ou venha tomar um drink gelado no nosso bar. A areia está pronta para você!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/planos"
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-gray-950 font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Conheça Nossos Planos
              </Link>
              <a
                href="https://wa.me/5519981924006?text=Olá!%20Vim%20pelo%20site%20e%20gostaria%20de%20saber%20mais%20sobre%20a%20Koa%20House!"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <FaWhatsapp className="text-xl" /> Falar com a Equipe
              </a>
            </div>
          </div>
        </div>
      </section>

      <WhatsappFloat />
    </div>
  );
}

export default SobreNos;
