import React from 'react';
import { Link } from 'react-router-dom';

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

    return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className={`flex flex-wrap items-center ${orderClass} -mx-4`}>
          {/* Coluna do Texto */}
          <div className="w-full md:w-1/2 px-4 mb-8 md:mb-0">
            <h2 className="text-3xl font-bold text-zinc-800 mb-4">{title}</h2>
            <p className="text-zinc-600 mb-6">{description}</p>
            <Link to={linkTo}>
              <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded">
                {buttonText}
              </button>
            </Link>
          </div>

          {/* Coluna da Imagem */}
          <div className="w-full md:w-1/2 px-4">
            <img src={imageUrl} alt={imageAlt} className="rounded-lg shadow-lg w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default InfoSection;