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

  // Custom hooks
  const { stays, loading, error, isInitialLoad } = useStays(filters);
  const { locations } = useStaySearch();

  const handleFiltersChange = (newFilters: StayFilterState) => {
    setFilters(newFilters);
  };

  return (
    <ResizableLayout>
      {/* 🔥 Special Events Section */}
      <div className="max-w-6xl mx-auto mt-4 px-4">
        <SpecialEvents isInitialLoad={isInitialLoad} />
      </div>

      <div className="text-white mt-0">
        {/* Header */}
        <div
          className={`max-w-3xl mx-auto px-6 text-center py-4 transition-all duration-1000 ease-out ${
            isInitialLoad
              ? "opacity-0 translate-y-8"
              : "opacity-100 translate-y-0"
          }`}
        >
          <p className="text-gray-400 text-sm sm:text-base">
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
          {/* Search Bar Component */}
          <StaySearchBar
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
            locations={locations}
            isInitialLoad={isInitialLoad}
          />

          <h2
            className={`text-xl font-bold mb-4 transition-all duration-700 ease-out delay-700 ${
              isInitialLoad
                ? "opacity-0 translate-y-4"
                : "opacity-100 translate-y-0"
            }`}
          >
            Dịch vụ chỗ ở
          </h2>

          {/* Error Message */}
          {error && (
            <div className="text-red-400 text-center mb-4">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <StayLoadingSkeleton />
          ) : (
            /* Stay List */
            <StayList stays={stays} isInitialLoad={isInitialLoad} />
          )}
        </div>
      </div>
    </ResizableLayout>
  );
}