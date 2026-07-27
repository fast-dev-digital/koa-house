import { Link } from "react-router-dom";
import { FaCheck, FaStar, FaWhatsapp, FaArrowRight } from "react-icons/fa";
import type { Plano } from "../data/planosData";

type PricingCardProps = {
  plano: Plano;
  mode?: "home" | "planos";
};

function PricingCard({ plano, mode = "planos" }: PricingCardProps) {
  const isHighlighted = plano.destacado;

  const whatsappMessage = `Olá! Gostaria de saber mais sobre o plano: ${plano.titulo}.`;
  const whatsappUrl = `https://wa.me/5519981924006?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div
      className={`relative rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1.5 h-full ${
        isHighlighted
          ? "bg-white shadow-2xl border-2 border-amber-400/80 ring-4 ring-amber-400/10"
          : "bg-white/95 shadow-lg border border-gray-200 hover:border-amber-300 hover:shadow-xl"
      }`}
    >
      {/* Badge em destaque */}
      {isHighlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-700 text-white text-xs font-extrabold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-md flex items-center gap-1.5 whitespace-nowrap">
          <FaStar className="text-yellow-300 text-xs" />
          Mais Vantajoso
        </div>
      )}

      <div>
        {/* Tipo do Plano Badge */}
        <div className="flex justify-between items-center mb-3">
          <span className="bg-amber-50 text-amber-800 text-xs font-semibold px-3 py-1 rounded-md border border-amber-200/60">
            {plano.tipo}
          </span>
        </div>

        {/* Título do Plano */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-snug">
          {plano.titulo}
        </h3>

        {/* Preço */}
        <div className="my-4 flex items-baseline gap-1">
          <span className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-zinc-900 to-amber-900 bg-clip-text text-transparent">
            {plano.preco}
          </span>
          {plano.unidade && (
            <span className="text-xs md:text-sm font-medium text-gray-500">
              {plano.unidade}
            </span>
          )}
        </div>

        {/* Divisor */}
        <div className="w-full h-px bg-gray-100 my-4"></div>

        {/* Lista de Recursos/Features */}
        <ul className="space-y-3 mb-6 text-sm text-gray-600">
          {plano.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2.5">
              <div className="mt-0.5 rounded-full p-1 bg-emerald-100 text-emerald-700 flex-shrink-0">
                <FaCheck className="text-xs" />
              </div>
              <span className="leading-snug text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Botão de Ação */}
      <div className="mt-auto pt-4">
        {mode === "home" ? (
          <Link
            to="/planos"
            className={`w-full inline-flex items-center justify-center gap-2 font-bold py-3 px-5 rounded-xl transition-all duration-300 text-sm shadow-md hover:shadow-lg ${
              isHighlighted
                ? "bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white"
                : "bg-gray-900 hover:bg-amber-800 text-white"
            }`}
          >
            <span>VER PLANOS</span>
            <FaArrowRight className="text-xs" />
          </Link>
        ) : (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full inline-flex items-center justify-center gap-2 font-bold py-3.5 px-5 rounded-xl transition-all duration-300 text-sm shadow-md hover:shadow-lg ${
              isHighlighted
                ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white"
                : "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white"
            }`}
          >
            <FaWhatsapp className="text-lg text-white" />
            <span>SOLICITAR PLANO</span>
          </a>
        )}
      </div>
    </div>
  );
}

export default PricingCard;
