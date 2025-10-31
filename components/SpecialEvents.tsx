"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Service {
  id: string;
  title: string;
  description: string;
  type: string;
  location?: string;
  price?: string;
  image_url?: string;
  average_rating?: number;
  reviews_count?: number;
}

// ✅ Thêm interface cho props
interface SpecialEventsProps {
  isInitialLoad?: boolean;
}

// ✅ Nhận prop isInitialLoad
export default function SpecialEvents({ isInitialLoad = false }: SpecialEventsProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  // 👆 Swipe handling states
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // 🧭 Fetch data from Supabase
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("services")
        .select(
          "id, title, description, image_url, location, price, type, average_rating, reviews_count"
        )
        .eq("status", "active");

      if (error) {
        console.error("Error fetching services:", error);
        setLoading(false);
        return;
      }

      // 🧹 Chỉ lấy những service có ảnh
      const filtered = (data || []).filter((s) => !!s.image_url);

      // 🔀 Shuffle ngẫu nhiên và lấy 5 phần tử
      const shuffled = filtered.sort(() => Math.random() - 0.5);
      setServices(shuffled.slice(0, 5));
      setLoading(false);
    };

    fetchServices();
  }, []);

  // 🌀 Auto slide
  useEffect(() => {
    if (services.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % services.length);
      setImageLoaded(false); // Reset khi chuyển ảnh
    }, 8000);
    return () => clearInterval(timer);
  }, [services]);

  // 👆 Touch handlers for swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swipe left - next slide
      setCurrentIndex((prev) => (prev + 1) % services.length);
      setImageLoaded(false);
    } else if (isRightSwipe) {
      // Swipe right - previous slide
      setCurrentIndex((prev) => (prev === 0 ? services.length - 1 : prev - 1));
      setImageLoaded(false);
    }

    // Reset
    setTouchStart(null);
    setTouchEnd(null);
  };

  // 🖱️ Mouse handlers for desktop drag
  const [mouseStart, setMouseStart] = useState<number | null>(null);
  const [mouseEnd, setMouseEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setMouseEnd(null);
    setMouseStart(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setMouseEnd(e.clientX);
  };

  const onMouseUp = () => {
    if (!isDragging || !mouseStart || mouseEnd === null) {
      setIsDragging(false);
      return;
    }

    const distance = mouseStart - mouseEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentIndex((prev) => (prev + 1) % services.length);
      setImageLoaded(false);
    } else if (isRightSwipe) {
      setCurrentIndex((prev) => (prev === 0 ? services.length - 1 : prev - 1));
      setImageLoaded(false);
    }

    setIsDragging(false);
    setMouseStart(null);
    setMouseEnd(null);
  };

  const onMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setMouseStart(null);
      setMouseEnd(null);
    }
  };

  // ✅ Loading state với animation
  if (loading) {
    return (
      <div
        className={`w-full aspect-[16/9] flex items-center justify-center text-gray-400 bg-gray-900/30 rounded-2xl transition-all duration-1000 ease-out ${
          isInitialLoad
            ? "opacity-0 scale-95 translate-y-8"
            : "opacity-100 scale-100 translate-y-0"
        }`}
      >
        <div
          className={`flex flex-col items-center gap-3 transition-all duration-700 ease-out ${
            isInitialLoad
              ? "opacity-0 translate-y-4"
              : "opacity-100 translate-y-0"
          }`}
          style={{ transitionDelay: "300ms" }}
        >
          <div className="w-12 h-12 border-4 border-gray-700 border-t-gray-400 rounded-full animate-spin"></div>
          <p className="text-sm">Đang tải dịch vụ nổi bật...</p>
        </div>
      </div>
    );
  }

  // ✅ Empty state với animation
  if (services.length === 0) {
    return (
      <div
        className={`w-full aspect-[16/9] flex items-center justify-center text-gray-400 text-center px-4 bg-gray-900/30 rounded-2xl transition-all duration-1000 ease-out ${
          isInitialLoad
            ? "opacity-0 scale-95 translate-y-8"
            : "opacity-100 scale-100 translate-y-0"
        }`}
      >
        <p
          className={`transition-all duration-700 ease-out ${
            isInitialLoad
              ? "opacity-0 translate-y-4"
              : "opacity-100 translate-y-0"
          }`}
          style={{ transitionDelay: "300ms" }}
        >
          Hiện chưa có dịch vụ nào có ảnh để hiển thị.
        </p>
      </div>
    );
  }

  const current = services[currentIndex];

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-[16/9] overflow-hidden shadow-2xl rounded-2xl transition-all duration-1000 ease-out ${
        isInitialLoad
          ? "opacity-0 scale-95 translate-y-8"
          : "opacity-100 scale-100 translate-y-0"
      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      {/* Background image với fade transition */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'} pointer-events-none`}>
        <Image
          src={current.image_url!}
          alt={current.title}
          fill
          className="object-cover brightness-90"
          priority
          onLoadingComplete={() => setImageLoaded(true)}
        />
      </div>

      {/* 🔽 Gradient overlays (top & bottom) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none" />

      {/* ✨ Overlay info với staggered animation */}
      <div
        className={`absolute bottom-0 left-0 w-full px-4 sm:px-6 md:px-10 pb-6 sm:pb-8 md:pb-10 text-white z-10 transition-all duration-700 ease-out ${
          isInitialLoad
            ? "opacity-0 translate-y-8"
            : "opacity-100 translate-y-0"
        }`}
        style={{ transitionDelay: "300ms" }}
      >
        <div className="max-w-[90%] sm:max-w-xl md:max-w-2xl space-y-2 sm:space-y-3">
          {/* Title */}
          <h2
            className={`text-xl sm:text-2xl md:text-4xl font-bold drop-shadow-lg break-words transition-all duration-700 ease-out ${
              isInitialLoad
                ? "opacity-0 translate-x-8"
                : "opacity-100 translate-x-0"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            {current.title}
          </h2>

          {/* Location */}
          {current.location && (
            <p
              className={`text-gray-300 text-xs sm:text-sm md:text-base transition-all duration-700 ease-out ${
                isInitialLoad
                  ? "opacity-0 translate-x-8"
                  : "opacity-100 translate-x-0"
              }`}
              style={{ transitionDelay: "500ms" }}
            >
              📍 {current.location}
            </p>
          )}

          {/* Description */}
          <p
            className={`text-gray-200 text-[0.75rem] sm:text-sm md:text-base leading-relaxed line-clamp-3 break-words transition-all duration-700 ease-out ${
              isInitialLoad
                ? "opacity-0 translate-x-8"
                : "opacity-100 translate-x-0"
            }`}
            style={{ transitionDelay: "600ms" }}
          >
            {current.description}
          </p>

          {/* Rating */}
          {(current.average_rating ?? 0) > 0 && (
            <div
              className={`flex flex-wrap items-center gap-2 sm:gap-3 text-[0.7rem] sm:text-xs md:text-sm transition-all duration-700 ease-out ${
                isInitialLoad
                  ? "opacity-0 translate-y-4"
                  : "opacity-100 translate-y-0"
              }`}
              style={{ transitionDelay: "700ms" }}
            >
              <span className="bg-yellow-400 text-black font-semibold px-2 sm:px-3 py-1 rounded-full shadow-lg">
                ⭐ {current.average_rating?.toFixed(1)} (
                {current.reviews_count || 0} đánh giá)
              </span>
            </div>
          )}

          {/* Price */}
          {current.price && (
            <p
              className={`text-base sm:text-lg md:text-xl font-semibold text-pink-400 transition-all duration-700 ease-out ${
                isInitialLoad
                  ? "opacity-0 translate-y-4"
                  : "opacity-100 translate-y-0"
              }`}
              style={{ transitionDelay: "800ms" }}
            >
              {current.price}
            </p>
          )}

          {/* Buttons */}
          <div
            className={`flex flex-wrap items-center gap-2 sm:gap-3 transition-all duration-700 ease-out ${
              isInitialLoad
                ? "opacity-0 translate-y-4"
                : "opacity-100 translate-y-0"
            }`}
            style={{ transitionDelay: "900ms" }}
          >
            <Link href={`/services/${current.type}/${current.id}`}>
              <button 
                className="bg-yellow-400 text-black font-semibold px-3 sm:px-5 py-1.5 sm:py-2 rounded-full hover:bg-yellow-300 hover:scale-105 transition-all shadow-lg text-xs sm:text-sm md:text-base whitespace-nowrap pointer-events-auto"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                Xem Chi Tiết
              </button>
            </Link>
            <button 
              className="bg-white/10 border border-white/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-white/20 hover:scale-105 transition-all text-xs sm:text-sm md:text-base whitespace-nowrap backdrop-blur-sm pointer-events-auto"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              ❤️
            </button>
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <button
        onClick={() => {
          setCurrentIndex((prev) =>
            prev === 0 ? services.length - 1 : prev - 1
          );
          setImageLoaded(false);
        }}
        className={`absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-black/40 hover:bg-black/70 hover:scale-110 rounded-full text-white flex items-center justify-center backdrop-blur-sm transition-all z-20 pointer-events-auto ${
          isInitialLoad ? "opacity-0" : "opacity-100"
        }`}
        style={{ transitionDelay: "1000ms" }}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={() => {
          setCurrentIndex((prev) => (prev + 1) % services.length);
          setImageLoaded(false);
        }}
        className={`absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-black/40 hover:bg-black/70 hover:scale-110 rounded-full text-white flex items-center justify-center backdrop-blur-sm transition-all z-20 pointer-events-auto ${
          isInitialLoad ? "opacity-0" : "opacity-100"
        }`}
        style={{ transitionDelay: "1000ms" }}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Thumbnails (Dots Preview) */}
      <div
        className={`absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-3 sm:gap-4 z-20 transition-all duration-700 ease-out ${
          isInitialLoad
            ? "opacity-0 translate-y-4"
            : "opacity-100 translate-y-0"
        }`}
        style={{ transitionDelay: "1100ms" }}
      >
        {services.map((item, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrentIndex(i);
              setImageLoaded(false);
            }}
            className={`relative w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden border-2 transition-all duration-300 pointer-events-auto ${
              i === currentIndex
                ? "border-yellow-400 shadow-lg shadow-yellow-400/50 scale-110"
                : "border-gray-500 opacity-70 hover:opacity-100 hover:scale-105"
            }`}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <Image
              src={item.image_url!}
              alt={item.title}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}