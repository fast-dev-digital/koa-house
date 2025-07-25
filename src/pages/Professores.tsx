import React, {useState, useEffect} from 'react';
import InfoSection from "../components/InfoSection";
import WhatsappFloat from "../components/WhatsappFloat";

import imgChris from "../assets/ft-chris.jpeg";
import imgVitinho from "../assets/ft-vitinho.jpeg";
import imgKlebao from "../assets/ft-klebao.png";
import imgMarra from "../assets/ft-marra.png";
import imgMello from "../assets/ft-mellinho.png";

function Professores() {
    return (
        <div className="pt-20 px-4 md:px-10 relative mt-10">
            <div className='bg-green-500 text-white rounded-xl p-4 inline-block mb-5 shadow-md'>
                <h2 className='text-2xl font-bold'>Nosso time de professores</h2>
            </div>
                {/*Chris*/}
                <InfoSection
                title="Professor Chris"
                description="Escolha seu horário e aproveite nossas quadras premium para jogar com os amigos. Estrutura moderna, bar e estacionamento seguro!"
                buttonText="FAÇA SUA AULA EXPERIMENTAL COM O PROF° CHRIS AGORA!"
                imageUrl={imgChris}
                imageAlt="Foto do professor Chris"
                linkTo="https://wa.me/5519981924006?text=Olá%20quero%20fazer%20aula%20experimental%20com%20o%20Chris"
                />
    
                {/*Vitinho*/}
                <InfoSection
                title="Professor Vitinho"
                description="Escolha seu horário e aproveite nossas quadras premium para jogar com os amigos. Estrutura moderna, bar e estacionamento seguro!"
                buttonText="FAÇA SUA AULA EXPERIMENTAL COM O PROF° VITINHO AGORA!"
                imageUrl={imgVitinho}
                imageAlt="Foto do professor Victor"
                linkTo="https://wa.me/5519981924006?text=Olá%20quero%20fazer%20aula%20experimental%20com%20o%20Vitinho"
                reverse={true}
                />

                {/*Klebão*/}
                <InfoSection
                title="Professor Klebão"
                description="Escolha seu horário e aproveite nossas quadras premium para jogar com os amigos. Estrutura moderna, bar e estacionamento seguro!"
                buttonText="FAÇA SUA AULA EXPERIMENTAL COM O PROF° KLEBÃO AGORA!"
                imageUrl={imgKlebao}
                imageAlt="Foto do professor Kleber"
                linkTo="https://wa.me/5519981924006?text=Olá%20quero%20fazer%20aula%20experimental%20com%20o%20Klebão"                
                />

                {/*Marra*/}
                <InfoSection
                title="Professor Marra"
                description="Escolha seu horário e aproveite nossas quadras premium para jogar com os amigos. Estrutura moderna, bar e estacionamento seguro!"
                buttonText="FAÇA SUA AULA EXPERIMENTAL COM O PROF° MARRA AGORA!"
                imageUrl={imgMarra}
                imageAlt="Foto do professor Marra"
                linkTo="https://wa.me/5519981924006?text=Olá%20quero%20fazer%20aula%20experimental%20com%20o%20Marra"
                reverse={true}
                />

                {/*Melinho*/}
                <InfoSection
                title="Professor Mellinho"
                description="Escolha seu horário e aproveite nossas quadras premium para jogar com os amigos. Estrutura moderna, bar e estacionamento seguro!"
                buttonText="FAÇA SUA AULA EXPERIMENTAL COM O PROF° MELLINHO AGORA!"
                imageUrl={imgMello}
                imageAlt="Foto do professor Mello"
                linkTo="https://wa.me/5519981924006?text=Olá%20quero%20fazer%20aula%20experimental%20com%20o%20Mellinho"
                />
            
            <WhatsappFloat />
        </div>
    );
}
export default Professores;
