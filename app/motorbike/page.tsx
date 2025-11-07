"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ServiceCard from "@/components/ServiceCard";
import ResizableLayout from "@/components/ResizableLayout";
import SpecialEvents from "@/components/SpecialEvents";
import MotorbikeFilters, { MotorbikeFilterState } from "./components/MotorbikeFilters";

export default function MotorbikeServices() {
  const [services, setServices] = useState<any[]>([]);
  const [allServices, setAllServices] = useState<any[]>([]); // Store all services for location calculation
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
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fetch all services once to calculate locations
  useEffect(() => {
    const fetchAllServices = async () => {
      try {
        const { data, error } = await supabase
          .from("motorbikes_view")
          .select("location");

        if (error) throw error;

        if (data) {
          setAllServices(data);

          // Calculate location counts
          const locationCount: { [key: string]: number } = {};
          data.forEach((service) => {
            if (service.location) {
              locationCount[service.location] = (locationCount[service.location] || 0) + 1;
            }
          });

          // Get all unique locations sorted alphabetically
          const uniqueLocations = Object.keys(locationCount).sort();
          setAvailableLocations(uniqueLocations);

          // Get top 4 locations by count
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

  // Fetch filtered services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);

        // Build query for motorbikes_view
        let query = supabase.from("motorbikes_view").select("*");

        // Apply search filter
        if (filters.searchQuery) {
          query = query.or(
            `title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%,location.ilike.%${filters.searchQuery}%,address.ilike.%${filters.searchQuery}%,model.ilike.%${filters.searchQuery}%`
          );
        }

        // Apply bike type filter
        if (filters.bikeType) {
          query = query.eq("bike_type", filters.bikeType);
        }

        // Apply location filter
        if (filters.location) {
          query = query.eq("location", filters.location);
        }

        // Apply engine size range filter
        if (filters.minEngineSize && filters.minEngineSize !== "0") {
          query = query.gte("engine_size", parseInt(filters.minEngineSize));
        }
        if (filters.maxEngineSize) {
          query = query.lte("engine_size", parseInt(filters.maxEngineSize));
        }

        // Apply year range filter
        if (filters.minYear && filters.minYear !== "2000") {
          query = query.gte("year", parseInt(filters.minYear));
        }
        if (filters.maxYear) {
          query = query.lte("year", parseInt(filters.maxYear));
        }

        // Apply price range filter
        // Use price_per_day if available, otherwise use price
        if (filters.minPrice) {
          query = query.gte("price", parseFloat(filters.minPrice));
        }
        if (filters.maxPrice && filters.maxPrice !== "500000") {
          query = query.lte("price", parseFloat(filters.maxPrice));
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
          {/* Motorbike Filters Component */}
          <MotorbikeFilters
            onFiltersChange={handleFiltersChange}
            isInitialLoad={isInitialLoad}
            availableLocations={availableLocations}
            topLocations={topLocations}
          />

          <h2
            className={`text-xl font-bold mb-4 transition-all duration-700 ease-out delay-700 ${
              isInitialLoad
                ? "opacity-0 translate-y-4"
                : "opacity-100 translate-y-0"
            }`}
          >
            Dịch vụ thuê xe máy
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