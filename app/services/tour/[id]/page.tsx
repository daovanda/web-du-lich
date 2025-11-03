"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ResizableLayout from "@/components/ResizableLayout";

import ServiceBreadcrumb from "@/app/services/components/ServiceBreadcrumb";
import ServiceHeader from "@/app/services/components/ServiceHeader";
import ServiceGallery from "@/app/services/components/ServiceGallery";
import ServiceDescription from "@/app/services/components/ServiceDescription";
import ServiceMap from "@/app/services/components/ServiceMap";
import ServiceNearby from "@/app/services/components/ServiceNearby";
import ServiceReviews from "@/app/services/components/ServiceReviews";


import TourInfo from "./TourInfo";
import TourItinerary from "./TourItinerary";
import BookingFormWrapper from "./BookingFormWrapper";

/* -------------------- Types -------------------- */
type Tour = {
  service_id: string;
  title: string;
  description: string | null;
  service_location: string | null;
  tour_destination: string | null;
  price: string | null;
  image_url: string | null;
  images: string[];
  average_rating: number;
  reviews_count: number;
  duration_days: number | null;
  start_date: string | null;
  end_date: string | null;
  available_slots: number | null;
  guide_name: string | null;
  itinerary: any;
};

type NearbyLocation = {
  id: string;
  name: string;
  type: string | null;
  region: string | null;
  image_url: string | null;
};

type ServiceReview = {
  id: string;
  rating: number;
  comment: string | null;
  user: {
    full_name?: string | null;
    username?: string | null;
  } | null;
};

/* -------------------- Component -------------------- */
export default function TourDetailPage() {
  const { id: rawId } = useParams();
  const id = Array.isArray(rawId) ? rawId[0] : rawId ?? "";

  const [tour, setTour] = useState<Tour | null>(null);
  const [nearby, setNearby] = useState<NearbyLocation[]>([]);
  const [reviews, setReviews] = useState<ServiceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // Tour details
        const { data, error: fetchError } = await supabase
          .from("tour_with_reviews")
          .select("*")
          .eq("service_id", id)
          .single();

        if (fetchError) throw new Error(fetchError.message);
        setTour(data as Tour);

        // Địa điểm gần đó
        const region = data?.service_location || data?.tour_destination || "";
        if (region) {
          const { data: locs } = await supabase
            .from("locations")
            .select("*")
            .ilike("region", `%${region}%`)
            .limit(6);
          setNearby(locs || []);
        }

        // Đánh giá
        const { data: rv } = await supabase
          .from("service_reviews")
          .select(`
            id,
            rating,
            comment,
            user:profiles(full_name, username)
          `)
          .eq("service_id", id)
          .order("created_at", { ascending: false })
          .limit(4);

        setReviews(
          (rv || []).map((r: any) => ({
            ...r,
            user: Array.isArray(r.user) ? r.user[0] : r.user,
          }))
        );
      } catch (err) {
        console.error("Error fetching tour:", err);
        setError("Không tìm thấy tour.");
      } finally {
        setLoading(false);
        setTimeout(() => {
          setIsInitialLoad(false);
        }, 200);
      }
    };

    fetchData();
  }, [id]);

  if (loading)
    return (
      <div className="p-6 text-gray-400 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-4"></div>
        <p>Đang tải...</p>
      </div>
    );

  if (error || !tour)
    return (
      <div
        className={`p-6 text-red-400 text-center transition-all duration-700 ease-out ${
          isInitialLoad ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}
      >
        {error || "Không tìm thấy tour"}
      </div>
    );

  // ✅ Ưu tiên image_url, sau đó mới đến images array
  const allImages = [
    ...(tour.image_url ? [tour.image_url] : []),
    ...(tour.images || []),
  ].filter(Boolean);

  // Convert tour to service format for existing components
  const serviceData = {
    id: tour.service_id,
    title: tour.title,
    description: tour.description,
    type: "tour" as const,
    location: tour.tour_destination || tour.service_location,
    price: tour.price,
    images: allImages,
    address: tour.service_location,
    average_rating: tour.average_rating,
    reviews_count: tour.reviews_count,
  };

  /* -------------------- UI -------------------- */
  return (
    <ResizableLayout>
      <div className="min-h-screen bg-black text-white mt-16 md:mt-0">
        <main
          className={`max-w-4xl mx-auto px-4 py-6 space-y-8 transition-all duration-1000 ease-out ${
            isInitialLoad
              ? "opacity-0 translate-y-8"
              : "opacity-100 translate-y-0"
          }`}
        >
          {/* Breadcrumb */}
          <div
            className={`transition-all duration-700 ease-out delay-300 ${
              isInitialLoad
                ? "opacity-0 translate-y-6"
                : "opacity-100 translate-y-0"
            }`}
          >
            <ServiceBreadcrumb service={serviceData} />
          </div>

          {/* Header */}
          <div
            className={`transition-all duration-700 ease-out delay-500 ${
              isInitialLoad
                ? "opacity-0 translate-y-6"
                : "opacity-100 translate-y-0"
            }`}
          >
            <ServiceHeader service={serviceData} />
          </div>

          {/* Gallery */}
          <div
            className={`transition-all duration-700 ease-out delay-700 ${
              isInitialLoad
                ? "opacity-0 translate-y-6"
                : "opacity-100 translate-y-0"
            }`}
          >
            <ServiceGallery images={allImages} title={tour.title} />
          </div>

          {/* Tour Info (Duration, Dates, Slots, Guide) */}
          <div
            className={`transition-all duration-700 ease-out delay-900 ${
              isInitialLoad
                ? "opacity-0 translate-y-6"
                : "opacity-100 translate-y-0"
            }`}
          >
            <TourInfo tour={tour} />
          </div>
          
          {/* Itinerary */}
          {tour.itinerary && (
            <div
              className={`transition-all duration-700 ease-out delay-1300 ${
                isInitialLoad
                  ? "opacity-0 translate-y-6"
                  : "opacity-100 translate-y-0"
              }`}
            >
              <TourItinerary itinerary={tour.itinerary} />
            </div>
          )}

          {/* Description */}
          <div
            className={`transition-all duration-700 ease-out delay-1100 ${
              isInitialLoad
                ? "opacity-0 translate-y-6"
                : "opacity-100 translate-y-0"
            }`}
          >
            <ServiceDescription description={tour.description} />
          </div>

          {/* Map */}
          {tour.service_location && (
            <div
              className={`transition-all duration-700 ease-out delay-1500 ${
                isInitialLoad
                  ? "opacity-0 translate-y-6"
                  : "opacity-100 translate-y-0"
              }`}
            >
              <ServiceMap address={tour.service_location} />
            </div>
          )}

          {/* Nearby */}
          <div
            className={`transition-all duration-700 ease-out delay-1700 ${
              isInitialLoad
                ? "opacity-0 translate-y-6"
                : "opacity-100 translate-y-0"
            }`}
          >
            <ServiceNearby nearby={nearby} location={tour.service_location} />
          </div>

          {/* Reviews */}
          <div
            className={`transition-all duration-700 ease-out delay-1900 ${
              isInitialLoad
                ? "opacity-0 translate-y-6"
                : "opacity-100 translate-y-0"
            }`}
          >
            <ServiceReviews 
              reviews={reviews} 
              serviceType="tour"
              serviceId={tour.service_id}
            />
          </div>

          {/* Booking Form */}
          <div
            className={`transition-all duration-700 ease-out delay-2100 ${
              isInitialLoad
                ? "opacity-0 translate-y-6"
                : "opacity-100 translate-y-0"
            }`}
          >
            <BookingFormWrapper
              serviceId={tour.service_id}
              price={tour.price}
              serviceTitle={tour.title}
            />
          </div>
        </main>
      </div>
    </ResizableLayout>
  );
}