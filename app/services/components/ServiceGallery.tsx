"use client";

import { useState, useRef } from "react";

type Props = { 
  images?: string[]; 
  title: string;
};

export default function ServiceGallery({ images, title }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const gallery = images?.length ? images : ["/anh1.jpeg"];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    setCurrentIndex(Math.round(scrollLeft / width));
  };

  const scrollToImage = (index: number) => {
    if (scrollRef.current) {
      const width = scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({
        left: width * index,
        behavior: 'smooth'
      });
    }
    setCurrentIndex(index);
  };

  return (
    <div className="space-y-6">
      {/* Main Gallery Carousel */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth"
          onScroll={handleScroll}
        >
          {gallery.map((src, i) => (
            <div key={i} className="flex-shrink-0 w-full snap-center">
              <img
                src={src}
                alt={`${title} - ${i + 1}`}
                className="w-full h-72 md:h-[420px] object-cover rounded-2xl"
              />
            </div>
          ))}
        </div>
        
        {/* Dots Indicator */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
          {gallery.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToImage(i)}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                i === currentIndex ? "bg-white w-6" : "bg-gray-500"
              }`}
              aria-label={`Chuyển đến ảnh ${i + 1}`}
            />
          ))}
        </div>

        {/* Image Counter */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <span className="text-white text-sm font-medium">
            {currentIndex + 1} / {gallery.length}
          </span>
        </div>
      </div>

      {/* Thumbnail Gallery */}
      {gallery.length > 1 && (
        <div className="w-full">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">
            Tất cả hình ảnh ({gallery.length})
          </h3>
          
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {gallery.map((image, index) => (
              <button
                key={index}
                onClick={() => scrollToImage(index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`relative aspect-square overflow-hidden rounded-lg bg-gray-800 
                         transition-all duration-300 ease-out
                         focus:outline-none
                         ${currentIndex === index 
                           ? 'ring-2 ring-blue-400 scale-105' 
                           : 'hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30'
                         }`}
              >
                <img
                  src={image}
                  alt={`Hình ${index + 1}`}
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    hoveredIndex === index ? 'scale-110 brightness-110' : 
                    currentIndex === index ? 'brightness-100' : 'brightness-75'
                  }`}
                />
                
                {/* Number Overlay */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-t from-black/70 to-transparent
                             flex items-end justify-center pb-1
                             transition-opacity duration-300 ${
                               hoveredIndex === index || currentIndex === index ? 'opacity-0' : 'opacity-100'
                             }`}
                >
                  <span className="text-white text-xs font-semibold">
                    {index + 1}
                  </span>
                </div>

                {/* Active Indicator */}
                {currentIndex === index && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1.5 right-1.5 bg-blue-500 rounded-full p-1 shadow-lg">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Zoom Icon on Hover */}
                {hoveredIndex === index && currentIndex !== index && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/25 backdrop-blur-sm rounded-full p-2">
                      <svg 
                        className="w-5 h-5 text-white" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                        />
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}