import React from "react";
import WhatsappFloat from "../components/WhatsappFloat";
import ProfessoresSection from "../components/ProfessoresSection";

function Professores() {
    return (
        <div className="pt-20 px-4 md:px-10 relative mt-10">
            <div className='bg-green-500 text-white rounded-xl p-4 inline-block mb-5 shadow-md'>
                <h2 className='text-2xl font-bold'>Nosso time de professores</h2>
            </div>
            <ProfessoresSection />
            <WhatsappFloat />
        </div>
    );
}
export default Professores;
