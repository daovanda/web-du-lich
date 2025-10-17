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
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <p className="p-6 text-gray-400">Đang tải...</p>;
  if (error || !service)
    return <p className="p-6 text-red-400">{error || "Không tìm thấy dịch vụ"}</p>;

  return (
    <ResizableLayout>
      <div className="min-h-screen bg-black text-white mt-16 md:mt-0">
        <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
          <ServiceBreadcrumb service={service} />
          <ServiceHeader service={service} />
          <ServiceGallery images={service.images} title={service.title} />
          <ServiceAmenities amenities={service.amenities} />
          <ServiceDescription description={service.description} />
          {service.address && <ServiceMap address={service.address} />}
          <ServiceNearby nearby={nearby} location={service.location} />
          <ServiceReviews reviews={reviews} />
          {/* Tích hợp BookingFormWrapper */}
          <BookingFormWrapper
            serviceId={service.id}
            price={service.price}
            serviceTitle={service.title}
          />
        </main>
      </div>
    </ResizableLayout>
  );
}
