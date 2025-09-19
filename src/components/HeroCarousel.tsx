import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/swiper-bundle.css";
import BackgroundImage1 from "../assets/torneio-img.png";
import BackgroundImage2 from "../assets/torneio-img.png";
import BackgroundImage3 from "../assets/torneio-img.png";

function HeroCarousel() {
  return (
    <section className="mt-[80px]">
      <div className="relative w-full max-w-[1100px] h-[400px] md:h-[500px] overflow-hidden rounded-xl mx-auto">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000 }}
          loop
          className="w-full h-full"
        >
          {/* Slide 1 */}
          <SwiperSlide>
            <div
              className="w-full h-full bg-cover bg-center flex flex-col gap-4 md:gap-6 items-center justify-center text-white text-center px-4"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${BackgroundImage1})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <h2 className="text-2xl md:text-6xl font-bold">
                Viva o melhor do Esporte na Areia
              </h2>
              <p className="max-w-2xl text-sm md:text-lg">
                Treine, jogue e se divirta nas melhores quadras de areia da
                região. Bar, loja, estacionamento e diversão garantida!
              </p>
              <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold text-xs md:text-base py-2 md:py-3 px-4 md:px-6 rounded shadow-md">
                FALE COM A GENTE
              </button>
            </div>
          </SwiperSlide>

          {/* Slide 2 */}
          <SwiperSlide>
            <div
              className="w-full h-full bg-cover bg-center flex flex-col gap-4 md:gap-6 items-center justify-center text-white text-center px-4"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${BackgroundImage2})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <h2 className="text-2xl md:text-6xl font-bold">
                Reserve sua quadra de areia agora mesmo
              </h2>
              <p className="max-w-2xl text-sm md:text-lg">
                Agendamento rápido, direto pelo site, sem estresse nem filas!
              </p>
              <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold text-xs md:text-base py-2 md:py-3 px-4 md:px-6 rounded shadow-md">
                FALE COM A GENTE
              </button>
            </div>
          </SwiperSlide>

          {/* Slide 3 */}
          <SwiperSlide>
            <div
              className="w-full h-full bg-cover bg-center flex flex-col gap-4 md:gap-6 items-center justify-center text-white text-center px-4"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${BackgroundImage3})`,
              }}
            >
              <h2 className="text-2xl md:text-6xl font-bold">
                Aprenda futevôlei com nossos professores
              </h2>
              <p className="max-w-2xl text-sm md:text-lg">
                Aulas para iniciantes e avançados, com professores experientes.
              </p>
              <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold text-xs md:text-base py-2 md:py-3 px-4 md:px-6 rounded shadow-md">
                FALE COM A GENTE
              </button>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </section>
  );
}

export default HeroCarousel;
