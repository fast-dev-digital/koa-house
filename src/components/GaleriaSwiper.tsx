// src/components/GaleriaSwiper.tsx
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import sobreNos1 from "../assets/SobreNos-1.webp";
import sobreNos2 from "../assets/SobreNos-2.webp";
import sobreNos3 from "../assets/SobreNos-3.webp";
import sobreNos4 from "../assets/SobreNos-4.webp";
import sobreNos5 from "../assets/SobreNos-5.webp";
import sobreNos6 from "../assets/Sobre-Nos-6.webp";

import "swiper/css";
import "swiper/css/navigation";

export default function GaleriaSwiper() {
  const imagens = [
    { src: sobreNos1, alt: "Treino de futevôlei na areia da Koa House" },
    { src: sobreNos2, alt: "Jogadores em ação na quadra de futevôlei" },
    { src: sobreNos3, alt: "Momento de concentração e técnica" },
    { src: sobreNos4, alt: "Atletas praticando futevôlei profissionalmente" },
    { src: sobreNos5, alt: "Ambiente descontraído da Koa House" },
    { src: sobreNos6, alt: "Comunidade Koa reunida para treino" },
  ];

  return (
    <div className="relative w-full max-w-[1200px] h-[200px] md:h-[400px] overflow-hidden rounded-xl mx-auto mt-[20px] px-4">
      <Swiper
        modules={[Navigation]}
        spaceBetween={10}
        slidesPerView={1}
        navigation
        breakpoints={{
          480: { slidesPerView: 1, spaceBetween: 10 },
          640: { slidesPerView: 1, spaceBetween: 15 },
          768: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 3, spaceBetween: 25 },
        }}
      >
        {imagens.map((imagem, index) => (
          <SwiperSlide key={index}>
            <div className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
              <img
                src={imagem.src}
                alt={imagem.alt}
                className="w-full h-40 md:h-64 object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
