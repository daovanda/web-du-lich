"use client";

import ResizableLayout from "@/components/ResizableLayout";
import SpecialEvents from "@/components/SpecialEvents";
import TourSearchBar from "./_components/TourSearchBar";
import TourList from "./_components/TourList";
import TourLoadingSkeleton from "./_components/TourLoadingSkeleton";
import { useTours } from "./_hooks/useTours";

export default function TourPage() {
  const { tours, loading, error, searchQuery, setSearchQuery, isInitialLoad } = useTours();

  return (
    <ResizableLayout>
      {/* Special Events Section */}
      <div className="max-w-6xl mx-auto mt-4 px-4">
        <SpecialEvents isInitialLoad={isInitialLoad} />
      </div>

      <div className="text-white mt-0">
        {/* Hero Description */}
        <div
          className={`max-w-3xl mx-auto px-6 text-center py-4 transition-all duration-1000 ease-out ${
            isInitialLoad
              ? "opacity-0 translate-y-8"
              : "opacity-100 translate-y-0"
          }`}
        >
          <p className="text-neutral-500 text-sm sm:text-base leading-relaxed">
            Trải nghiệm tour du lịch độc đáo — nơi mọi chuyến đi đều là một câu chuyện đáng nhớ.
          </p>
        </div>

        {/* Main Content */}
        <div
          className={`max-w-2xl mx-auto p-4 transition-all duration-1000 ease-out delay-300 ${
            isInitialLoad
              ? "opacity-0 translate-y-8"
              : "opacity-100 translate-y-0"
          }`}
        >
          {/* Search Bar */}
          <TourSearchBar value={searchQuery} onChange={setSearchQuery} isInitialLoad={isInitialLoad} />

          {/* Page Title */}
          <h2
            className={`text-lg font-semibold mb-5 text-white transition-all duration-700 ease-out delay-700 ${
              isInitialLoad
                ? "opacity-0 translate-y-4"
                : "opacity-100 translate-y-0"
            }`}
          >
            Danh sách tour
          </h2>

          {/* Error State */}
          {error && (
            <div className="bg-neutral-900 border border-red-900/50 text-red-400 text-center py-3 px-4 rounded-xl mb-4">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Loading or Content */}
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