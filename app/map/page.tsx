"use client";

import { useState, useEffect } from "react";
import ResizableLayout from "@/components/ResizableLayout";
import HeroSection from "@/app/map/components/HeroSection";
import StatsCard from "@/app/map/components/StatsCard";
import VietnamMap from "@/app/map/components/VietnamMap";

export default function MapPage() {
  const [visitedCount, setVisitedCount] = useState<number>(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const TOTAL_PROVINCES = 63;

  const percent = ((visitedCount / TOTAL_PROVINCES) * 100).toFixed(1);

  useEffect(() => {
    // Trigger initial load animation
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ResizableLayout>
      <div className="text-white mt-16 md:mt-0 min-h-screen bg-black flex flex-col">
        {/* Hero Section */}
        <div 
          className={`transition-all duration-1000 ease-out ${
            isInitialLoad 
              ? 'opacity-0 translate-y-8' 
              : 'opacity-100 translate-y-0'
          }`}
        >
          <HeroSection />
        </div>

        {/* Main content */}
        <main 
          className={`flex-1 max-w-5xl mx-auto w-full px-4 py-10 space-y-10 transition-all duration-1000 ease-out delay-300 ${
            isInitialLoad 
              ? 'opacity-0 translate-y-8' 
              : 'opacity-100 translate-y-0'
          }`}
        >
          {/* Thống kê */}
          <div 
            className={`transition-all duration-700 ease-out delay-500 ${
              isInitialLoad 
                ? 'opacity-0 translate-y-6' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            <StatsCard
              visitedCount={visitedCount}
              total={TOTAL_PROVINCES}
              percent={percent}
            />
          </div>

          {/* Bản đồ Việt Nam */}
          <div 
            className={`transition-all duration-700 ease-out delay-700 ${
              isInitialLoad 
                ? 'opacity-0 translate-y-6' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            <VietnamMap setVisitedCount={setVisitedCount} />
          </div>
        </main>
      </div>
    </ResizableLayout>
  );
}