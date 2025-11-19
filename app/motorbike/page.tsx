"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ServiceCard from "@/components/ServiceCard";
import ResizableLayout from "@/components/ResizableLayout";
import SpecialEvents from "@/components/SpecialEvents";
import MotorbikeFilters, { MotorbikeFilterState } from "./components/MotorbikeFilters";

export default function MotorbikeServices() {
  const [services, setServices] = useState<any[]>([]);
  const [allServices, setAllServices] = useState<any[]>([]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [topLocations, setTopLocations] = useState<string[]>([]);
  const [filters, setFilters] = useState<MotorbikeFilterState>({
    searchQuery: "",
    bikeType: "",
    location: "",
    minEngineSize: "0",
    maxEngineSize: "",
    minYear: "2000",
    maxYear: "",
    minPrice: "",
    maxPrice: "500000",
    sortBy: "default", // THÊM MỚI
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const fetchAllServices = async () => {
      try {
        const { data, error } = await supabase
          .from("motorbikes_view")
          .select("location");

        if (error) throw error;

        if (data) {
          setAllServices(data);

          const locationCount: { [key: string]: number } = {};
          data.forEach((service) => {
            if (service.location) {
              locationCount[service.location] = (locationCount[service.location] || 0) + 1;
            }
          });

          const uniqueLocations = Object.keys(locationCount).sort();
          setAvailableLocations(uniqueLocations);

          const top4 = Object.entries(locationCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 4)
            .map(([location]) => location);
          setTopLocations(top4);
        }
      } catch (err: any) {
        console.error("Error fetching locations:", err);
      }
    };

    fetchAllServices();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);

        let query = supabase.from("motorbikes_view").select("*");

        if (filters.searchQuery) {
          query = query.or(
            `title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%,location.ilike.%${filters.searchQuery}%,address.ilike.%${filters.searchQuery}%,model.ilike.%${filters.searchQuery}%`
          );
        }

        if (filters.bikeType) {
          query = query.eq("bike_type", filters.bikeType);
        }

        if (filters.location) {
          query = query.eq("location", filters.location);
        }

        if (filters.minEngineSize && filters.minEngineSize !== "0") {
          query = query.gte("engine_size", parseInt(filters.minEngineSize));
        }
        if (filters.maxEngineSize) {
          query = query.lte("engine_size", parseInt(filters.maxEngineSize));
        }

        if (filters.minYear && filters.minYear !== "2000") {
          query = query.gte("year", parseInt(filters.minYear));
        }
        if (filters.maxYear) {
          query = query.lte("year", parseInt(filters.maxYear));
        }

        if (filters.minPrice) {
          query = query.gte("price", parseFloat(filters.minPrice));
        }
        if (filters.maxPrice && filters.maxPrice !== "500000") {
          query = query.lte("price", parseFloat(filters.maxPrice));
        }

        // THÊM SORTING - Áp dụng order theo sortBy
        if (filters.sortBy === "price-asc") {
          query = query.order("price", { ascending: true });
        } else if (filters.sortBy === "price-desc") {
          query = query.order("price", { ascending: false });
        } else {
          // Default sorting (có thể là id hoặc created_at)
          query = query.order("id", { ascending: true });
        }

        const { data, error } = await query;

        if (error) throw new Error(error.message);

        setServices(data || []);
      } catch (err: any) {
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        console.error("Error fetching motorbike services:", err);
      } finally {
        setLoading(false);
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      }
    };

    fetchServices();
  }, [filters, isInitialLoad]);

  const handleFiltersChange = (newFilters: MotorbikeFilterState) => {
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

          {/* Error State */}
          {error && (
            <div
              className={`bg-neutral-900 border border-red-900/50 text-red-400 text-center py-3 px-4 rounded-xl mb-4 transition-all duration-500 ease-out ${
                error
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2"
              }`}
            >
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-500 ease-out ${
                loading ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`bg-black border border-neutral-800 rounded-xl overflow-hidden transition-all duration-300 ease-out ${
                    loading ? "animate-pulse" : "opacity-0"
                  }`}
                  style={{
                    animationDelay: `${i * 100}ms`,
                  }}
                >
                  {/* Image skeleton */}
                  <div className="w-full aspect-square bg-neutral-900"></div>
                  
                  {/* Content skeleton */}
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-neutral-900 rounded w-3/4"></div>
                    <div className="h-3 bg-neutral-900 rounded w-1/2"></div>
                    <div className="h-3 bg-neutral-900 rounded w-full"></div>
                    <div className="h-3 bg-neutral-900 rounded w-2/3"></div>
                    
                    <div className="pt-3 border-t border-neutral-800">
                      <div className="h-4 bg-neutral-900 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : services.length === 0 ? (
            /* Empty State */
            <div
              className={`text-center py-16 transition-all duration-700 ease-out delay-900 ${
                isInitialLoad
                  ? "opacity-0 translate-y-4"
                  : "opacity-100 translate-y-0"
              }`}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-900 flex items-center justify-center">
                <svg className="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-neutral-500 text-sm">
                Không tìm thấy dịch vụ nào phù hợp
              </p>
              <p className="text-neutral-600 text-xs mt-2">
                Thử thay đổi bộ lọc để xem thêm kết quả
              </p>
            </div>
          ) : (
            /* Services Grid */
            <div
              className={`grid grid-cols-2 gap-3 sm:gap-4 transition-all duration-500 ease-out ${
                !loading ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              {services.map((service, index) => (
                <div
                  key={service.id}
                  className={`transition-all duration-600 ease-out ${
                    isInitialLoad
                      ? "opacity-0 translate-y-6"
                      : "opacity-100 translate-y-0"
                  }`}
                  style={{
                    transitionDelay: `${800 + index * 100}ms`,
                  }}
                >
                  <ServiceCard service={service} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ResizableLayout>
  );
}