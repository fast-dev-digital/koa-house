// src/components/GaleriaSwiper.tsx
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import img1 from '../assets/torneio-img.png'

import 'swiper/css'
import 'swiper/css/navigation'

export default function GaleriaSwiper() {
  const imagens = [
    img1,
    img1,
    img1,
    img1,
    img1,
    img1,
  ]

  return (
    <div className="  relative w-full max-w-[1200px] h-[50px] md:h-[400px] overflow-hidden rounded-xl mx-auto mt-[65px]">
      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {imagens.map((src, index) => (
          <SwiperSlide key={index}>
            <div className="rounded-lg overflow-hidden shadow-md">
              <img
                src={src}
                alt={`Imagem ${index + 1}`}
                className="w-full h-64 object-cover"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
