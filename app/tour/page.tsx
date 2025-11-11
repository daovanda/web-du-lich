"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ServiceCard from "@/components/ServiceCard";
import ResizableLayout from "@/components/ResizableLayout";
import SpecialEvents from "@/components/SpecialEvents";

export default function TourPage() {
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);

        let query = supabase
          .from("tour_with_reviews")
          .select(`
            service_id,
            title,
            description,
            service_location,
            price,
            image_url, 
            images,
            average_rating,
            reviews_count,
            tour_destination,
            duration_days,
            start_date,
            end_date,
            available_slots,
            guide_name
          `);

        if (searchQuery.trim()) {
          query = query.or(
            `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,tour_destination.ilike.%${searchQuery}%,service_location.ilike.%${searchQuery}%`
          );
        }

        const { data, error } = await query;

        if (error) throw error;
        setTours(data || []);
      } catch (err: any) {
        console.error("Error fetching tours:", err);
        setError("Không thể tải danh sách tour. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      }
    };

    fetchTours();
  }, [searchQuery, isInitialLoad]);

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
            Trải nghiệm tour du lịch độc đáo — nơi mọi chuyến đi đều là một câu chuyện đáng nhớ.
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
          {/* Search bar with animation */}
          <div
            className={`my-2 transition-all duration-700 ease-out delay-500 ${
              isInitialLoad
                ? "opacity-0 translate-y-4"
                : "opacity-100 translate-y-0"
            }`}
          >
            <input
              type="text"
              placeholder="Tìm kiếm tour..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-gray-500 transition-all duration-300 ease-out hover:border-gray-600"
            />
          </div>

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

          {/* Error message with animation */}
          {error && (
            <div
              className={`text-red-400 text-center mb-4 transition-all duration-500 ease-out ${
                error ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              {error}
            </div>
          )}

          {/* Loading skeleton with staggered animation */}
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
          ) : tours.length === 0 ? (
            <p
              className={`text-gray-400 text-center transition-all duration-700 ease-out delay-900 ${
                isInitialLoad
                  ? "opacity-0 translate-y-4"
                  : "opacity-100 translate-y-0"
              }`}
            >
              Không tìm thấy tour nào.
            </p>
          ) : (
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-500 ease-out ${
                !loading ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              {tours.map((tour, index) => (
                <div
                  key={tour.service_id}
                  className={`transition-all duration-600 ease-out ${
                    isInitialLoad
                      ? "opacity-0 translate-y-6"
                      : "opacity-100 translate-y-0"
                  }`}
                  style={{
                    transitionDelay: `${800 + index * 100}ms`,
                  }}
                >
                  <ServiceCard
                    service={{
                      id: tour.service_id,
                      title: tour.title,
                      description: tour.description,
                      image_url: tour.image_url,
                      price: tour.price,
                      location: tour.tour_destination || tour.service_location,
                      type: "tour",
                      average_rating: tour.average_rating,
                      reviews_count: tour.reviews_count,
                      extra: {
                        duration_days: tour.duration_days,
                        guide_name: tour.guide_name,
                      },
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ResizableLayout>
  );
}