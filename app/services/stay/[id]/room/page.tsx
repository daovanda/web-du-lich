"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

// Kiểu dữ liệu giống services
type Service = {
  id: string;
  title: string;
  description: string | null;
  type: "stay" | "car" | "motorbike";
  location: string | null;
  price: string | null;        // text: "400.000đ/đêm"
  image_url: string | null;
};

export default function BookingPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const search = useSearchParams();
  const dateFrom = search.get("from") || "";
  const dateTo   = search.get("to")   || "";

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Form liên hệ
  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [isGuestSelf, setIsGuestSelf] = useState(true);
  const [requests, setRequests] = useState<string[]>([]);
  const [insurance, setInsurance] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse giá từ text "400.000đ/đêm" -> 400000
  const pricePerNight = useMemo(() => {
    if (!service?.price) return 0;
    const digits = service.price.replace(/[^\d]/g, "");
    return Number(digits || "0");
  }, [service?.price]);

  // Số đêm
  const nights = useMemo(() => {
    if (!dateFrom || !dateTo) return 1;
    const a = new Date(dateFrom);
    const b = new Date(dateTo);
    const diff = Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(diff, 1);
  }, [dateFrom, dateTo]);

  // Thuế & phí (demo): 15% tổng phòng
  const roomSubtotal = pricePerNight * nights;
  const taxes        = Math.round(roomSubtotal * 0.15);
  const insuranceFee = insurance ? 43500 : 0; // ví dụ 43.500đ
  const total        = roomSubtotal + taxes + insuranceFee;

  // Gallery dùng ảnh local
  const gallery = ["/anh1.jpeg", "/anh2.jpeg", "/anh3.jpeg", "/anh4.jpeg", "/anh5.jpeg"];

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("id", id)
          .single();
        if (error) throw error;
        setService(data as Service);
      } catch (e: any) {
        console.error(e);
        setErr("Không tìm thấy dịch vụ.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const toggleRequest = (key: string) => {
    setRequests(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate cơ bản
    if (!fullName || !email || !phone) {
      alert("Vui lòng điền đủ Họ tên, Email, Số điện thoại.");
      return;
    }
    if (!dateFrom || !dateTo) {
      alert("Thiếu ngày nhận/trả phòng.");
      return;
    }
    if (new Date(dateTo) < new Date(dateFrom)) {
      alert("Ngày trả phòng phải sau hoặc bằng ngày nhận phòng.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Lấy user_id nếu đã đăng nhập
      const { data: userData } = await supabase.auth.getUser();
      const user_id = userData?.user?.id ?? null;

      // DEMO insert booking (RLS cần cho phép)
      const { error } = await supabase.from("bookings").insert({
        user_id,                      // gắn user nếu có
        service_id: id,
        date_from: dateFrom,
        date_to: dateTo,
        status: "pending",
      });

      if (error) throw error;

      alert("Đặt phòng thành công! (Demo) — chuyển sang bước thanh toán sau.");
      // TODO: router.push('/payment/...')
    } catch (e: any) {
      console.error(e);
      alert("Không tạo được đặt phòng. Kiểm tra RLS/permissions trong Supabase.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p className="p-6">Đang tải...</p>;
  if (err || !service) return <p className="p-6">{err || "Không tìm thấy dịch vụ"}</p>;

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Header />

      <main className="container mx-auto flex-1 px-3 py-6 md:px-6">
        <h1 className="mb-4 text-2xl font-bold">Đặt phòng của bạn</h1>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Cột trái: Form & chính sách */}
          <section className="space-y-4 md:col-span-2">
            {/* Banner đăng nhập: CHỈ hiện khi chưa đăng nhập */}
            <LoginBanner />

            {/* Thông tin liên hệ */}
            <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="mb-3 text-lg font-semibold">Thông tin liên hệ (đối với E-voucher)</h3>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-gray-300">Tên đầy đủ</label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="vd: John Maeda"
                    className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-300">Số điện thoại</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+84 912345678"
                    className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm text-gray-300">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vi-du@example.com"
                    className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Chúng tôi sẽ gửi e-voucher tới email này.
                  </p>
                </div>
              </div>

              <div className="mt-3 flex gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={isGuestSelf}
                    onChange={() => setIsGuestSelf(true)}
                  />
                  Tôi là khách lưu trú
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={!isGuestSelf}
                    onChange={() => setIsGuestSelf(false)}
                  />
                  Tôi đặt cho người khác
                </label>
              </div>

              {/* Yêu cầu */}
              <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-3">
                <h4 className="mb-2 font-semibold">Bạn yêu cầu nào không?</h4>
                <div className="grid gap-2 md:grid-cols-3 text-sm">
                  {[
                    ["no_smoke", "Phòng không hút thuốc"],
                    ["high_floor", "Tầng cao"],
                    ["early_checkin", "Giờ nhận phòng sớm"],
                    ["late_checkout", "Giờ trả phòng trễ"],
                    ["connecting", "Phòng liền thông"],
                    ["bed_type", "Loại giường"],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={requests.includes(key)}
                        onChange={() =>
                          setRequests(prev =>
                            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
                          )
                        }
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Khách sạn sẽ cố gắng đáp ứng nhưng không đảm bảo.
                </p>
              </div>

              {/* Tiện ích bổ sung */}
              <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
                <h4 className="mb-2 font-semibold">Tiện ích bổ sung cho kỳ nghỉ</h4>
                <label className="flex items-center justify-between gap-3 text-sm">
                  <span>
                    Bảo hiểm Du lịch <span className="opacity-60">(Chubb – Hotel Protect)</span>
                  </span>
                  <span className="opacity-80">43.500đ</span>
                  <input
                    type="checkbox"
                    checked={insurance}
                    onChange={() => setInsurance(v => !v)}
                  />
                </label>
              </div>

              {/* Chính sách */}
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
                  <h4 className="mb-1 font-semibold">Chính sách hủy & đổi lịch</h4>
                  <ul className="list-disc pl-5 text-gray-300">
                    <li>Miễn phí hủy trước 2 ngày.</li>
                    <li>Có thể đổi lịch (tuỳ loại giá).</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
                  <h4 className="mb-1 font-semibold">Chính sách lưu trú</h4>
                  <p className="text-gray-300">
                    Trẻ em 0–5 tuổi miễn phí khi dùng giường có sẵn. Giường phụ có thể tính phí.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <button
                  className="w-full rounded-xl bg-orange-500 px-4 py-3 text-center text-base font-semibold hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang xử lý..." : "Tiếp tục thanh toán"}
                </button>
                <p className="mt-2 text-center text-xs text-gray-400">
                  Bằng việc tiếp tục, bạn đồng ý với Điều khoản & Điều kiện.
                </p>
              </div>
            </form>
          </section>

          {/* Cột phải: Thẻ tóm tắt */}
          <aside className="md:col-span-1">
            <div className="sticky top-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <img
                  src={service.image_url || gallery[0]}
                  alt={service.title}
                  className="h-20 w-28 rounded-lg object-cover"
                />
                <div>
                  <div className="line-clamp-2 font-semibold">{service.title}</div>
                  <div className="text-sm text-gray-300">{service.location}</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-gray-400">Nhận phòng</div>
                  <div className="font-medium">{dateFrom || "—"}</div>
                </div>
                <div>
                  <div className="text-gray-400">Trả phòng</div>
                  <div className="font-medium">{dateTo || "—"}</div>
                </div>
                <div>
                  <div className="text-gray-400">Số đêm</div>
                  <div className="font-medium">{nights}</div>
                </div>
                <div>
                  <div className="text-gray-400">Khách</div>
                  <div className="font-medium">2 người (demo)</div>
                </div>
              </div>

              <hr className="my-4 border-white/10" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Giá phòng</span>
                  <span>{roomSubtotal.toLocaleString("vi-VN")} đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Thuế & phí (15%)</span>
                  <span>{taxes.toLocaleString("vi-VN")} đ</span>
                </div>
                {insurance && (
                  <div className="flex justify-between">
                    <span>Bảo hiểm</span>
                    <span>{insuranceFee.toLocaleString("vi-VN")} đ</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-white/10 pt-2 text-base font-semibold">
                  <span>Tổng giá</span>
                  <span>{total.toLocaleString("vi-VN")} đ</span>
                </div>
                <p className="text-xs text-gray-400">Bạn chưa bị trừ tiền!</p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/** Banner đăng nhập — chỉ hiển thị khi CHƯA đăng nhập */
function LoginBanner() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setAuthed(!!s?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (authed === null || authed) return null; // đang kiểm tra hoặc đã login -> ẩn

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c111d] p-4 text-sm flex items-center justify-between">
      <p>Nhận ưu đãi độc quyền và tiện ích hơn khi bạn đăng nhập.</p>
      <a href="/login" className="rounded-lg bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-500">
        Đăng nhập
      </a>
    </div>
  );
}
