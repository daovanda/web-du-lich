"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

// ---- Types ----
type Service = {
  id: string;
  title: string;
  description: string | null;
  type: "stay" | "car" | "motorbike";
  location: string | null;
  price: string | null;
  image_url: string | null;
};

type NearbyLocation = {
  id: string;
  name: string;
  type: string | null;
  region: string | null;
  image_url: string | null;
};

// ---- Utils ----
const todayISO = () => new Date().toISOString().slice(0, 10);

export default function StayDetailPage() {
  const params = useParams();
  const router = useRouter();

  // ép id về string an toàn
  const rawId = params?.id as string | string[] | undefined;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [service, setService] = useState<Service | null>(null);
  const [nearby, setNearby] = useState<NearbyLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Booking form state
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  // ===== Gallery: dùng ảnh local trong /public =====
  const gallery = ["/anh1.jpeg", "/anh2.jpeg", "/anh3.jpeg", "/anh4.jpeg", "/anh5.jpeg"];

  // điểm & lượng đánh giá giả lập
  const rating = 8.4;
  const reviewsCount = 772;

  // điều kiện cho phép đặt
  const canBook = !!from && !!to && from <= to && !!id;

  useEffect(() => {
    if (!id) return; // chưa có id thì thôi
    (async () => {
      try {
        // Fetch service
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("id", id)
          .eq("type", "stay")
          .single();
        if (error) throw error;
        setService(data as Service);

        // Nearby by region ~ location
        const region = (data?.location as string) || "";
        if (region) {
          const { data: locs } = await supabase
            .from("locations")
            .select("*")
            .ilike("region", `%${region}%`)
            .limit(6);
          setNearby((locs as any) || []);
        }
      } catch (e: any) {
        console.error(e);
        setErr("Không tìm thấy dịch vụ.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!canBook) return;
  router.push(`/services/stay/${encodeURIComponent(id!)}`
    + `/room?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
};


  if (loading) return <p className="p-6">Đang tải...</p>;
  if (err || !service) return <p className="p-6">{err || "Không tìm thấy dịch vụ"}</p>;

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Header />

      <main className="container mx-auto flex-1 px-3 py-6 md:px-6">
        {/* Breadcrumb + title */}
        <div className="mb-3 text-sm text-gray-300">
          <span className="opacity-80">Việt Nam</span>
          {service.location ? <> &nbsp;/&nbsp; <span>{service.location}</span></> : null}
          &nbsp;/&nbsp; <span className="text-gray-100">{service.title}</span>
        </div>

        <h1 className="mb-3 text-2xl font-bold">Chỗ ở: {service.title}</h1>

        {/* Rating / meta row */}
        <div className="mb-4 flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-600 px-2 py-1 font-semibold">{rating}</span>
            <span className="text-gray-300">{reviewsCount} đánh giá</span>
          </div>
          <div className="text-gray-300">• {service.type === "stay" ? "Khách sạn/Homestay" : service.type}</div>
          {service.location && <div className="text-gray-300">• {service.location}</div>}
        </div>

        {/* Top grid: gallery + booking card */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Gallery */}
          <section className="md:col-span-2">
            <div className="grid grid-cols-4 gap-2 overflow-hidden rounded-2xl">
              <div className="col-span-4 md:col-span-2">
                <img
                  src={gallery[0]}
                  alt={service.title}
                  className="h-72 w-full rounded-xl object-cover md:h-[420px]"
                />
              </div>
              {gallery.slice(1, 5).map((src) => (
                <img key={src} src={src} alt="" className="hidden h-36 w-full rounded-xl object-cover md:block" />
              ))}
            </div>

            {/* Tiện ích chính */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="mb-3 text-lg font-semibold">Tiện ích chính</h3>
              <ul className="grid grid-cols-2 gap-2 text-sm text-gray-300 md:grid-cols-3">
                <li>• Wi-Fi</li>
                <li>• Lễ tân 24h</li>
                <li>• Máy lạnh</li>
                <li>• Bãi đỗ xe</li>
                <li>• Ăn sáng</li>
                <li>• Hủy linh hoạt (tùy loại phòng)</li>
              </ul>
            </div>

            {/* Mô tả */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="mb-2 text-lg font-semibold">Mô tả</h3>
              <p className="whitespace-pre-line text-gray-300">
                {service.description || "Chỗ nghỉ tiện nghi, vị trí thuận tiện để khám phá khu vực."}
              </p>
            </div>

            {/* Bản đồ */}
            {service.location && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="mb-2 text-lg font-semibold">Bản đồ</h3>
                <p className="mb-3 text-sm text-gray-300">Khu vực: {service.location}</p>
                <iframe
                  title="map"
                  className="h-72 w-full rounded-xl"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(service.location)}&output=embed`}
                />
              </div>
            )}

            {/* Gợi ý quanh đây */}
            {nearby.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 text-lg font-semibold">Trong khu vực</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {nearby.map((l) => (
                    <div key={l.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
                      <img
                        src={l.image_url || "/anh1.jpeg"}
                        alt={l.name}
                        className="h-32 w-full object-cover"
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

            {/* Đánh giá (demo) */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Đánh giá từ khách</h3>
                <button className="rounded-lg border border-white/20 px-3 py-1.5 text-sm">Xem thêm</button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <div className="text-sm text-gray-300">
                    Bùi P. T. • <span className="font-semibold">9.7/10</span>
                  </div>
                  <p className="mt-1 text-gray-200">
                    Rất thích và đúng với ảnh trên app, nhân viên phục vụ chu đáo nhiệt tình.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <div className="text-sm text-gray-300">
                    Thi Han Tran • <span className="font-semibold">9.7/10</span>
                  </div>
                  <p className="mt-1 text-gray-200">Phòng ổn so với giá tiền, đi lại cũng khá thuận tiện.</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                *Demo đánh giá. Có thể gắn bảng `reviews` nếu map với `services`.
              </p>
            </div>
          </section>

          {/* Booking sticky card */}
          <aside className="md:col-span-1">
            <div className="sticky top-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 text-right text-sm text-gray-300">Giá/đêm từ</div>
              <div className="mb-4 text-right text-2xl font-bold text-blue-400">
                {service.price || "Liên hệ"}
              </div>

              <form onSubmit={onSubmit} className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm text-gray-300">Ngày đến</label>
                  <input
                    type="date"
                    required
                    min={todayISO()}
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-300">Ngày đi</label>
                  <input
                    type="date"
                    required
                    min={from || todayISO()}
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!canBook}
                  className="w-full rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Chọn phòng
                </button>

                <p className="text-xs text-gray-400">
                  *Đặt phòng demo (chưa trừ tồn). Có thể bật kiểm tra trùng ngày & trạng thái.
                </p>
              </form>

              {/* Hỗ trợ nhanh */}
              <div className="mt-4 space-y-1 text-sm text-gray-300">
                <div>• Xác nhận tức thì</div>
                <div>• Không cần thẻ tín dụng</div>
                <div>• Hỗ trợ 24/7</div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
