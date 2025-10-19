"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface SpecialEvent {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  thumbnail: string;
  rating: string;
  quality: string;
  ageRating: string;
  year: string;
  duration: string;
  description?: string;
}

const specialEvents: SpecialEvent[] = [
  {
    id: "1",
    title: "Hành Trình Rực Rỡ Ta Đã Yêu",
    subtitle: "A Big Bold Beautiful Journey",
    image: "/images/events/event1-hero.jpg",
    thumbnail: "/images/events/event1-thumb.jpg",
    rating: "IMDb 6.1",
    quality: "4K",
    ageRating: "T16",
    year: "2025",
    duration: "1h 49m",
    description: "Một câu chuyện tình yêu đầy cảm động về hành trình khám phá bản thân và tìm kiếm hạnh phúc."
  },
  {
    id: "2",
    title: "Khám Phá Việt Nam",
    subtitle: "Discover Vietnam",
    image: "/images/events/event2-hero.jpg",
    thumbnail: "/images/events/event2-thumb.jpg",
    rating: "IMDb 8.2",
    quality: "4K",
    ageRating: "T13",
    year: "2024",
    duration: "2h 15m",
    description: "Hành trình khám phá vẻ đẹp thiên nhiên và văn hóa đặc sắc của Việt Nam."
  },
  {
    id: "3",
    title: "Thành Phố Không Ngủ",
    subtitle: "The City That Never Sleeps",
    image: "/images/events/event3-hero.jpg",
    thumbnail: "/images/events/event3-thumb.jpg",
    rating: "IMDb 7.8",
    quality: "HD",
    ageRating: "T16",
    year: "2024",
    duration: "1h 35m",
    description: "Trải nghiệm cuộc sống sôi động của thành phố với những câu chuyện đầy cảm hứng."
  },
  {
    id: "4",
    title: "Biển Xanh Mênh Mông",
    subtitle: "Endless Blue Ocean",
    image: "/images/events/event4-hero.jpg",
    thumbnail: "/images/events/event4-thumb.jpg",
    rating: "IMDb 9.1",
    quality: "4K",
    ageRating: "T13",
    year: "2025",
    duration: "1h 58m",
    description: "Khám phá vẻ đẹp huyền bí của đại dương và những sinh vật biển tuyệt vời."
  },
  {
    id: "5",
    title: "Núi Rừng Hùng Vĩ",
    subtitle: "Majestic Mountains",
    image: "/images/events/event5-hero.jpg",
    thumbnail: "/images/events/event5-thumb.jpg",
    rating: "IMDb 8.5",
    quality: "4K",
    ageRating: "T13",
    year: "2024",
    duration: "2h 05m",
    description: "Hành trình chinh phục những đỉnh núi cao và khám phá thiên nhiên hoang dã."
  },
  {
    id: "6",
    title: "Văn Hóa Truyền Thống",
    subtitle: "Traditional Culture",
    image: "/images/events/event6-hero.jpg",
    thumbnail: "/images/events/event6-thumb.jpg",
    rating: "IMDb 7.9",
    quality: "HD",
    ageRating: "T13",
    year: "2024",
    duration: "1h 42m",
    description: "Tìm hiểu và trải nghiệm những giá trị văn hóa truyền thống đậm đà bản sắc."
  }
];

export default function SpecialEvents() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play functionality
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % specialEvents.length);
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % specialEvents.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToPrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? specialEvents.length - 1 : prevIndex - 1
    );
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const currentEvent = specialEvents[currentIndex];

  return (
    <div className="special-events-carousel relative w-full h-[600px] overflow-hidden rounded-2xl bg-black">
      {/* Main Event Image */}
      <div 
        className="relative w-full h-full transition-all duration-500 ease-in-out"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0">
          <Image
            src={currentEvent.image}
            alt={currentEvent.title}
            fill
            className="object-cover"
            priority
          />
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        {/* Event Information Overlay */}
        <div className="absolute top-8 left-8 right-8 z-10">
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                {currentEvent.title}
              </h2>
              <p className="text-lg md:text-xl text-white/90 font-medium">
                {currentEvent.subtitle}
              </p>
            </div>

            {/* Metadata Tags */}
            <div className="flex flex-wrap gap-3">
              <span className="metadata-tag px-3 py-1 bg-yellow-400 text-black text-sm font-semibold rounded-full">
                {currentEvent.rating}
              </span>
              <span className="metadata-tag px-3 py-1 bg-black/50 text-white text-sm font-semibold rounded-full border border-white/20">
                {currentEvent.quality}
              </span>
              <span className="metadata-tag px-3 py-1 bg-white text-black text-sm font-semibold rounded-full">
                {currentEvent.ageRating}
              </span>
              <span className="metadata-tag px-3 py-1 bg-black/50 text-white text-sm font-semibold rounded-full border border-white/20">
                {currentEvent.year}
              </span>
              <span className="metadata-tag px-3 py-1 bg-black/50 text-white text-sm font-semibold rounded-full border border-white/20">
                {currentEvent.duration}
              </span>
            </div>

            {/* Description */}
            {currentEvent.description && (
              <p className="text-white/80 text-sm md:text-base max-w-2xl leading-relaxed">
                {currentEvent.description}
              </p>
            )}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="nav-button absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
          disabled={isTransitioning}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={goToNext}
          className="nav-button absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
          disabled={isTransitioning}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Thumbnail Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {specialEvents.map((event, index) => (
          <button
            key={event.id}
            onClick={() => goToSlide(index)}
            className={`thumbnail-indicator relative w-16 h-16 rounded-full overflow-hidden transition-all duration-300 ${
              index === currentIndex
                ? "active ring-4 ring-white/80 scale-110 shadow-lg"
                : "ring-2 ring-white/30 hover:ring-white/50 hover:scale-105"
            }`}
            disabled={isTransitioning}
          >
            <Image
              src={event.thumbnail}
              alt={event.title}
              fill
              className="object-cover"
            />
            {/* Active indicator glow */}
            {index === currentIndex && (
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="progress-bar absolute bottom-0 left-0 right-0 h-1 bg-black/30">
        <div 
          className="h-full bg-white/80 transition-all duration-100 ease-linear"
          style={{ width: `${((currentIndex + 1) / specialEvents.length) * 100}%` }}
        />
      </div>
    </div>
  );
}