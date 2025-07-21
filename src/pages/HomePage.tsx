import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import InfoSection from '../components/InfoSection';
import EventsSection from '../components/EventsSection';

import imgTeste from '../assets/torneio-img.png';

function HomePage() {
    return (
        <div>
            {/*Importando componentes para a homepage*/}
            <Navbar />
            <Hero />
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

            <EventsSection />

            {/*Aqui depois adicionaremos outras seções como Eventos, Aulas, Grade, etc*/}
        </div>
    );
}

export default HomePage;