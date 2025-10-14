

import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Controller } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';

import { cn } from '@/lib/utils';
import type { Option } from '@/lib/types';

interface ThemePickerProps {
  options: Option[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  colorClass: string;
}

export function ThemePicker({ options, selectedIndex, onSelect, colorClass }: ThemePickerProps) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);

  useEffect(() => {
    if (swiper && !swiper.destroyed) {
      swiper.slideToLoop(selectedIndex, 300, false);
    }
  }, [selectedIndex, swiper]);
  
  const handleSlideChange = (s: SwiperType) => {
    onSelect(s.realIndex);
  };
  
  const colorMap: { [key: string]: string } = {
      'yellow': 'border-yellow-500 text-yellow-700 bg-yellow-50',
      'blue': 'border-blue-500 text-blue-700 bg-blue-50',
      'green': 'border-green-500 text-green-700 bg-green-50',
  }

  return (
    <div className="h-64 w-full relative">
       <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-20 rounded-lg border-2 z-10 pointer-events-none", colorMap[colorClass])} />
        <Swiper
            onSwiper={setSwiper}
            modules={[Controller]}
            direction="vertical"
            loop={true}
            slidesPerView={3}
            centeredSlides={true}
            onSlideChange={handleSlideChange}
            className="h-full"
        >
        {options.map((option, index) => (
          <SwiperSlide key={option.id} className="flex items-center justify-center">
            {({ isActive }) => (
              <div className={cn(
                  "text-center transition-opacity duration-300",
                  isActive ? "opacity-100" : "opacity-30"
              )}>
                <p className={cn("font-semibold transition-transform duration-300", isActive ? "text-xl" : "text-lg")}>
                  {option.label}
                </p>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
