"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";

export default function SpecialEventsCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const events = [
    { href: "/events/hue", img: "/events/hue.jpg", alt: "Festival Huế" },
    { href: "/events/nha-trang", img: "/events/nha-trang.jpg", alt: "Lễ hội biển Nha Trang" },
    { href: "/events/da-nang", img: "/events/da-nang.jpg", alt: "Pháo hoa Đà Nẵng" },
    { href: "/events/tay-nguyen", img: "/events/tay-nguyen.jpg", alt: "Festival Tây Nguyên" },
    { href: "/map", img: "/map-thumbnail.png", alt: "Bản đồ hành trình" },
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      const scrollLeft = container.scrollLeft;
      const width = container.clientWidth;
      const index = Math.round(scrollLeft / width);
      setActiveIndex(index);
    };

    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="w-full bg-black">
      <div
        ref={containerRef}
        className="flex overflow-x-scroll snap-x snap-mandatory scroll-smooth no-scrollbar"
        style={{ height: "480px" }} // cao hơn, chiếm nửa màn hình
      >
        {events.map((e, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 w-full snap-center"
          >
            <Link href={e.href}>
              <img
                src={e.img}
                alt={e.alt}
                className="w-full h-full object-cover"
              />
            </Link>
          </div>
        ))}
      </div>

      {/* Dấu chấm */}
      <div className="flex justify-center mt-4 space-x-2">
        {events.map((_, idx) => (
          <span
            key={idx}
            className={`h-3 w-3 rounded-full transition ${
              activeIndex === idx ? "bg-white" : "bg-gray-600"
            }`}
          />
        ))}
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
