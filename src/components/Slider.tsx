import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Slider, Banner } from "../types";

interface SliderProps {
  sliders: Slider[];
  banners: Banner[];
  onSliderClick: (linkUrl: string) => void;
}

export default function AppSlider({ sliders, banners, onSliderClick }: SliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (sliders.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliders.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [sliders]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? sliders.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliders.length);
  };

  if (sliders.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 max-w-7xl mx-auto px-4 py-4">
      {/* Dynamic Slide Carousel Column (3/4 on large screens) */}
      <div className="lg:col-span-3 relative bg-gray-100 rounded-xl overflow-hidden h-[250px] sm:h-[350px] group shadow-sm">
        {sliders.map((slide, idx) => (
          <div
            key={slide.id}
            onClick={() => onSliderClick(slide.linkUrl)}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out cursor-pointer ${
              idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Visual Background Cover Image */}
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover transform hover:scale-105 transition duration-10000"
              referrerPolicy="no-referrer"
            />
            {/* Ambient Dark Gradient Overlayer */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex flex-col justify-center px-6 sm:px-12 text-white">
              <span className="inline-flex items-center gap-1 bg-orange-600 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider mb-2 w-max animate-bounce">
                <Sparkles size={10} /> Exclusive Offer
              </span>
              <h2 className="text-xl sm:text-4xl font-extrabold tracking-tight max-w-lg mb-2 leading-tight">
                {slide.title}
              </h2>
              <p className="text-xs sm:text-lg text-gray-200 mb-6 max-w-md font-medium leading-relaxed">
                {slide.subtitle}
              </p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSliderClick(slide.linkUrl);
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm py-2 px-5 sm:py-2.5 sm:px-6 rounded-lg transition duration-200 w-max shadow-md"
              >
                পণ্য দেখুন (Shop Now)
              </button>
            </div>
          </div>
        ))}

        {/* Carousel Slide Left Arrow Buttons */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/80 text-white hover:text-gray-900 p-1.5 sm:p-2 rounded-full z-20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition focus:outline-none"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Carousel Slide Right Arrow Buttons */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/80 text-white hover:text-gray-900 p-1.5 sm:p-2 rounded-full z-20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition focus:outline-none"
        >
          <ChevronRight size={20} />
        </button>

        {/* Carousel Slide Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
          {sliders.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide(idx);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide ? "w-6 bg-orange-600" : "w-2 bg-white/60"
              } focus:outline-none`}
            />
          ))}
        </div>
      </div>

      {/* Side Dynamic Promotional Banners Column (1/4 on large screens) */}
      <div className="hidden lg:flex flex-col gap-4">
        {banners.slice(0, 2).map((banner) => (
          <div
            key={banner.id}
            onClick={() => onSliderClick(banner.linkUrl)}
            className="flex-1 bg-orange-50 rounded-xl overflow-hidden relative cursor-pointer group shadow-sm hover:shadow-md transition h-[167px]"
          >
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
              referrerPolicy="no-referrer"
            />
            {/* Soft Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10 flex flex-col justify-end p-4 text-white">
              <h3 className="font-bold text-sm tracking-tight line-clamp-1 mb-1">
                {banner.title}
              </h3>
              <span className="text-xs text-orange-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition duration-250">
                Explore Deal &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
