// src/app/tours/page.tsx
"use client";

import ResizableLayout from "@/components/ResizableLayout";
import SpecialEvents from "@/components/SpecialEvents";
import { useTours } from "./_hooks/useTours";
import TourSearchBar from "./_components/TourSearchBar";
import TourLoadingSkeleton from "./_components/TourLoadingSkeleton";
import TourList from "./_components/TourList";

export default function TourPage() {
  const { tours, loading, error, searchQuery, setSearchQuery, isInitialLoad } =
    useTours();

  return (
    <ResizableLayout>
      {/* Special Events Section */}
      <div className="max-w-6xl mx-auto mt-4 px-4">
        <SpecialEvents isInitialLoad={isInitialLoad} />
      </div>

      <div className="text-white mt-0">
        {/* Hero section with animation */}
        <div
          className={`max-w-3xl mx-auto px-6 text-center py-4 transition-all duration-1000 ease-out ${
            isInitialLoad
              ? "opacity-0 translate-y-8"
              : "opacity-100 translate-y-0"
          }`}
        >
          <p className="text-gray-400 text-sm sm:text-base">
            Trải nghiệm tour du lịch độc đáo — nơi mọi chuyến đi đều là một câu
            chuyện đáng nhớ.
          </p>
        </div>

        {/* Main content with staggered animations */}
        <div
          className={`max-w-2xl mx-auto p-4 transition-all duration-1000 ease-out delay-300 ${
            isInitialLoad
              ? "opacity-0 translate-y-8"
              : "opacity-100 translate-y-0"
          }`}
        >
          {/* Search bar */}
          <TourSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            isInitialLoad={isInitialLoad}
          />

          {/* Title with animation */}
          <h2
            className={`text-xl font-bold mb-4 transition-all duration-700 ease-out delay-700 ${
              isInitialLoad
                ? "opacity-0 translate-y-4"
                : "opacity-100 translate-y-0"
            }`}
          >
            Danh sách tour
          </h2>

          {/* Error message */}
          {error && (
            <div className="text-red-400 text-center mb-4 transition-all duration-500 ease-out opacity-100 translate-y-0">
              {error}
            </div>
          )}

          {/* Loading skeleton or Tour list */}
          {loading ? (
            <TourLoadingSkeleton count={6} />
          ) : (
            <TourList tours={tours} isInitialLoad={isInitialLoad} />
          )}
        </div>
      </div>
    </ResizableLayout>
  );
}