"use client";

import Image from "../assets/torneio-img.png";

interface Professor {
  name: string;
  description: string;
  imageUrl: string;
}

// Array de professores direto no componente
const professores: Professor[] = [
  {
    name: "Chris",
    description: "Professor conhecido na arena por seus treinos e seu carisma",
    imageUrl: "/images/joao.jpg",
  },
  {
    name: "Vitor Benatti, Vitinho",
    description: "Foco em iniciantes e desenvolvimento físico.",
    imageUrl: "/images/carla.jpg",
  },
  {
    name: "Klebão",
    description: "Treinamentos avançados e preparação para torneios.",
    imageUrl: "/images/bruno.jpg",
  },
  {
    name: "Marra",
    description: "Treinamentos avançados e preparação para torneios.",
    imageUrl: "/images/Marra.jpg"
  },
  {
    name: "Melinho",
    description: "Treinamentos avançados e preparação para torneios.",
    imageUrl: "/images/Marra.jp"
  }
];

// Componente reutilizável de card
function ProfessorCard({ name, description, imageUrl }: Professor) {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col items-center p-6 text-center hover:shadow-xl transition-shadow duration-300 border-yellow-600">
      <div className="w-28 h-28 relative">
        <img src={Image} alt="" className="rounded-full object-cover border-4 border-green-600" />
          
          
        
      </div>
      <h3 className="text-xl font-semibold mt-4 text-gray-800">{name}</h3>
      <p className="text-gray-600 text-sm mt-2">{description}</p>
    </div>
  );
}

// Componente da seção inteira
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
            />
          ))}
        </div>
      </div>
    </section>
  );
}
