"use client";

import { useState, useEffect } from "react";
import ResizableLayout from "@/components/ResizableLayout";
import HeroSection from "@/app/map/components/HeroSection";
import StatsCard from "@/app/map/components/StatsCard";
import VietnamMap from "@/app/map/components/VietnamMap";

export default function MapPage() {
  const [visitedCount, setVisitedCount] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(false);
  const TOTAL_PROVINCES = 63;

  const percent = ((visitedCount / TOTAL_PROVINCES) * 100).toFixed(1);

  // ✨ Trigger animation khi component mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ResizableLayout>
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-5xl mx-auto px-4 py-8 pt-24 md:pt-8 space-y-8">
          
          {/* ✨ Hero Section */}
          <div 
            className={`transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            <HeroSection />
          </div>

          {/* 📊 Stats Card */}
          <div 
            className={`transition-all duration-700 ease-out delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            <StatsCard
              visitedCount={visitedCount}
              total={TOTAL_PROVINCES}
              percent={percent}
            />
          </div>

          {/* 🗺️ Vietnam Map */}
          <div 
            className={`transition-all duration-700 ease-out delay-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            <VietnamMap setVisitedCount={setVisitedCount} />
          </div>

          {/* 💡 Tips Section */}
          <div 
            className={`transition-all duration-700 ease-out delay-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Hướng dẫn sử dụng</h3>
              </div>
              
              <div className="space-y-3 pl-13">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-700">
                    <span className="text-xs font-semibold text-neutral-400">1</span>
                  </div>
                  <p className="text-sm text-neutral-400">
                    <span className="text-white font-medium">Nhấn vào tỉnh/thành</span> trên bản đồ để đánh dấu nơi bạn đã ghé thăm
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-700">
                    <span className="text-xs font-semibold text-neutral-400">2</span>
                  </div>
                  <p className="text-sm text-neutral-400">
                    <span className="text-white font-medium">Di chuột qua</span> để xem tên tỉnh thành
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-700">
                    <span className="text-xs font-semibold text-neutral-400">3</span>
                  </div>
                  <p className="text-sm text-neutral-400">
                    <span className="text-white font-medium">Nhấn lại</span> để bỏ đánh dấu
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ResizableLayout>
  );
}