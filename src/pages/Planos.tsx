import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaVolleyballBall, 
  FaTableTennis, 
  FaCalendarAlt, 
  FaChevronDown, 
  FaWhatsapp, 
  FaCheckCircle, 
  FaRegLightbulb 
} from 'react-icons/fa';
import { planos } from '../data/planosData';
import PricingCard from '../components/PricingCard';
import WhatsappFloat from '../components/WhatsappFloat';

type CategoriaFiltro = 'Todos' | 'Futevôlei' | 'Beach Tennis' | 'Locação';

function PlanosPage() {
  const [filtro, setFiltro] = useState<CategoriaFiltro>('Todos');
  const [faqAberto, setFaqAberto] = useState<number | null>(null);

  const categorias: { id: CategoriaFiltro; label: string; icon: any }[] = [
    { id: 'Todos', label: 'Todos os Planos', icon: FaCheckCircle },
    { id: 'Futevôlei', label: 'Futevôlei', icon: FaVolleyballBall },
    { id: 'Beach Tennis', label: 'Beach Tennis', icon: FaTableTennis },
    { id: 'Locação', label: 'Locação de Quadra', icon: FaCalendarAlt },
  ];

  const planosFiltrados = filtro === 'Todos' 
    ? planos 
    : planos.filter(plano => plano.tipo === filtro);

  const faqs = [
    {
      pergunta: "Como funciona a aula experimental?",
      resposta: "Você pode agendar sua primeira aula experimental sem compromisso! Basta clicar no botão do WhatsApp em qualquer plano e nossa equipe agendará o melhor horário com o professor de sua preferência."
    },
    {
      pergunta: "Preciso levar bolas ou raquetes para o treino/jogo?",
      resposta: "Não se preocupe! A Koa House fornece todas as bolas oficiais higienizadas e materiais de apoio necessários para as aulas e locações."
    },
    {
      pergunta: "Quais são as formas de pagamento disponíveis?",
      resposta: "Aceitamos PIX, cartão de débito e cartão de crédito com opção de cobrança recorrente sem comprometer o limite total do seu cartão."
    },
    {
      pergunta: "Como funciona a locação de quadra com churrasqueira?",
      resposta: "Oferecemos o combo exclusivo de 1 hora (ou mais) de quadra acompanhado de acesso ao nosso Espaço Gourmet completo. Perfeito para confraternizações com amigos e aniversários!"
    }
  ];

  const toggleFaq = (idx: number) => {
    setFaqAberto(faqAberto === idx ? null : idx);
  };

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
              <FaRegLightbulb className="text-yellow-400" /> Transparência & Flexibilidade
            </span>
            <h1 className="text-3xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white via-yellow-100 to-amber-200 bg-clip-text text-transparent">
              Escolha Seu Plano Ideal
            </h1>
            <p className="text-base md:text-lg text-amber-100 max-w-2xl mx-auto leading-relaxed font-light mb-6">
              Aulas de Futevôlei, Beach Tennis e Locação de Quadras com estrutura completa de areia e bar. Vem pra areia!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Container Principal */}
      <div className="max-w-6xl mx-auto px-4 mt-10 md:mt-12">
        {/* Filtros por Categoria */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10">
          {categorias.map(cat => {
            const IconComp = cat.icon;
            const isSelected = filtro === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFiltro(cat.id)}
                className={`py-2.5 px-5 rounded-full font-bold text-xs md:text-sm transition-all duration-300 flex items-center gap-2 shadow-sm ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-600 to-amber-800 text-white shadow-md scale-105'
                    : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-200 hover:border-amber-300'
                }`}
              >
                <IconComp className={isSelected ? "text-yellow-300 text-sm" : "text-amber-600 text-sm"} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Grid de Planos */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch"
        >
          <AnimatePresence>
            {planosFiltrados.map((plano) => (
              <motion.div
                key={plano.titulo}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="h-full flex"
              >
                <PricingCard plano={plano} mode="planos" />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Seção FAQ (Perguntas Frequentes) */}
        <section className="mt-20 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-amber-700 font-bold uppercase tracking-wider text-xs md:text-sm">Tire Suas Dúvidas</span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 mt-1">
              Perguntas Frequentes
            </h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-amber-500 to-emerald-600 mx-auto rounded-full mt-3"></div>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = faqAberto === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl shadow-md border border-gray-200/80 overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left p-5 flex justify-between items-center font-bold text-gray-800 text-base md:text-lg hover:text-amber-800 focus:outline-none"
                  >
                    <span>{faq.pergunta}</span>
                    <FaChevronDown
                      className={`text-amber-600 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-gray-600 text-sm md:text-base leading-relaxed border-t border-gray-100 pt-3">
                      {faq.resposta}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Banner CTA Final */}
        <section className="mt-16 bg-gradient-to-r from-amber-900 via-amber-800 to-emerald-950 rounded-3xl p-8 md:p-12 text-white text-center shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-2xl md:text-4xl font-extrabold mb-3 bg-gradient-to-r from-white via-yellow-100 to-amber-200 bg-clip-text text-transparent">
              Ficou com Alguma Dúvida?
            </h3>
            <p className="text-amber-100 text-sm md:text-base mb-6">
              Nossa equipe está pronta para te atender e encontrar a melhor opção de horário para seu treino ou jogo!
            </p>
            <a
              href="https://wa.me/5519981924006?text=Olá!%20Gostaria%20de%20tirar%20dúvidas%20sobre%20os%20planos%20da%20Koa%20House."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <FaWhatsapp className="text-xl" /> Falar Direto no WhatsApp
            </a>
          </div>
        </section>
      </div>

      <WhatsappFloat />
    </div>
  );
}

export default PlanosPage;