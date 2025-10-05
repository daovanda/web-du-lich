"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import BookingForm from "@/components/BookingForm";
import ResizableLayout from "@/components/ResizableLayout";

// ---- Types ----
type Service = {
  id: string;
  title: string;
  description: string | null;
  type: "car";
  location: string | null;
  price: string | null;
  images: string[];
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
  const { id: rawId } = useParams();
  const id = Array.isArray(rawId) ? rawId[0] : rawId ?? "";

  const [service, setService] = useState<Service | null>(null);
  const [nearby, setNearby] = useState<NearbyLocation[]>([]);
  const [reviews, setReviews] = useState<ServiceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // Lấy chi tiết service car
        const { data, error: fetchError } = await supabase
          .from("services")
          .select("*")
          .eq("id", id)
          .eq("type", "car")
          .single();

        if (fetchError) throw new Error(fetchError.message);
        setService(data as Service);

        // Nearby
        const region = data?.location || "";
        if (region) {
          const { data: locs } = await supabase
            .from("locations")
            .select("*")
            .ilike("region", `%${region}%`)
            .limit(6);
          setNearby(locs || []);
        }

        // Reviews
        const { data: rv } = await supabase
          .from("service_reviews")
          .select(
            `
            id,
            rating,
            comment,
            user:profiles(full_name, username)
          `
          )
          .eq("service_id", id)
          .order("created_at", { ascending: false })
          .limit(4);

        setReviews(
          (rv || []).map((r: any) => ({
            ...r,
            user: Array.isArray(r.user) ? r.user[0] : r.user,
          }))
        );
      } catch (err: any) {
        setError("Không tìm thấy dịch vụ.");
        console.error("Error fetching car service:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    const index = Math.round(scrollLeft / width);
    setCurrentIndex(index);
  };

  if (loading) return <p className="p-6 text-gray-400">Đang tải...</p>;
  if (error || !service)
    return <p className="p-6 text-red-400">{error || "Không tìm thấy dịch vụ"}</p>;

  const gallery =
    service.images && service.images.length > 0 ? service.images : ["/anh1.jpeg"];

  return (
    <ResizableLayout>
      <div className="min-h-screen bg-black text-white">
        <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-400">
            <span className="opacity-80">Việt Nam</span>
            {service.location ? <> &nbsp;/&nbsp; <span>{service.location}</span></> : null}
            &nbsp;/&nbsp; <span className="text-gray-100">{service.title}</span>
          </div>

          {/* Title + meta */}
          <div>
            <h1 className="mb-2 text-2xl font-bold">{service.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <span className="rounded bg-blue-600 px-2 py-1 font-semibold text-white">
                  {service.average_rating?.toFixed(1) || "0.0"}
                </span>
                <span>{service.reviews_count} đánh giá</span>
              </div>
              <span>• Xe di chuyển</span>
              {service.location && <span>• {service.location}</span>}
            </div>
          </div>

          {/* Gallery */}
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

          {/* Tiện ích */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="mb-3 text-lg font-semibold">Tiện ích chính</h3>
            <ul className="grid grid-cols-2 gap-2 text-sm text-gray-300 md:grid-cols-3">
              {service.amenities?.length > 0 ? (
                service.amenities.map((a, i) => <li key={i}>• {a.name}</li>)
              ) : (
                <li>• Không có dữ liệu</li>
              )}
            </ul>
          </div>

          {/* Mô tả */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="mb-2 text-lg font-semibold">Mô tả</h3>
            <p className="text-gray-300">
              {service.description || "Dịch vụ xe chất lượng, thuận tiện cho mọi hành trình."}
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
                    <img
                      src={l.image_url || "/anh1.jpeg"}
                      alt={l.name}
                      className="h-40 w-full object-cover"
                    />
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
                reviews.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-xl border border-white/10 bg-black/20 p-3"
                  >
                    <div className="text-sm text-gray-300">
                      {r.user?.full_name || r.user?.username || "Khách"} •{" "}
                      <span className="font-semibold">{r.rating}/5</span>
                    </div>
                    <p className="mt-1 text-gray-200">
                      {r.comment || "Không có bình luận."}
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

          {/* Booking Form */}
          <BookingForm serviceId={service.id} price={service.price} />
        </main>
      </div>
    </ResizableLayout>
  );
}
