"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ResizableLayout from "@/components/ResizableLayout";

import ServiceBreadcrumb from "@/app/services/components/ServiceBreadcrumb";
import ServiceHeader from "@/app/services/components/ServiceHeader";
import ServiceGallery from "@/app/services/components/ServiceGallery";
import ServiceAmenities from "@/app/services/components/ServiceAmenities";
import ServiceDescription from "@/app/services/components/ServiceDescription";
import ServiceMap from "@/app/services/components/ServiceMap";
import ServiceNearby from "@/app/services/components/ServiceNearby";
import ServiceReviews from "@/app/services/components/ServiceReviews";

// Thay BookingForm bằng BookingFormWrapper
import BookingFormWrapper from "./BookingFormWrapper";


// ---- Types ----
type Service = {
  id: string;
  title: string;
  description: string | null;
  type: "car";
  location: string | null;
  price: string | null;
  images: string[];
  address: string | null;
  amenities: { name: string }[];
  average_rating: number;
  reviews_count: number;
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

export default function CarDetailPage() {
  console.log("BookingFormWrapper:", BookingFormWrapper);

  const { id: rawId } = useParams();
  const id = Array.isArray(rawId) ? rawId[0] : rawId ?? "";

  const [service, setService] = useState<Service | null>(null);
  const [nearby, setNearby] = useState<NearbyLocation[]>([]);
  const [reviews, setReviews] = useState<ServiceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("services")
          .select("*")
          .eq("id", id)
          .eq("type", "car")
          .single();

        if (fetchError) throw new Error(fetchError.message);
        setService(data as Service);

        const region = data?.location || "";
        if (region) {
          const { data: locs } = await supabase
            .from("locations")
            .select("*")
            .ilike("region", `%${region}%`)
            .limit(6);
          setNearby(locs || []);
        }

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
        console.error("Error fetching car service:", err);
        setError("Không tìm thấy dịch vụ.");
      } finally {
        setLoading(false);
        // Trigger initial load animation after data is loaded
        setTimeout(() => {
          setIsInitialLoad(false);
        }, 200);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="p-6 text-gray-400 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-4"></div>
      <p>Đang tải...</p>
    </div>
  );
  
  if (error || !service)
    return (
      <div 
        className={`p-6 text-red-400 text-center transition-all duration-700 ease-out ${
          isInitialLoad 
            ? 'opacity-0 translate-y-4' 
            : 'opacity-100 translate-y-0'
        }`}
      >
        {error || "Không tìm thấy dịch vụ"}
      </div>
    );

  return (
    <ResizableLayout>
      <div className="min-h-screen bg-black text-white mt-16 md:mt-0">
        <main 
          className={`max-w-4xl mx-auto px-4 py-6 space-y-8 transition-all duration-1000 ease-out ${
            isInitialLoad 
              ? 'opacity-0 translate-y-8' 
              : 'opacity-100 translate-y-0'
          }`}
        >
          <div 
            className={`transition-all duration-700 ease-out delay-300 ${
              isInitialLoad 
                ? 'opacity-0 translate-y-6' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            <ServiceBreadcrumb service={service} />
          </div>
          
          <div 
            className={`transition-all duration-700 ease-out delay-500 ${
              isInitialLoad 
                ? 'opacity-0 translate-y-6' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            <ServiceHeader service={service} />
          </div>
          
          <div 
            className={`transition-all duration-700 ease-out delay-700 ${
              isInitialLoad 
                ? 'opacity-0 translate-y-6' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            <ServiceGallery images={service.images} title={service.title} />
          </div>
          
          <div 
            className={`transition-all duration-700 ease-out delay-900 ${
              isInitialLoad 
                ? 'opacity-0 translate-y-6' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            <ServiceAmenities amenities={service.amenities} />
          </div>
          
          <div 
            className={`transition-all duration-700 ease-out delay-1100 ${
              isInitialLoad 
                ? 'opacity-0 translate-y-6' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            <ServiceDescription description={service.description} />
          </div>
          
          {service.address && (
            <div 
              className={`transition-all duration-700 ease-out delay-1300 ${
                isInitialLoad 
                  ? 'opacity-0 translate-y-6' 
                  : 'opacity-100 translate-y-0'
              }`}
            >
              <ServiceMap address={service.address} />
            </div>
          )}
          
          <div 
            className={`transition-all duration-700 ease-out delay-1500 ${
              isInitialLoad 
                ? 'opacity-0 translate-y-6' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            <ServiceNearby nearby={nearby} location={service.location} />
          </div>
          
          <div 
            className={`transition-all duration-700 ease-out delay-1700 ${
              isInitialLoad 
                ? 'opacity-0 translate-y-6' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            <ServiceReviews 
              reviews={reviews} 
              serviceType={service.type}  // Lấy từ dữ liệu
              serviceId={service.id}
            />
          </div>
          
          {/* Tích hợp BookingFormWrapper */}
          <div 
            className={`transition-all duration-700 ease-out delay-1900 ${
              isInitialLoad 
                ? 'opacity-0 translate-y-6' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            <BookingFormWrapper
              serviceId={service.id}
              price={service.price}
              serviceTitle={service.title}
            />
          </div>
        </main>
      </div>
    </ResizableLayout>
  );
}