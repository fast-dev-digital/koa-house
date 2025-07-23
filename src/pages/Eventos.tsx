// src/pages/Eventos.tsx

import EventsSection from "../components/EventsSection";
import WhatsappFloat from "../components/WhatsappFloat";

function Eventos() {
    return (
        // Adicionamos um padding vertical para a página não ficar colada na Navbar e no Footer
        <div className="pt-24 pb-12">
            <div>
                <h2 className="text-3xl font-bold text-center text-zinc-800 mb-6 mt-10">
                    Nossos Eventos Semanais
                </h2>
                <EventsSection mode="page" />
            </div>
            <hr/> 
            <div>
                <h2 className="text-3xl font-bold text-center text-zinc-800 mb-6 mt-10">
                    Nossos Próximos Eventos
                </h2>
                <EventsSection mode="page"/>
            </div>
            
            <WhatsappFloat />
        </div>
    );
}

export default Eventos;