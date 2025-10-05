"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import ResizableLayout from "@/components/ResizableLayout";

type Booking = {
  id: string;
  full_name: string | null;
  phone: string | null;
  date_from: string;
  date_to: string;
  additional_requests: string | null;
  status: string;
  services?: {
    title: string;
    price: string | null;
  } | null;
};

function PaymentContent() {
  const params = useSearchParams();
  const bookingId = params.get("bookingId");

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setError("Thiếu mã đơn đặt chỗ.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select("*, services(title, price)")
          .eq("id", bookingId)
          .single();

        if (error) throw error;
        setBooking(data as Booking);
      } catch (err: any) {
        console.error("Payment fetch error:", err);
        setError("Không tìm thấy thông tin thanh toán.");
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingId]);

  const handlePayment = async (method: string) => {
    if (!booking) return;
    setPaying(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "confirmed" })
        .eq("id", booking.id);

      if (error) throw error;

      setSuccess(true);
    } catch (err: any) {
      console.error("Payment error:", err);
      setError("Thanh toán thất bại. Vui lòng thử lại.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <ResizableLayout>
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          Đang tải thông tin thanh toán...
        </div>
      </ResizableLayout>
    );
  }

  if (error || !booking) {
    return (
      <ResizableLayout>
        <div className="min-h-screen flex items-center justify-center bg-black text-red-400">
          {error || "Không tìm thấy đơn đặt chỗ."}
        </div>
      </ResizableLayout>
    );
  }

  return (
    <ResizableLayout>
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg p-6 text-white space-y-6">
          <h1 className="text-center text-xl font-bold">Thanh toán</h1>

          {/* Thông tin booking */}
          <div className="space-y-1 text-sm text-gray-300">
            <p>
              <span className="font-semibold">Dịch vụ:</span>{" "}
              {booking.services?.title}
            </p>
            <p>
              <span className="font-semibold">Tên khách:</span>{" "}
              {booking.full_name}
            </p>
            <p>
              <span className="font-semibold">SĐT:</span> {booking.phone}
            </p>
            <p>
              <span className="font-semibold">Ngày:</span>{" "}
              {booking.date_from} → {booking.date_to}
            </p>
            <p>
              <span className="font-semibold">Giá:</span>{" "}
              {booking.services?.price || "Liên hệ"}
            </p>
            <p>
              <span className="font-semibold">Trạng thái:</span>{" "}
              <span
                className={`${
                  booking.status === "confirmed"
                    ? "text-green-400"
                    : "text-yellow-400"
                }`}
              >
                {booking.status}
              </span>
            </p>
          </div>

          {/* Phương thức thanh toán */}
          {!success && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-200">
                Chọn phương thức
              </h2>
              <button
                disabled={paying}
                onClick={() => handlePayment("momo")}
                className="w-full rounded-xl border border-white/20 py-3 font-semibold hover:bg-white/10 transition disabled:opacity-50"
              >
                Thanh toán bằng Momo
              </button>
              <button
                disabled={paying}
                onClick={() => handlePayment("zalopay")}
                className="w-full rounded-xl border border-white/20 py-3 font-semibold hover:bg-white/10 transition disabled:opacity-50"
              >
                Thanh toán bằng ZaloPay
              </button>
              <button
                disabled={paying}
                onClick={() => handlePayment("card")}
                className="w-full rounded-xl border border-white/20 py-3 font-semibold hover:bg-white/10 transition disabled:opacity-50"
              >
                Thanh toán bằng Thẻ
              </button>
            </div>
          )}

          {/* Trạng thái */}
          {paying && (
            <p className="text-center text-gray-400">Đang xử lý thanh toán...</p>
          )}
          {success && (
            <p className="text-center text-green-400">
              Thanh toán thành công! Vui lòng kiểm tra đơn trong trang cá nhân.
            </p>
          )}
          {error && <p className="text-center text-red-400">{error}</p>}

          <p className="text-center text-xs text-gray-400">
            Bằng cách thanh toán, bạn đồng ý với{" "}
            <span className="underline">Điều khoản dịch vụ</span>.
          </p>
        </div>
      </div>
    </ResizableLayout>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <ResizableLayout>
          <div className="min-h-screen flex items-center justify-center bg-black text-white">
            Đang tải...
          </div>
        </ResizableLayout>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
