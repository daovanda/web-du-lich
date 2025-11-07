"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ServiceCard from "@/components/ServiceCard";
import ResizableLayout from "@/components/ResizableLayout";
import SpecialEvents from "@/components/SpecialEvents";
import CarFilters, { CarFilterState } from "./components/CarFilters";

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
        
        // Build query for cars_view
        let query = supabase
          .from("cars_view")
          .select("*");

        // Apply search filter
        if (filters.searchQuery) {
          query = query.or(
            `title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%,location.ilike.%${filters.searchQuery}%,address.ilike.%${filters.searchQuery}%,departure_location.ilike.%${filters.searchQuery}%,arrival_location.ilike.%${filters.searchQuery}%`
          );
        }

        // Apply vehicle type filter
        if (filters.vehicleType) {
          query = query.eq("vehicle_type", filters.vehicleType);
        }

        // Apply departure location filter
        if (filters.departureLocation) {
          query = query.eq("departure_location", filters.departureLocation);
        }

        // Apply arrival location filter
        if (filters.arrivalLocation) {
          query = query.eq("arrival_location", filters.arrivalLocation);
        }

        let { data, error } = await query;

        if (error) throw new Error(error.message);

        let filteredData = data || [];

        // Apply departure time filter in memory (based on time column)
        if (filters.departureTime && filteredData.length > 0) {
          filteredData = filteredData.filter((service: any) => {
            if (!service.departure_time) return false;
            
            // Parse time string (format: "HH:MM:SS" or "HH:MM")
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

        // Apply price range filter in memory (since price is stored as text in services table)
        if (filters.priceRange !== "all" && filteredData.length > 0) {
          filteredData = filteredData.filter((service) => {
            const priceStr = service.price;
            if (!priceStr) return false;

            // Remove all non-digit characters
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
      {/* 🔥 Special Events Section */}
      <div className="max-w-6xl mx-auto mt-4 px-4">
        <SpecialEvents isInitialLoad={isInitialLoad} />
      </div>

      <div className="text-white mt-0">
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

        <div
          className={`max-w-2xl mx-auto p-4 transition-all duration-1000 ease-out delay-300 ${
            isInitialLoad
              ? "opacity-0 translate-y-8"
              : "opacity-100 translate-y-0"
          }`}
        >
          {/* Car Filters Component */}
          <CarFilters 
            onFiltersChange={handleFiltersChange} 
            isInitialLoad={isInitialLoad}
          />

          <h2
            className={`text-xl font-bold mb-4 transition-all duration-700 ease-out delay-700 ${
              isInitialLoad
                ? "opacity-0 translate-y-4"
                : "opacity-100 translate-y-0"
            }`}
          >
            Dịch vụ xe khách
          </h2>

          {/* Nội dung */}
          {error && (
            <div
              className={`text-red-400 text-center mb-4 transition-all duration-500 ease-out ${
                error
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2"
              }`}
            >
              {error}
            </div>
          )}

          {loading ? (
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-500 ease-out ${
                loading ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`bg-gray-900 rounded-lg p-4 h-56 transition-all duration-300 ease-out ${
                    loading ? "animate-pulse" : "opacity-0"
                  }`}
                  style={{
                    animationDelay: `${i * 100}ms`,
                  }}
                >
                  <div className="w-full h-32 bg-gray-800 rounded mb-3"></div>
                  <div className="h-4 bg-gray-800 rounded mb-2"></div>
                  <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : services.length === 0 ? (
            <p
              className={`text-gray-400 text-center transition-all duration-700 ease-out delay-900 ${
                isInitialLoad
                  ? "opacity-0 translate-y-4"
                  : "opacity-100 translate-y-0"
              }`}
            >
              Không tìm thấy dịch vụ nào.
            </p>
          ) : (
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-500 ease-out ${
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