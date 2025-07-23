// src/pages/Eventos.tsx

import EventsSection from "../components/EventsSection";
import WhatsappFloat from "../components/WhatsappFloat";

function Eventos() {
    return (
        // Adicionamos um padding vertical para a página não ficar colada na Navbar e no Footer
        <div className="pt-24 pb-12">
            {/* Reutilizamos o componente de seção de eventos que já criamos! */}
            <EventsSection />
            <WhatsappFloat />
        </div>
    );
}

export default Eventos;