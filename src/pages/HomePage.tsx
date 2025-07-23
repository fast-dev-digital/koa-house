import React, {useState, useEffect} from 'react';
import Navbar from '../components/Navbar';
import InfoSection from '../components/InfoSection';
import EventsSection from '../components/EventsSection';

import Modal from '../components/Modal';
import WhatsappFloat from '../components/WhatsappFloat';
import HeroCarousel from '../components/HeroCarousel';

import imgTeste from '../assets/torneio-img.png';
import modalTeste from '../assets/almoco-img.jpeg';

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
                linkTo="/reservas"
            />
            
            <InfoSection 
                title="Aprenda e evolua no futevôlei"
                description="Aulas para iniciantes e avançados, com professores experientes. Venha aprimorar suas habilidades e se divertir!"
                buttonText="AGENDE SUA AULA"
                imageUrl={imgTeste}
                imageAlt="Equipe de ftv posando para a foto"
                linkTo=""
                reverse={true}  // Usamos o reverse para inverter a ordem da imagem e do texto
            />

            <InfoSection 
                title="Entre na onda do Beach Tennis"
                description="Treinos animados para quem quer aprender ou evoluir no esporte que mais cresce no Brasil!"
                buttonText="QUERO JOGAR"
                imageUrl={imgTeste}
                imageAlt="Equipe de beach tennis posando para foto"
                linkTo=""
            />
            <div>
            <h2 className="text-3xl font-bold text-center text-zinc-800 mb-6 mt-10">
                 Nossos Próximos Eventos
            </h2>
                <EventsSection mode='home' />
            </div>
          

            {/* 6. Adicione o componente Modal aqui */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                {/* Este é o conteúdo que aparecerá dentro do pop-up */}
                <h3 className="text-2xl font-bold text-zinc-800 mb-4 text-center">Almoço Executivo!</h3>
                <img src={modalTeste} alt="Anúncio de almoço executivo" className="w-full rounded-md mb-4" />
                <p className="text-zinc-600 text-center">
                De segunda a sexta, das 11h às 14h. Pratos deliciosos a partir de R$ 25,00. Venha conferir!
                </p>
            </Modal>
            <WhatsappFloat />
            {/*Aqui depois adicionaremos outras seções como Eventos, Aulas, Grade, etc*/}
        </div>
    );
}

export default HomePage;    