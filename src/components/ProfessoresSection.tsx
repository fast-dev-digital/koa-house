"use client";
import chrisImg from "../assets/torneio-img.png";
import vitinhoImg from "../assets/torneio-img.png";
import klebaoImg from "../assets/torneio-img.png";
import marraImg from "../assets/torneio-img.png";
import melinhoImg from "../assets/torneio-img.png";

interface Professor {
  name: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  whatsappLink: string;
}

const professores: Professor[] = [
  {
    name: "Chris",
    description: "Professor conhecido na arena por seus treinos e seu carisma.",
    imageUrl: chrisImg,
    buttonText: "Faça sua aula experimental com o Chris agora!",
    whatsappLink: "https://wa.me/5519981924006?text=Olá%20quero%20fazer%20aula%20experimental%20com%20o%20Chris",
  },
  {
    name: "Vitor Benatti, Vitinho",
    description: "Foco em iniciantes e desenvolvimento físico.",
    imageUrl: vitinhoImg,
    buttonText: "Faça sua aula experimental com o Vitinho agora!",
    whatsappLink: "https://wa.me/5519981924006?text=Olá%20quero%20fazer%20aula%20experimental%20com%20o%20Vitinho",
  },
  {
    name: "Klebão",
    description: "Treinamentos avançados e preparação para torneios.",
    imageUrl: klebaoImg,
    buttonText: "Faça sua aula experimental com o Klebão agora!",
    whatsappLink: "https://wa.me/5519981924006?text=Olá%20quero%20fazer%20aula%20experimental%20com%20o%20Klebão",
  },
  {
    name: "Marra",
    description: "Treinamentos avançados e preparação para torneios.",
    imageUrl: marraImg,
    buttonText: "Faça sua aula experimental com o Marra agora!",
    whatsappLink: "https://wa.me/5519981924006?text=Olá%20quero%20fazer%20aula%20experimental%20com%20o%20Marra",
  },
  {
    name: "Melinho",
    description: "Treinamentos avançados e preparação para torneios.",
    imageUrl: melinhoImg,
    buttonText: "Faça sua aula experimental com o Melinho agora!",
    whatsappLink: "https://wa.me/5519981924006?text=Olá%20quero%20fazer%20aula%20experimental%20com%20o%20Melinho",
  },
];

// Card de professor com botão do WhatsApp
function ProfessorCard({ name, description, imageUrl, buttonText, whatsappLink }: Professor) {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <img src={imageUrl} alt={name} className="w-full h-80 object-cover" />
      <div className="p-6 text-center flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
          <p className="text-gray-600 text-sm mt-2">{description}</p>
        </div>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded transition-colors"
        >
          {buttonText}
        </a>
      </div>
    </div>
  );
}

// Seção de professores
export default function ProfessoresSection() {
  return (
    <section className="min-h-screen px-6 py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {professores.map((professor, index) => (
            <ProfessorCard
              key={index}
              name={professor.name}
              description={professor.description}
              imageUrl={professor.imageUrl}
              buttonText={professor.buttonText}
              whatsappLink={professor.whatsappLink}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
