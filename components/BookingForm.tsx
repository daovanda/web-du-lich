"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type BookingFormProps = {
  serviceId: string;
  price?: string | null;
};

// Hàm format ngày yyyy-mm-dd (local timezone, tránh lệch UTC)
const formatDate = (date: Date | null) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Regex VN: số bắt đầu bằng 0 và có 10–11 chữ số
const isValidPhone = (value: string) => /^0\d{9,10}$/.test(value);

export default function BookingForm({ serviceId, price }: BookingFormProps) {
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isValidDate = !!from && !!to && from >= today && to >= from;
  const canBook = isValidDate && !!fullName && isValidPhone(phone);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canBook) return;

    setLoading(true);
    setError(null);

    try {
      // Check user login
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      // Insert booking + lấy lại id
      const { data: inserted, error: insertError } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          service_id: serviceId,
          date_from: formatDate(from),
          date_to: formatDate(to),
          full_name: fullName,
          phone,
          additional_requests: note,
          status: "pending",
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      // Redirect sang trang thanh toán
      router.push(`/payment?bookingId=${inserted.id}`);
    } catch (err: any) {
      console.error("Booking error:", err);
      setError(err.message || "Đặt phòng thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="mb-3 text-right text-sm text-gray-300">Giá/đêm từ</div>
      <div className="mb-4 text-right text-2xl font-bold text-blue-400">
        {price || "Liên hệ"}
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        {/* Ngày đến */}
        <div className="w-full">
          <label className="mb-1 block text-sm text-gray-300">Ngày đến</label>
          <DatePicker
            selected={from}
            onChange={(date) => setFrom(date)}
            minDate={today}
            dateFormat="dd/MM/yyyy"
            placeholderText="Chọn ngày đến"
            className="block w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white"
          />
        </div>

        {/* Ngày đi */}
        <div className="w-full">
          <label className="mb-1 block text-sm text-gray-300">Ngày đi</label>
          <DatePicker
            selected={to}
            onChange={(date) => setTo(date)}
            minDate={from || today}
            dateFormat="dd/MM/yyyy"
            placeholderText="Chọn ngày đi"
            className="block w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white"
          />
          {from && to && to < from && (
            <p className="mt-1 text-sm text-red-400">
              Ngày đi không được sớm hơn ngày đến.
            </p>
          )}
        </div>

        {/* Họ và Tên */}
        <div>
          <label className="mb-1 block text-sm text-gray-300">Họ và Tên</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white outline-none"
          />
        </div>

        {/* Số điện thoại */}
        <div>
          <label className="mb-1 block text-sm text-gray-300">Số điện thoại</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`w-full rounded-lg border px-3 py-2 outline-none ${
              phone && !isValidPhone(phone)
                ? "border-red-500 bg-black/30 text-red-400"
                : "border-white/20 bg-black/30 text-white"
            }`}
          />
          {phone && !isValidPhone(phone) && (
            <p className="mt-1 text-sm text-red-400">
              Số điện thoại không hợp lệ (phải bắt đầu bằng 0 và có 10-11 số).
            </p>
          )}
        </div>

        {/* Ghi chú */}
        <div>
          <label className="mb-1 block text-sm text-gray-300">Ghi chú</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white outline-none"
            rows={3}
          />
        </div>

        {/* Nút submit */}
        <button
          type="submit"
          disabled={!canBook || loading}
          className="w-full rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : "Đặt ngay"}
        </button>
      </form>

      {/* Thông báo lỗi */}
      {error && <p className="mt-3 text-red-400">{error}</p>}

      <div className="mt-4 space-y-1 text-sm text-gray-300">
        <div>• Xác nhận tức thì</div>
        <div>• Không cần thẻ tín dụng</div>
        <div>• Hỗ trợ 24/7</div>
      </div>
    </div>
  );
}
