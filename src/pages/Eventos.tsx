// src/pages/Eventos.tsx

import EventsSection from "../components/EventsSection";

function Eventos() {
    return (
        // Adicionamos um padding vertical para a página não ficar colada na Navbar e no Footer
        <div className="pt-24 pb-12">
            {/* Reutilizamos o componente de seção de eventos que já criamos! */}
            <EventsSection />
        </div>
    );
}

export default Eventos;