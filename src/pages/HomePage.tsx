import Navbar from '../components/Navbar';
import Hero from '../components/Hero';

function HomePage() {
    return (
        <div>
            {/*Importando componentes para a homepage*/}
            <Navbar />
            <Hero />
            {/*Aqui depois adicionaremos outras seções como Eventos, Aulas, Grade, etc*/}
        </div>
    );
}

export default HomePage;