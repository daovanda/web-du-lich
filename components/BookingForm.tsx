"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type BookingFormProps = {
  serviceId: string;
  price?: string | null;
  onSubmitSuccess?: (formData: any) => Promise<void> | void;
};

// yyyy-mm-dd (local)
const formatDate = (date: Date | null) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// VN phone: 0 + 9–10 digits
const isValidPhone = (value: string) => /^0\d{9,10}$/.test(value);

// Parse "1.200.000đ" -> 1200000
const parsePriceNumber = (value?: string | null): number | null => {
  if (!value) return null;
  const onlyNum = value.replace(/[^0-9.,]/g, "").replace(/\./g, "").replace(/,/g, "");
  const parsed = Number(onlyNum);
  return Number.isFinite(parsed) ? parsed : null;
};

// Số đêm
const countNights = (from: Date | null, to: Date | null) => {
  if (!from || !to) return 0;
  const start = new Date(from);
  const end = new Date(to);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const ms = end.getTime() - start.getTime();
  const nights = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return Math.max(0, nights);
};

export default function BookingForm({ serviceId, price, onSubmitSuccess }: BookingFormProps) {
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(""); // thêm email
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<"cash" | "credit_card" | "momo" | "zalopay">("cash");

  const [loading, setLoading] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isValidDate = !!from && !!to && from >= today && to >= from;
  const canBook = isValidDate && !!fullName && isValidPhone(phone);

  // Tính toán tổng tiền = số đêm × đơn giá (nếu có price)
  const unitPrice = useMemo(() => parsePriceNumber(price), [price]);
  const nights = useMemo(() => countNights(from, to), [from, to]);
  const totalPrice = useMemo(() => {
    if (!unitPrice || nights <= 0) return null;
    return Number(unitPrice) * nights;
  }, [unitPrice, nights]);

  // Prefill fullName + email từ profiles (người dùng vẫn có thể sửa)
  useEffect(() => {
    (async () => {
      setPrefillLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Ưu tiên profiles
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.full_name && !fullName) setFullName(profile.full_name);
        // Nếu profiles.email không có, fallback auth user.email
        const initialEmail = profile?.email || user.email || "";
        if (initialEmail && !email) setEmail(initialEmail);
      } finally {
        setPrefillLoading(false);
      }
    })();
    // chỉ prefill một lần khi mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canBook) return;

    setLoading(true);
    setError(null);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push("/login");
        return;
      }

      const payment_status = "unpaid";

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
          total_price: totalPrice,        // <= tổng tiền (null nếu chưa đủ dữ liệu)
          payment_status,                 // 'unpaid'
          payment_method: paymentMethod,  // 'cash' | 'credit_card' | 'momo' | 'zalopay'
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      if (onSubmitSuccess) {
        await onSubmitSuccess({
          bookingId: inserted.id,
          userId: user.id,
          serviceId,
          fullName,
          email,                     // gửi kèm email để wrapper có thể dùng
          phone,
          note,
          price,                     // chuỗi hiển thị
          unitPrice,                 // số đơn giá đã parse
          total_price: totalPrice,   // số tổng tiền
          dateFrom: formatDate(from),
          dateTo: formatDate(to),
          payment_status,            // 'unpaid'
          payment_method: paymentMethod,
          nights,                    // số đêm
        });
      }

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
      <div className="mb-4 text-right text-2xl font-bold text-blue-400">{price || "Liên hệ"}</div>

      {/* Tóm tắt tính tiền */}
      <div className="mb-4 text-right text-sm text-gray-300">
        {nights > 0 && unitPrice
          ? `Số đêm: ${nights} • Tạm tính: ${new Intl.NumberFormat("vi-VN").format(totalPrice!)} đ`
          : "Chọn ngày để tính tạm tính"}
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
            <p className="mt-1 text-sm text-red-400">Ngày đi không được sớm hơn ngày đến.</p>
          )}
        </div>

        {/* Họ và Tên (prefill từ profiles, cho phép sửa) */}
        <div>
          <label className="mb-1 block text-sm text-gray-300">Họ và Tên</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white outline-none"
            placeholder={prefillLoading ? "Đang tải..." : "Nhập họ tên"}
          />
        </div>

        {/* Email (prefill từ profiles, cho phép sửa) */}
        <div>
          <label className="mb-1 block text-sm text-gray-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white outline-none"
            placeholder={prefillLoading ? "Đang tải..." : "Nhập email"}
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
            placeholder="VD: 0901234567"
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
            placeholder="Yêu cầu thêm (nếu có)"
          />
        </div>

        {/* Phương thức thanh toán */}
        <div>
          <label className="mb-1 block text-sm text-gray-300">Phương thức thanh toán</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as any)}
            className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white outline-none"
          >
            <option value="cash">Tiền mặt</option>
            <option value="credit_card">Thẻ tín dụng</option>
            <option value="momo">MoMo</option>
            <option value="zalopay">ZaloPay</option>
          </select>
          <p className="mt-1 text-xs text-gray-400">
            Trạng thái thanh toán mặc định: unpaid (sẽ cập nhật khi hoàn tất thanh toán).
          </p>
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

      {error && <p className="mt-3 text-red-400">{error}</p>}

      <div className="mt-4 space-y-1 text-sm text-gray-300">
        <div>• Xác nhận tức thì</div>
        <div>• Không cần thẻ tín dụng</div>
        <div>• Hỗ trợ 24/7</div>
      </div>
    </div>
  );
}