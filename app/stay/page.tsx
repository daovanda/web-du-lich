// page.tsx

"use client";

import { useState } from "react";
import ResizableLayout from "@/components/ResizableLayout";
import SpecialEvents from "@/components/SpecialEvents";
import StaySearchBar from "./_components/StaySearchBar";
import StayList from "./_components/StayList";
import StayLoadingSkeleton from "./_components/StayLoadingSkeleton";
import { useStays } from "./_hooks/useStays";
import { useStaySearch } from "./_hooks/useStaySearch";
import { StayFilterState, DEFAULT_FILTERS } from "./_types/stay.types";

export default function StayServices() {
  const [filters, setFilters] = useState<StayFilterState>(DEFAULT_FILTERS);

  const { stays, loading, error, isInitialLoad } = useStays(filters);
  const { locations } = useStaySearch();

  const handleFiltersChange = (newFilters: StayFilterState) => {
    setFilters(newFilters);
  };

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
            Chúng tôi mang đến hành trình khám phá du lịch mới mẻ, tối giản và 
            gần gũi, nơi bạn có thể ghi dấu từng trải nghiệm trên bản đồ Việt
            Nam.
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
          <StaySearchBar
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
            locations={locations}
            isInitialLoad={isInitialLoad}
          />

          {/* Page Title */}
          <h2
            className={`text-lg font-semibold mb-5 text-white transition-all duration-700 ease-out delay-700 ${
              isInitialLoad
                ? "opacity-0 translate-y-4"
                : "opacity-100 translate-y-0"
            }`}
          >
            Dịch vụ chỗ ở
          </h2>

          {/* Error State */}
          {error && (
            <div className="bg-neutral-900 border border-red-900/50 text-red-400 text-center py-3 px-4 rounded-xl mb-4">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Loading or Content */}
          {loading ? (
            <StayLoadingSkeleton />
          ) : (
            <StayList stays={stays} isInitialLoad={isInitialLoad} />
          )}
        </div>
      </div>
    </ResizableLayout>
  );
}