"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ServiceCard from "@/components/ServiceCard";
import ResizableLayout from "@/components/ResizableLayout";
import SpecialEvents from "@/components/SpecialEvents";
import CarFilters, { CarFilterState } from "./components/CarFilters";

// Loading Skeleton Component
function CarLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-black border border-neutral-800 rounded-xl overflow-hidden animate-pulse"
          style={{
            animationDelay: `${i * 100}ms`,
          }}
        >
          <div className="w-full aspect-square bg-neutral-900"></div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-neutral-900 rounded w-3/4"></div>
            <div className="h-3 bg-neutral-900 rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-3 bg-neutral-900 rounded w-full"></div>
              <div className="h-3 bg-neutral-900 rounded w-2/3"></div>
            </div>
            <div className="pt-3 border-t border-neutral-800 flex justify-between items-center">
              <div className="h-4 bg-neutral-900 rounded w-1/3"></div>
              <div className="h-3 bg-neutral-900 rounded w-12"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Empty State Component
function EmptyState({ isInitialLoad }: { isInitialLoad: boolean }) {
  return (
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
  );
}

// Services List Component
function ServicesList({ services, isInitialLoad }: { services: any[]; isInitialLoad: boolean }) {
  if (services.length === 0) {
    return <EmptyState isInitialLoad={isInitialLoad} />;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
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
  );
}

export default function CarServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [filters, setFilters] = useState<CarFilterState>({
    searchQuery: "",
    vehicleType: "",
    departureLocation: "",
    arrivalLocation: "",
    priceRange: "all",
    departureTime: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from("cars_view")
          .select("*");

        if (filters.searchQuery) {
          query = query.or(
            `title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%,location.ilike.%${filters.searchQuery}%,address.ilike.%${filters.searchQuery}%,departure_location.ilike.%${filters.searchQuery}%,arrival_location.ilike.%${filters.searchQuery}%`
          );
        }

        if (filters.vehicleType) {
          query = query.eq("vehicle_type", filters.vehicleType);
        }

        if (filters.departureLocation) {
          query = query.eq("departure_location", filters.departureLocation);
        }

        if (filters.arrivalLocation) {
          query = query.eq("arrival_location", filters.arrivalLocation);
        }

        let { data, error } = await query;

        if (error) throw new Error(error.message);

        let filteredData = data || [];

        if (filters.departureTime && filteredData.length > 0) {
          filteredData = filteredData.filter((service: any) => {
            if (!service.departure_time) return false;
            
            const timeStr = service.departure_time;
            const [hours] = timeStr.split(':').map(Number);
            
            switch (filters.departureTime) {
              case "morning":
                return hours >= 6 && hours < 12;
              case "afternoon":
                return hours >= 12 && hours < 18;
              case "evening":
                return hours >= 18 && hours < 24;
              case "night":
                return hours >= 0 && hours < 6;
              default:
                return true;
            }
          });
        }

        if (filters.priceRange !== "all" && filteredData.length > 0) {
          filteredData = filteredData.filter((service) => {
            const priceStr = service.price;
            if (!priceStr) return false;

            const priceNum = parseInt(priceStr.replace(/[^0-9]/g, ""));
            
            if (isNaN(priceNum)) return false;

            switch (filters.priceRange) {
              case "under300k":
                return priceNum < 300000;
              case "300k-600k":
                return priceNum >= 300000 && priceNum <= 600000;
              case "over600k":
                return priceNum > 600000;
              default:
                return true;
            }
          });
        }

        setServices(filteredData);
      } catch (err: any) {
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        console.error("Error fetching car services:", err);
      } finally {
        setLoading(false);
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      }
    };

    fetchServices();
  }, [filters, isInitialLoad]);

  const handleFiltersChange = (newFilters: CarFilterState) => {
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
          <CarFilters 
            onFiltersChange={handleFiltersChange} 
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
            Dịch vụ xe khách
          </h2>

          {/* Error State */}
          {error && (
            <div className="bg-neutral-900 border border-red-900/50 text-red-400 text-center py-3 px-4 rounded-xl mb-4">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Loading or Content */}
          {loading ? (
            <CarLoadingSkeleton />
          ) : (
            <ServicesList services={services} isInitialLoad={isInitialLoad} />
          )}
        </div>
      </div>
    </ResizableLayout>
  );
}