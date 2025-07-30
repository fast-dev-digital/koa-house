import {useState, useEffect} from 'react';
import Navbar from '../components/Navbar';
import InfoSection from '../components/InfoSection';
import EventsSection from '../components/EventsSection';
import PricingCard from '../components/PricingCard';
import { planos } from '../data/planosData';

import Modal from '../components/Modal';
import WhatsappFloat from '../components/WhatsappFloat';
import HeroCarousel from '../components/HeroCarousel';

import imgTeste from '../assets/torneio-img.png';
import modalTeste from '../assets/interno-img.png';

function HomePage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        setIsModalOpen(true); // Define o estado como 'aberto'
    }, []); // O array vazio [] garante que isso só rode uma vez, na montagem do componente
    return (
        <div>
            {/*Importando componentes para a homepage*/}
            <Navbar />
            <HeroCarousel />
            <InfoSection
                title="Reserve sua quadra de areia"
                description="Escolha seu horário e aproveite nossas quadras premium para jogar com os amigos. Estrutura moderna, bar e estacionamento seguro!"
                buttonText="RESERVE AGORA"
                imageUrl={imgTeste}
                imageAlt="Pessoas jogando em uma quadra de areia"
                linkTo="https://wa.me/5519981924006?text=Olá%20quero%20reservar%20uma%20quadra%20"
            />
            
            <InfoSection 
                title="Aprenda e evolua no futevôlei"
                description="Aulas para iniciantes e avançados, com professores experientes. Venha aprimorar suas habilidades e se divertir!"
                buttonText="AGENDE SUA AULA"
                imageUrl={imgTeste}
                imageAlt="Equipe de ftv posando para a foto"
                linkTo="https://wa.me/5519981924006?text=Olá%20quero%20fazer%20aula%20experimental%20"
                reverse={true}  // Usamos o reverse para inverter a ordem da imagem e do texto
            />

            <InfoSection 
                title="Entre na onda do Beach Tennis"
                description="Treinos animados para quem quer aprender ou evoluir no esporte que mais cresce no Brasil!"
                buttonText="QUERO JOGAR"
                imageUrl={imgTeste}
                imageAlt="Equipe de beach tennis posando para foto"
                linkTo="https://wa.me/5519981924006?text=Olá%20quero%20saber%20sobre%20as%20aulas%20de%20beach%20tennis%20"
            />

            {/* Seção de Planos em Destaque */}
            <div className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-zinc-800 mb-6">
                    Planos em Destaque
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {planos.filter(plano => plano.destacado).map(plano => (
                        <PricingCard key={plano.titulo} plano={plano} mode="home"/>
                    ))}
                    </div>
                </div>
            </div>

            {/* Seção de Eventos */}
            <div>
            <h2 className="text-3xl font-bold text-center text-zinc-800 mb-6 mt-10">
                 Nossos Próximos Eventos
            </h2>
                <EventsSection mode='home' />
            </div>

            {/* Componente Modal aqui */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                {/* Este é o conteúdo que aparecerá dentro do pop-up */}
                <h3 className="text-2xl font-bold text-zinc-800 mb-4 text-center">Nosso Torneio Interno!</h3>
                <img src={modalTeste} alt="Anúncio de torneio interno" className="w-full rounded-md mb-4" />
                <p className="text-zinc-600 text-center">
                Ei, aluno! Participe do melhor torneio interno da região, que ocorrerá nos dias 30 e 31 de Agosto, com muita resenha, futevôlei e brindes para os campeões!
                </p>
            </Modal>
            <WhatsappFloat />
            {/*Aqui depois adicionaremos outras seções como Eventos, Aulas, Grade, etc*/}
        </div>
    );
}

export default HomePage;    