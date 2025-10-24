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

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("tour_with_reviews")
          .select(`
            service_id,
            title,
            description,
            location,
            price,
            images,
            average_rating,
            reviews_count,
            destination,
            duration_days,
            start_date,
            end_date,
            available_slots,
            guide_name
          `)
          .or(
            `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,destination.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`
          );

        if (error) throw error;
        setTours(data || []);
      } catch (err: any) {
        console.error("Error fetching tours:", err);
        setError("Không thể tải danh sách tour. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, [searchQuery]);

  return (
    <ResizableLayout>
      {/* 🔥 Special Events Section */
        <div className="max-w-6xl mx-auto mt-8 px-4">
          <SpecialEvents />
          </div>}
      {/* ✅ Giống file map/page.tsx — đảm bảo không bị header đè */}
      <div className="text-white mt-16 md:mt-0">
        {/* Hero section */}
        <div className="max-w-3xl mx-auto px-6 text-center py-8">
{/*          <h1 className="text-3xl font-extrabold mb-3">
            Khám phá Việt Nam qua từng hành trình
          </h1>*/}
          <p className="text-gray-400 text-sm sm:text-base">
            Trải nghiệm tour du lịch độc đáo – nơi mỗi chuyến đi đều là một câu chuyện đáng nhớ.
          </p>
        </div>

        {/* Nội dung chính */}
        <div className="max-w-2xl mx-auto p-6">
          {/* Thanh tìm kiếm */}
          <div className="my-4">
            <input
              type="text"
              placeholder="Tìm kiếm tour..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-gray-500"
            />
          </div>

          <h2 className="text-xl font-bold mb-4">Danh sách tour</h2>

          {error && <div className="text-red-400 text-center mb-4">{error}</div>}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-900 rounded-lg p-4 animate-pulse h-56"
                >
                  <div className="w-full h-32 bg-gray-800 rounded mb-3"></div>
                  <div className="h-4 bg-gray-800 rounded mb-2"></div>
                  <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : tours.length === 0 ? (
            <p className="text-gray-400 text-center">Không tìm thấy tour nào.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tours.map((tour) => (
                <ServiceCard
                  key={tour.service_id}
                  service={{
                    id: tour.service_id,
                    title: tour.title,
                    description: tour.description,
                    image_url: tour.images?.[0],
                    price: tour.price,
                    location: tour.destination || tour.location,
                    type: "tour",
                    average_rating: tour.average_rating,
                    reviews_count: tour.reviews_count,
                    extra: {
                      duration_days: tour.duration_days,
                      guide_name: tour.guide_name,
                    },
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </ResizableLayout>
  );
}
