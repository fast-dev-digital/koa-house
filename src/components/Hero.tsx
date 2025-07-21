import backgroundImageUrl from '../assets/torneio-img.png';

function Hero() {
    return (
        <section className="py-16 bg-white pt-20">
            <div
                className="relative max-w-5xl mx-auto rounded-xl overflow-hidden min-h-[550px] flex items-center justify-center bg-cover bg-center"
                style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,1)), url(${backgroundImageUrl})` }}
            >
                <div className="text-center text-white drop-shadow-lg z-10 px-4 pt-40 pb-16 w-full ">
                    <h1 className="text-5xl font-bold mb-4">Viva o melhor do Esporte na Areia</h1>
                    <p className="text-lg mb-8">
                        Treine, jogue e se divirta nas melhores quadras de areia da região, aproveitando
                        uma estrutura completa com bar, área gourmet, loja esportiva e estacionamento
                        seguro. Mais conforto, mais diversão, mais esporte!
                    </p>
                    <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded shadow-md">
                        FALE COM A GENTE
                    </button>
                </div>
            </div>
        </section>
    );
}

export default Hero;