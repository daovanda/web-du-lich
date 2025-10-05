"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import BookingForm from "@/components/BookingForm"; // 👈 nhớ tạo file BookingForm.tsx riêng
import ResizableLayout from "@/components/ResizableLayout";

type Service = {
  id: string;
  title: string;
  description: string | null;
  type: "stay" | "car" | "motorbike";
  location: string | null;
  price: string | null;
  images: string[] | null;
  average_rating: number;
  reviews_count: number;
  amenities: { name: string }[] | null;
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
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: { full_name: string | null; username: string | null };
};

export default function MotorbikeDetailPage() {
  const params = useParams();
  const rawId = params?.id as string | string[] | undefined;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [service, setService] = useState<Service | null>(null);
  const [nearby, setNearby] = useState<NearbyLocation[]>([]);
  const [reviews, setReviews] = useState<ServiceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        // Lấy dịch vụ
        const { data: serviceData, error: serviceError } = await supabase
          .from("services")
          .select(
            "id, title, description, type, location, price, images, average_rating, reviews_count, amenities"
          )
          .eq("id", id)
          .eq("type", "motorbike")
          .single();

        if (serviceError) throw serviceError;
        setService(serviceData as Service);

        // Lấy địa điểm lân cận
        const region = (serviceData?.location as string) || "";
        if (region) {
          const { data: locs } = await supabase
            .from("locations")
            .select("id, name, type, region, image_url")
            .ilike("region", `%${region}%`)
            .limit(6);
          setNearby((locs as NearbyLocation[]) || []);
        }

        // Lấy đánh giá dịch vụ
        const { data: reviewsData } = await supabase
          .from("service_reviews")
          .select(
            "id, user_id, rating, comment, created_at, profiles(full_name, username)"
          )
          .eq("service_id", id)
          .order("created_at", { ascending: false })
          .limit(2);

        setReviews(
          (reviewsData || []).map((review: any) => ({
            ...review,
            profiles: Array.isArray(review.profiles)
              ? review.profiles[0]
              : review.profiles,
          }))
        );
      } catch (e: any) {
        console.error(e);
        setErr("Không tìm thấy dịch vụ.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    const index = Math.round(scrollLeft / width);
    setCurrentIndex(index);
  };

  if (loading) return <p className="p-6 text-gray-400">Đang tải...</p>;
  if (err || !service)
    return <p className="p-6 text-red-400">{err || "Không tìm thấy dịch vụ"}</p>;

  const gallery = service.images ?? [];

  return (
    <ResizableLayout>
      <div className="min-h-screen bg-black text-white">
        <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-400">
            <span className="opacity-80">Việt Nam</span>
            {service.location && (
              <>
                {" "}&nbsp;/&nbsp; <span>{service.location}</span>
              </>
            )}
            &nbsp;/&nbsp; <span className="text-gray-100">{service.title}</span>
          </div>

          {/* Tiêu đề + meta */}
          <div>
            <h1 className="mb-2 text-2xl font-bold">{service.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <span className="rounded bg-blue-600 px-2 py-1 font-semibold text-white">
                  {service.average_rating?.toFixed(1) ?? "0.0"}
                </span>
                <span>{service.reviews_count} đánh giá</span>
              </div>
              <span>• Xe máy</span>
              {service.location && <span>• {service.location}</span>}
            </div>
          </div>

          {/* Gallery */}
          {gallery.length > 0 && (
            <div className="relative">
              <div
                className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth"
                onScroll={handleScroll}
              >
                {gallery.map((src, i) => (
                  <div key={i} className="flex-shrink-0 w-full snap-center">
                    <img
                      src={src}
                      alt={`${service.title} - ${i + 1}`}
                      className="w-full h-72 md:h-[420px] object-cover rounded-2xl"
                    />
                  </div>
                ))}
              </div>
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                {gallery.map((_, i) => (
                  <span
                    key={i}
                    className={`h-2 w-2 rounded-full ${
                      i === currentIndex ? "bg-white" : "bg-gray-500"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tiện ích */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="mb-3 text-lg font-semibold">Tiện ích chính</h3>
            {service.amenities?.length ? (
              <ul className="grid grid-cols-2 gap-2 text-sm text-gray-300 md:grid-cols-3">
                {service.amenities.map((amenity, i) => (
                  <li key={i}>• {amenity.name}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">Chưa có tiện ích nào.</p>
            )}
          </div>

          {/* Mô tả */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="mb-2 text-lg font-semibold">Mô tả</h3>
            <p className="text-gray-300">
              {service.description || "Chưa có mô tả cho dịch vụ này."}
            </p>
          </div>

          {/* Bản đồ */}
          {service.location && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="mb-2 text-lg font-semibold">Bản đồ</h3>
              <iframe
                title="map"
                className="h-72 w-full rounded-xl"
                loading="lazy"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  service.location
                )}&output=embed`}
              />
            </div>
          )}

          {/* Nearby */}
          {nearby.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="mb-3 text-lg font-semibold">Trong khu vực</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {nearby.map((l) => (
                  <div
                    key={l.id}
                    className="overflow-hidden rounded-xl border border-white/10 bg-black/30 hover:bg-white/10 transition"
                  >
                    {l.image_url && (
                      <img
                        src={l.image_url}
                        alt={l.name}
                        className="h-40 w-full object-cover"
                      />
                    )}
                    <div className="p-3">
                      <div className="text-xs uppercase text-gray-400">
                        {l.type} • {l.region || service.location}
                      </div>
                      <div className="mt-1 font-medium">{l.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Đánh giá */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Đánh giá từ khách</h3>
              <button className="rounded-lg border border-white/20 px-3 py-1.5 text-sm hover:bg-white/10">
                Xem thêm
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-white/10 bg-black/20 p-3"
                  >
                    <div className="text-sm text-gray-300">
                      {review.profiles?.full_name ||
                        review.profiles?.username ||
                        "Khách"}{" "}
                      • <span className="font-semibold">{review.rating}/5</span>
                    </div>
                    <p className="mt-1 text-gray-200">
                      {review.comment || "Không có bình luận."}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <div className="text-sm text-gray-300">
                    Chưa có đánh giá • <span className="font-semibold">0/5</span>
                  </div>
                  <p className="mt-1 text-gray-200">Chưa có bình luận.</p>
                </div>
              )}
            </div>
          </div>

          {/* Booking form component */}
          <BookingForm serviceId={service.id} price={service.price} />
        </main>
      </div>
    </ResizableLayout>
  );
}
