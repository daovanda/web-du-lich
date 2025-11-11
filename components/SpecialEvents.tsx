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

interface SpecialEventsProps {
  isInitialLoad?: boolean;
}

export default function SpecialEvents({ isInitialLoad = false }: SpecialEventsProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  // 👆 Enhanced swipe handling states
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

      const filtered = (data || []).filter((s) => !!s.image_url);
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
      setImageLoaded(false);
    }, 8000);
    return () => clearInterval(timer);
  }, [services]);

  // 👆 Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setSwipeOffset(0);
    setIsTransitioning(false);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    const offset = currentTouch - touchStart;
    setSwipeOffset(Math.max(-150, Math.min(150, offset)));
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setSwipeOffset(0);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    setIsTransitioning(true);
    
    if (isLeftSwipe) {
      setCurrentIndex((prev) => (prev + 1) % services.length);
      setImageLoaded(false);
    } else if (isRightSwipe) {
      setCurrentIndex((prev) => (prev === 0 ? services.length - 1 : prev - 1));
      setImageLoaded(false);
    }

    setTimeout(() => {
      setSwipeOffset(0);
      setTouchStart(null);
      setTouchEnd(null);
      setIsTransitioning(false);
    }, 50);
  };

  // 🖱️ Mouse handlers
  const [mouseStart, setMouseStart] = useState<number | null>(null);
  const [mouseEnd, setMouseEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setMouseEnd(null);
    setMouseStart(e.clientX);
    setSwipeOffset(0);
    setIsTransitioning(false);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !mouseStart) return;
    const currentMouse = e.clientX;
    setMouseEnd(currentMouse);
    const offset = currentMouse - mouseStart;
    setSwipeOffset(Math.max(-150, Math.min(150, offset)));
  };

  const onMouseUp = () => {
    if (!isDragging || !mouseStart || mouseEnd === null) {
      setIsDragging(false);
      setSwipeOffset(0);
      return;
    }

    const distance = mouseStart - mouseEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    setIsTransitioning(true);

    if (isLeftSwipe) {
      setCurrentIndex((prev) => (prev + 1) % services.length);
      setImageLoaded(false);
    } else if (isRightSwipe) {
      setCurrentIndex((prev) => (prev === 0 ? services.length - 1 : prev - 1));
      setImageLoaded(false);
    }

    setTimeout(() => {
      setSwipeOffset(0);
      setIsDragging(false);
      setMouseStart(null);
      setMouseEnd(null);
      setIsTransitioning(false);
    }, 50);
  };

  const onMouseLeave = () => {
    if (isDragging) {
      setIsTransitioning(true);
      setTimeout(() => {
        setSwipeOffset(0);
        setIsDragging(false);
        setMouseStart(null);
        setMouseEnd(null);
        setIsTransitioning(false);
      }, 300);
    }
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div
        className={`w-full aspect-[16/9] flex items-center justify-center bg-black border border-neutral-800 rounded-xl transition-all duration-1000 ease-out ${
          isInitialLoad
            ? "opacity-0 scale-95 translate-y-8"
            : "opacity-100 scale-100 translate-y-0"
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-neutral-800 border-t-white rounded-full animate-spin"></div>
          <p className="text-sm text-neutral-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  // ✅ Empty state
  if (services.length === 0) {
    return (
      <div
        className={`w-full aspect-[16/9] flex items-center justify-center bg-black border border-neutral-800 rounded-xl transition-all duration-1000 ease-out ${
          isInitialLoad
            ? "opacity-0 scale-95 translate-y-8"
            : "opacity-100 scale-100 translate-y-0"
        }`}
      >
        <p className="text-sm text-neutral-500">
          Hiện chưa có dịch vụ nào có ảnh để hiển thị.
        </p>
      </div>
    );
  }

  const current = services[currentIndex];

  const getTransform = () => {
    if (isTransitioning) return 'translateX(0px) scale(1)';
    const scale = 1 - Math.abs(swipeOffset) * 0.0002;
    return `translateX(${swipeOffset}px) scale(${scale})`;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-[16/9] overflow-hidden rounded-xl border border-neutral-800 transition-all duration-1000 ease-out select-none ${
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
      {/* Background image */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: getTransform(),
          transition: isTransitioning ? 'transform 0.3s ease-out' : 'none',
        }}
      >
        <div className={`absolute inset-0 transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <Image
            src={current.image_url!}
            alt={current.title}
            fill
            className="object-cover"
            priority
            onLoadingComplete={() => setImageLoaded(true)}
          />
        </div>
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-4 sm:pb-6 text-white z-10">
        <div className="max-w-2xl space-y-2">
          {/* Title */}
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold line-clamp-2">
            {current.title}
          </h2>

          {/* Location */}
          {current.location && (
            <div className="flex items-center gap-1.5 text-sm text-neutral-300">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{current.location}</span>
            </div>
          )}

          {/* Description */}
          <p className="text-sm text-neutral-400 line-clamp-2 leading-relaxed">
            {current.description}
          </p>

          {/* Meta info */}
          <div className="flex items-center gap-3 pt-2">
            {/* Rating */}
            {(current.average_rating ?? 0) > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-white/10 backdrop-blur-sm rounded-md text-xs">
                <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-semibold">{current.average_rating?.toFixed(1)}</span>
                {current.reviews_count && (
                  <span className="text-neutral-400">({current.reviews_count})</span>
                )}
              </div>
            )}

            {/* Price */}
            {current.price && (
              <div className="text-sm font-semibold">
                {(() => {
                  const price = parseInt(current.price.replace(/\./g, ''));
                  const formattedPrice = new Intl.NumberFormat('vi-VN').format(price);
                  const unit = {
                    stay: '/đêm',
                    tour: '/người',
                    motorbike: '/ngày',
                    car: '/người'
                  }[current.type] || '';
                  return `${formattedPrice}đ${unit}`;
                })()}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <Link href={`/services/${current.type}/${current.id}`}>
              <button 
                className="bg-white text-black font-semibold px-4 py-2 rounded-lg hover:bg-neutral-200 transition-all text-sm pointer-events-auto active:scale-95"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                Xem chi tiết
              </button>
            </Link>
            <button 
              className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all pointer-events-auto active:scale-95"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Dots indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {services.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrentIndex(i);
              setImageLoaded(false);
            }}
            className={`rounded-full transition-all duration-300 pointer-events-auto ${
              i === currentIndex
                ? "bg-white w-2 h-2"
                : "bg-white/40 w-1.5 h-1.5 hover:bg-white/60"
            }`}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}