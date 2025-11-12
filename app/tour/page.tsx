"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ServiceCard from "@/components/ServiceCard";
import ResizableLayout from "@/components/ResizableLayout";
import SpecialEvents from "@/components/SpecialEvents";

// Loading Skeleton Component
function TourLoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-black border border-neutral-800 rounded-xl overflow-hidden animate-pulse"
          style={{
            animationDelay: `${i * 100}ms`,
          }}
        >
          {/* Image skeleton */}
          <div className="w-full aspect-square bg-neutral-900"></div>
          
          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            {/* Title */}
            <div className="h-4 bg-neutral-900 rounded w-3/4"></div>
            
            {/* Location */}
            <div className="h-3 bg-neutral-900 rounded w-1/2"></div>
            
            {/* Description lines */}
            <div className="space-y-2">
              <div className="h-3 bg-neutral-900 rounded w-full"></div>
              <div className="h-3 bg-neutral-900 rounded w-2/3"></div>
            </div>
            
            {/* Extra info badges */}
            <div className="flex gap-2">
              <div className="h-6 bg-neutral-900 rounded w-16"></div>
              <div className="h-6 bg-neutral-900 rounded w-20"></div>
            </div>
            
            {/* Price section */}
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
        Không tìm thấy tour nào phù hợp
      </p>
      <p className="text-neutral-600 text-xs mt-2">
        Thử tìm kiếm với từ khóa khác
      </p>
    </div>
  );
}

// Tours List Component
function ToursList({ tours, isInitialLoad }: { tours: any[]; isInitialLoad: boolean }) {
  if (tours.length === 0) {
    return <EmptyState isInitialLoad={isInitialLoad} />;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
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
  );
}

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
          <div
            className={`mb-6 transition-all duration-700 ease-out delay-500 ${
              isInitialLoad
                ? "opacity-0 translate-y-4"
                : "opacity-100 translate-y-0"
            }`}
          >
            <div className="relative">
              <svg 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm tour theo tên, điểm đến..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900 text-white border border-neutral-800 focus:outline-none focus:border-neutral-700 transition-all duration-300 placeholder:text-neutral-600 text-sm"
              />
            </div>
          </div>

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
            <TourLoadingSkeleton />
          ) : (
            <ToursList tours={tours} isInitialLoad={isInitialLoad} />
          )}
        </div>
      </div>
    </ResizableLayout>
  );
}