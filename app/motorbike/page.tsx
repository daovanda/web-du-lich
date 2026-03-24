"use client";

import { useState } from "react";
import ResizableLayout from "@/components/ResizableLayout";
import SpecialEvents from "@/components/SpecialEvents";
import MotorbikeFilters from "./_components/MotorbikeFilters";
import MotorbikeList from "./_components/MotorbikeList";
import { useMotorbikeSearch } from "./_hooks/useMotorbikeSearch";
import { useMotorbikes } from "./_hooks/useMotorbikes";
import { DEFAULT_MOTORBIKE_FILTERS, type MotorbikeFilterState } from "./_types/motorbike.types";

export default function MotorbikeServices() {
  const [filters, setFilters] = useState<MotorbikeFilterState>(DEFAULT_MOTORBIKE_FILTERS);
  const { services, loading, error, isInitialLoad } = useMotorbikes(filters);
  const { locations: availableLocations, topLocations } = useMotorbikeSearch();

  const handleFiltersChange = (newFilters: MotorbikeFilterState) => setFilters(newFilters);

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
          {/* Filters */}
          <MotorbikeFilters
            onFiltersChange={handleFiltersChange}
            isInitialLoad={isInitialLoad}
            availableLocations={availableLocations}
            topLocations={topLocations}
          />

          {/* Page Title */}
          <h2
            className={`text-lg font-semibold mb-5 text-white transition-all duration-700 ease-out delay-700 ${
              isInitialLoad
                ? "opacity-0 translate-y-4"
                : "opacity-100 translate-y-0"
            }`}
          >
            Dịch vụ thuê xe máy
          </h2>

          <MotorbikeList services={services} loading={loading} error={error} isInitialLoad={isInitialLoad} />
        </div>
      </div>
    </ResizableLayout>
  );
}