import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";  // <=== IMPORTA DE 'swiper/modules'

// Importa o CSS do swiper
import "swiper/swiper-bundle.css";

function HeroCarousel() {
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 4000 }}
      loop
      className="h-[400px] md:h-[600px]"
    >
      <SwiperSlide>
        <div
          className="bg-[url('assets/torneio-img.png')] bg-cover bg-center h-full flex items-center justify-center text-white text-4xl font-bold"
        >
          Seja Bem-vindo à Arena Brazuka!
        </div>
      </SwiperSlide>

      <SwiperSlide>
        <div
          className="bg-[url('assets/torneio-img.png')] bg-cover bg-center h-full flex items-center justify-center text-white text-4xl font-bold"
        >
          Reserve sua quadra de areia agora mesmo
        </div>
      </SwiperSlide>

      <SwiperSlide>
        <div
          className="bg-[url('assets/torneio-img.png')] bg-cover bg-center h-full flex items-center justify-center text-white text-4xl font-bold"
        >
          Aprenda futevôlei com nossos melhores professores
        </div>
      </SwiperSlide>
    </Swiper>
  );
}

export default HeroCarousel;
