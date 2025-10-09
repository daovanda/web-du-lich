"use client";

import { useState } from "react";
import ResizableLayout from "@/components/ResizableLayout";
import HeroSection from "@/app/map/components/HeroSection";
import StatsCard from "@/app/map/components/StatsCard";
import VietnamMap from "@/app/map/components/VietnamMap";

export default function MapPage() {
  const [visitedCount, setVisitedCount] = useState<number>(0);
  const TOTAL_PROVINCES = 63;

  const percent = ((visitedCount / TOTAL_PROVINCES) * 100).toFixed(1);

  return (
    <ResizableLayout>
      <div className="text-white mt-16 md:mt-0 min-h-screen bg-black flex flex-col">
        {/* Hero Section */}
        <HeroSection />

        {/* Main content */}
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10 space-y-10">
          {/* Thống kê */}
          <StatsCard
            visitedCount={visitedCount}
            total={TOTAL_PROVINCES}
            percent={percent}
          />

          {/* Bản đồ Việt Nam */}
          <VietnamMap setVisitedCount={setVisitedCount} />
        </main>
      </div>
    </ResizableLayout>
  );
}
