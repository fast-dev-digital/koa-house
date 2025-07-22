import React, {useState, useEffect} from 'react';
import WhatsappFloat from '../components/WhatsappFloat';
import imgTorneio from '../assets/torneio-img.png';

function SobreNos() {
    return (
        <div className='pt-20 px-10'>
            <div className='bg-green-500 text-white rounded-xl p-4 inline-block mb-5 shadow-md'>
                <h1 className='text-2xl font-bold'>Sobre a cultura da Arena Brazuka</h1>
            </div>
            <p className='text-sm text-gray-700 text-justify p-4'>
                Somos uma arena de futevôlei focada em promover bem-estar, esporte e comunidade. Nossa missão é criar um espaço onde todos se sintam bem-vindos.
                
                Aqui é mais do que uma quadra. É mais do que um espaço esportivo. Aqui é a Arena Brazuka — o point onde o futevôlei encontra a vibe da comunidade.
                
                Nossa missão? Promover o bem-estar, o esporte e a conexão entre pessoas. Queremos que cada atleta, iniciante ou profissional, se sinta em casa. Que cada risada ecoe nas quadras e cada treino vire uma lembrança daquelas!
                
                Na Brazuka, o sol brilha forte, mas nossa energia vai além. Acreditamos no poder do esporte pra transformar dias, hábitos e vidas. E por isso, montamos um ambiente onde você pode jogar, relaxar, socializar e, claro, tomar aquela gelada com os amigos.
                
                Somos comprometidos com a qualidade — desde o atendimento até o cuidado com cada detalhe da estrutura. Valorizamos quem faz parte da nossa história: os alunos, os professores, os parceiros, os amigos.
                
                Então se você busca mais do que só um espaço pra jogar, se você quer fazer parte de uma família apaixonada pelo futevôlei. Seja bem-vindo à Brazuka. Aqui, a rede é só o começo.
                
                Arena Brazuka — esporte, vibe e comunidade.
                
            </p>
            <hr className='my-4 border-gray-300'/>
            <div className='bg-green-500 text-white rounded-xl p-4 inline-block mb-5 shadow-md'>
                <h2 className='text-2xl font-bold'>Imagens da nossa casa!</h2>
            </div>
            <div className='flex flex-wrap gap-4'>
                <div className='bg-white rounded-xl p-4 shadow-md'>
                    <img src={imgTorneio} alt="Equipe de futevôlei" className='w-full h-48 object-cover rounded-xl mb-5' />
                </div>
            </div>
            <WhatsappFloat />

        </div>
    );
}

export default SobreNos;