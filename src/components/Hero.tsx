import backgroundImageUrl from '../assets/torneio-img.png';

function Hero() {
    return (
        <section
            className="h-screen bg-cover bg-center flex items-center text-white"
            style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,1)), url(${backgroundImageUrl})` }}
        >
            <div className="container mx-auto px-4">
                <div className="max-w-xl">
                    <h1 className="text-5xl font-bold mb-4">Viva o melhor do Esporte na Areia</h1>
                    <p className="text-lg mb-8">
                        Treine, jogue e se divirta nas melhores quadras de areia da região, aproveitando
                        uma estrutura completa com bar, área gourmet, loja esportiva e estacionamento
                        seguro. Mais conforto, mais diversão, mais esporte!
                    </p>
                    <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded">
                        FALE COM A GENTE
                    </button>
                </div>
            </div>
        </section>
    );
}

export default Hero;