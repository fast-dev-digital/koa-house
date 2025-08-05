
import WhatsappFloat from '../components/WhatsappFloat';
import GaleriaSwiper from '../components/GaleriaSwiper';

function SobreNos() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-emerald-900 to-amber-800 text-white">
                <div className="max-w-6xl mx-auto px-4 md:px-8 pt-24 pb-16">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-black mb-4">
                            Sobre a Arena Brazuka
                        </h1>
                        <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                            Mais do que uma quadra, somos uma comunidade apaixonada pelo futevôlei
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
                {/* Nossa História */}
                <div className="mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                            Nossa História
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-amber-500 mx-auto rounded-full"></div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                    <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
                                    Nossa Missão
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Promover o bem-estar, o esporte e a conexão entre pessoas. Queremos que cada atleta, 
                                    iniciante ou profissional, se sinta em casa.
                                </p>
                            </div>
                            
                            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                    <div className="w-3 h-3 bg-amber-500 rounded-full mr-3"></div>
                                    Nossa Energia
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Na Brazuka, o sol brilha forte, mas nossa energia vai além. Acreditamos no poder 
                                    do esporte para transformar dias, hábitos e vidas.
                                </p>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6">
                                O Point do Futevôlei
                            </h3>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Aqui é mais do que uma quadra. É mais do que um espaço esportivo. 
                                Aqui é a Arena Brazuka — o point onde o futevôlei encontra a vibe da comunidade.
                            </p>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Montamos um ambiente onde você pode jogar, relaxar, socializar e, claro, 
                                tomar aquela gelada com os amigos.
                            </p>
                            <div className="bg-gradient-to-r from-emerald-50 to-amber-50 rounded-xl p-4 border-l-4 border-emerald-500">
                                <p className="text-gray-700 font-medium italic">
                                    "Aqui, a rede é só o começo."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nossos Valores */}
                <div className="mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                            Nossos Valores
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-amber-500 mx-auto rounded-full"></div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">Comunidade</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Valorizamos quem faz parte da nossa história: alunos, professores, parceiros e amigos.
                            </p>
                        </div>
                        
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">Qualidade</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Comprometidos com a excelência, desde o atendimento até cada detalhe da estrutura.
                            </p>
                        </div>
                        
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">Paixão</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Uma família apaixonada pelo futevôlei, onde cada treino vira uma lembrança especial.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Galeria */}
                <div className="mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                            Nossa Casa
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-amber-500 mx-auto rounded-full"></div>
                        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                            Conheça os espaços onde a magia acontece. Cada canto foi pensado para proporcionar 
                            a melhor experiência no futevôlei.
                        </p>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                        <GaleriaSwiper />
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center bg-gradient-to-r from-emerald-900 to-amber-800 rounded-2xl p-12 text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Faça Parte da Família Brazuka
                    </h2>
                    <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                        Se você busca mais do que só um espaço para jogar, se você quer fazer parte de uma 
                        família apaixonada pelo futevôlei, seja bem-vindo à Brazuka.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a 
                            href="/planos" 
                            className="bg-white text-emerald-900 font-bold py-4 px-8 rounded-xl hover:bg-gray-100 transition-colors duration-300"
                        >
                            Conheça Nossos Planos
                        </a>
                        <a 
                            href="/eventos" 
                            className="border-2 border-white text-white font-bold py-4 px-8 rounded-xl hover:bg-white hover:text-emerald-900 transition-colors duration-300"
                        >
                            Veja Nossos Eventos
                        </a>
                    </div>
                </div>
            </div>
            
            <WhatsappFloat />
        </div>
    );
}

export default SobreNos;