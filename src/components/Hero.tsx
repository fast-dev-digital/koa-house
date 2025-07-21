import backgroundImageUrl from '../assets/torneio-img.png';

function Hero() {
    return (
        <section
            className="min-h-screen w-full flex items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,1)), url(${backgroundImageUrl})` }}
        >
            {/* Fora do container centralizado! */}
            <div
                style={{ backgroundImage: `url(${backgroundImageUrl})` }}
                className="fixed inset-0 min-h-screen w-full bg-cover bg-center -z-10"
            ></div>

            <div className="relative flex items-center justify-center min-h-screen">
                <div className="w-full max-w-md bg-white rounded-lg shadow-md p-4 sm:p-8 mx-2 sm:mx-auto">
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