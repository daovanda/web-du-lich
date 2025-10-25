"use client";

import { useState, useEffect } from "react";
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

export default function SpecialEvents() {
  const [services, setServices] = useState<Service[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

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
    }, 8000);
    return () => clearInterval(timer);
  }, [services]);

  if (loading) {
    return (
      <div className="w-full aspect-[16/9] flex items-center justify-center text-gray-400 bg-gray-900/30">
        Đang tải dịch vụ nổi bật...
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="w-full aspect-[16/9] flex items-center justify-center text-gray-400 text-center px-4 bg-gray-900/30">
        Hiện chưa có dịch vụ nào có ảnh để hiển thị.
      </div>
    );
  }

  const current = services[currentIndex];

  return (
    <div className="relative w-full aspect-[16/9] overflow-hidden shadow-lg">
      {/* Background image */}
      <Image
        src={current.image_url!}
        alt={current.title}
        fill
        className="object-cover brightness-90 transition-all duration-700"
        priority
      />

      {/* 🔽 Gradient overlays (top & bottom) - FIXED with pointer-events-none */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-transparent pointer-events-none" />

      {/* Overlay info */}
      <div className="absolute bottom-0 left-0 w-full px-4 sm:px-6 md:px-10 pb-6 sm:pb-8 md:pb-10 text-white z-10">
        <div className="max-w-[90%] sm:max-w-xl md:max-w-2xl">
          <h2 className="text-xl sm:text-2xl md:text-4xl font-bold mb-2 sm:mb-3 drop-shadow-lg break-words">
            {current.title}
          </h2>

          {current.location && (
            <p className="text-gray-300 mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">
              📍 {current.location}
            </p>
          )}

          <p className="text-gray-200 text-[0.75rem] sm:text-sm md:text-base leading-relaxed line-clamp-3 mb-4 sm:mb-5 break-words">
            {current.description}
          </p>

          {/* Rating */}
          {(current.average_rating ?? 0) > 0 && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[0.7rem] sm:text-xs md:text-sm mb-3 sm:mb-4">
              <span className="bg-yellow-400 text-black font-semibold px-2 sm:px-3 py-1 rounded-full">
                ⭐ {current.average_rating?.toFixed(1)} (
                {current.reviews_count || 0} đánh giá)
              </span>
            </div>
          )}

          {/* Price */}
          {current.price && (
            <p className="text-base sm:text-lg md:text-xl font-semibold text-pink-400 mb-4 sm:mb-5">
              {current.price}
            </p>
          )}

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link href={`/services/${current.type}/${current.id}`}>
              <button className="bg-yellow-400 text-black font-semibold px-3 sm:px-5 py-1.5 sm:py-2 rounded-full hover:bg-yellow-300 transition-all shadow-md text-xs sm:text-sm md:text-base whitespace-nowrap">
                Xem Chi Tiết
              </button>
            </Link>
            <button className="bg-white/10 border border-white/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-white/20 transition-all text-xs sm:text-sm md:text-base whitespace-nowrap">
              ❤️
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <button
        onClick={() =>
          setCurrentIndex((prev) =>
            prev === 0 ? services.length - 1 : prev - 1
          )
        }
        className="absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-black/40 hover:bg-black/60 rounded-full text-white flex items-center justify-center backdrop-blur-sm transition-all z-20"
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
        onClick={() => setCurrentIndex((prev) => (prev + 1) % services.length)}
        className="absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-black/40 hover:bg-black/60 rounded-full text-white flex items-center justify-center backdrop-blur-sm transition-all z-20"
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

      {/* Dots */}
      {/* Thumbnails (Dots Preview) */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-3 sm:gap-4 z-20">
        {services.map((item, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`relative w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden border-2 transition-all ${
              i === currentIndex
                ? "border-yellow-400 shadow-lg scale-110"
                : "border-gray-500 opacity-70 hover:opacity-100"
            }`}
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
