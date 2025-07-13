import React from "react";
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';

function HomePage() {
    return (
        <div>
            <Navbar />
            <Hero />
            {/*Aqui depois adicionaremos outras seções como Eventos, Aulas, Grade, etc*/}
        </div>
    );
}

export default HomePage;