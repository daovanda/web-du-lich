"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiRequest } from "@/lib/apiClient";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type BookingFormProps = {
  serviceId: string;
  price?: string | null;
  onSubmitSuccess?: (formData: any) => Promise<void> | void;
  initialQuantity?: number;
  initialCheckIn?: Date | null;
  initialCheckOut?: Date | null;
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

// Parse "1.200.000₫" -> 1200000
const parsePriceNumber = (value?: string | null): number | null => {
  if (!value) return null;
  const onlyNum = value.replace(/[^0-9.,]/g, "").replace(/\./g, "").replace(/,/g, "");
  const parsed = Number(onlyNum);
  return Number.isFinite(parsed) ? parsed : null;
};

// Tính số đơn vị (ngày/đêm)
const countDays = (from: Date | null, to: Date | null) => {
  if (!from || !to) return 0;
  const start = new Date(from);
  const end = new Date(to);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const ms = end.getTime() - start.getTime();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
};

// Hàm tạo booking code unique
const generateBookingCode = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK${timestamp}${random}`;
};

export default function BookingForm({ 
  serviceId, 
  price, 
  onSubmitSuccess, 
  initialQuantity,
  initialCheckIn,
  initialCheckOut
}: BookingFormProps) {
  // Initialize dates with passed values or null
  const [from, setFrom] = useState<Date | null>(initialCheckIn || null);
  const [to, setTo] = useState<Date | null>(initialCheckOut || null);
  const [quantity, setQuantity] = useState<string>(
    initialQuantity ? String(initialQuantity) : "1"
  );

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  const [serviceCategory, setServiceCategory] = useState<string | null>(null);
  const [tourDurationDays, setTourDurationDays] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  

  const router = useRouter();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Update dates when initial values change
  useEffect(() => {
    if (initialCheckIn) setFrom(initialCheckIn);
    if (initialCheckOut) setTo(initialCheckOut);
  }, [initialCheckIn, initialCheckOut]);

  // Fetch service category và duration_days cho tour qua REST
  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest<{
          data: { serviceType: string | null; tourDurationDays: number | null };
        }>(`/api/services/${serviceId}/booking-meta`);

        const serviceType = res.data?.serviceType;
        if (serviceType) {
          setServiceCategory(serviceType);
          if (serviceType === "tour" && res.data.tourDurationDays) {
            setTourDurationDays(res.data.tourDurationDays);
          }
        }
      } catch (err) {
        console.error("Error fetching service type:", err);
      }
    })();
  }, [serviceId]);

  // Tự động tính ngày kết thúc cho tour
  useEffect(() => {
    if (serviceCategory === 'tour' && tourDurationDays && from) {
      const endDate = new Date(from);
      endDate.setDate(endDate.getDate() + tourDurationDays - 1);
      setTo(endDate);
    }
  }, [from, serviceCategory, tourDurationDays]);

  // Xác định loại đơn vị và cách tính theo type
  const pricingConfig = useMemo(() => {
    switch (serviceCategory) {
      case "stay":
        return {
          unit: "đêm",
          dateLabel: { from: "Ngày nhận phòng", to: "Ngày trả phòng" },
          requiresDates: true,
          requiresQuantity: false,
          quantityLabel: null,
          autoCalculateEndDate: false,
        };
      case "motorbike":
        return {
          unit: "ngày",
          dateLabel: { from: "Ngày nhận xe", to: "Ngày trả xe" },
          requiresDates: true,
          requiresQuantity: true,
          quantityLabel: "Số xe",
          autoCalculateEndDate: false,
        };
      case "tour":
        return {
          unit: "người",
          dateLabel: { from: "Ngày khởi hành", to: "Ngày kết thúc" },
          requiresDates: true,
          requiresQuantity: true,
          quantityLabel: "Số người",
          autoCalculateEndDate: true, // Tour tự động tính
        };
      case "car":
        return {
          unit: "chuyến",
          dateLabel: { from: "Ngày đi", to: "Ngày về (nếu có)" },
          requiresDates: true,
          requiresQuantity: true,
          quantityLabel: "Số người",
          autoCalculateEndDate: false,
        };
      default:
        return {
          unit: "ngày",
          dateLabel: { from: "Ngày đến", to: "Ngày đi" },
          requiresDates: true,
          requiresQuantity: false,
          quantityLabel: null,
          autoCalculateEndDate: false,
        };
    }
  }, [serviceCategory]);

  // Validation số lượng
  const isValidQuantity = (val: string): boolean => {
    if (!val.trim()) return false;
    const num = parseInt(val);
    return !isNaN(num) && num >= 1 && num <= 999;
  };

  const quantityNum = useMemo(() => {
    const num = parseInt(quantity);
    return isNaN(num) ? 0 : num;
  }, [quantity]);

  const isValidDate = !!from && !!to && from >= today && to >= from;
  const canBook = isValidDate && !!fullName && isValidPhone(phone) && 
                  (!pricingConfig.requiresQuantity || (isValidQuantity(quantity) && quantityNum > 0));

  // Tính toán tổng tiền
  const unitPrice = useMemo(() => parsePriceNumber(price), [price]);
  const days = useMemo(() => countDays(from, to), [from, to]);
  
  const totalPrice = useMemo(() => {
    if (!unitPrice) return null;
    
    switch (serviceCategory) {
      case "stay":
        // Số đêm = số ngày - 1 (VD: 1/1 -> 3/1 = 2 đêm)
        const nights = Math.max(0, days);
        if (nights <= 0) return null;
        return Number(unitPrice) * nights;
        
      case "motorbike":
        // Giá xe/ngày * số ngày * số xe
        if (days <= 0 || quantityNum <= 0) return null;
        return Number(unitPrice) * days * quantityNum;
        
      case "tour":
        // Giá tour/người * số người
        if (quantityNum <= 0) return null;
        return Number(unitPrice) * quantityNum;
        
      case "car":
        // Giá xe/người * số người
        if (quantityNum <= 0) return null;
        return Number(unitPrice) * quantityNum;
        
      default:
        if (days <= 0) return null;
        return Number(unitPrice) * days;
    }
  }, [unitPrice, days, quantityNum, serviceCategory]);

  // Tính tiền đặt cọc (30% tổng tiền) - cho TẤT CẢ dịch vụ
  const depositAmount = useMemo(() => {
    if (!totalPrice) return null;
    return Math.round(totalPrice * 0.00003)*10000;
  }, [totalPrice]);

  // Prefill fullName + email từ endpoint profile
  useEffect(() => {
    (async () => {
      setPrefillLoading(true);
      try {
        const res = await apiRequest<{
          data?: { full_name?: string | null; email?: string | null };
        }>("/api/profile/me");
        const profile = res.data;
        if (profile?.full_name && !fullName) setFullName(profile.full_name);
        const initialEmail = profile?.email || "";
        if (initialEmail && !email) setEmail(initialEmail);
      } catch {
        // unauthenticated users can still manually fill form
      } finally {
        setPrefillLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canBook) return;

    setLoading(true);
    setError(null);

    try {
      const payment_status = "unpaid";
      const payment_method = "bank_transfer";
      const deposit_status = "unpaid";
      const deposit_percentage = 30;

      const res = await apiRequest<{
        data: { id: string; booking_code: string | null; user_id: string };
      }>("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          serviceId,
          dateFrom: formatDate(from),
          dateTo: formatDate(to),
          quantity: pricingConfig.requiresQuantity ? quantityNum : null,
          fullName,
          phone,
          note,
          totalPrice,
          depositAmount,
          depositPercentage: deposit_percentage,
          paymentStatus: payment_status,
          paymentMethod: payment_method,
          depositStatus: deposit_status,
        }),
      });

      if (onSubmitSuccess) {
        await onSubmitSuccess({
          bookingId: res.data.id,
          bookingCode: res.data.booking_code || generateBookingCode(),
          userId: res.data.user_id,
          serviceId,
          fullName,
          email,
          phone,
          note,
          price,
          unitPrice,
          total_price: totalPrice,
          deposit_amount: depositAmount,
          deposit_percentage: deposit_percentage,
          dateFrom: formatDate(from),
          dateTo: formatDate(to),
          payment_status,
          payment_method: payment_method,
          deposit_status: deposit_status,
          days: days,
          quantity: pricingConfig.requiresQuantity ? quantityNum : null,
          category: serviceCategory,
        });
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/login");
        return;
      }
      console.error("Booking error:", err);
      setError(err.message || "Đặt dịch vụ thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị tóm tắt tính tiền
  const renderPriceSummary = () => {
    if (!unitPrice) return "Chọn ngày để tính tạm tính";

    switch (serviceCategory) {
      case "stay":
        const nights = Math.max(0, days);
        if (nights <= 0) return "Chọn ngày để tính tạm tính";
        return (
          <>
            <div>Số đêm: {nights} • Tạm tính: {new Intl.NumberFormat("vi-VN").format(totalPrice!)} ₫</div>
            {depositAmount && (
              <div className="text-yellow-400 font-semibold">
                Đặt cọc 30%: {new Intl.NumberFormat("vi-VN").format(depositAmount)} ₫
              </div>
            )}
          </>
        );

      case "motorbike":
        if (days <= 0 || quantityNum <= 0) return "Chọn ngày và số xe để tính tạm tính";
        return (
          <>
            <div>
              {quantityNum} xe × {days} ngày • Tạm tính: {new Intl.NumberFormat("vi-VN").format(totalPrice!)} ₫
            </div>
            {depositAmount && (
              <div className="text-yellow-400 font-semibold">
                Đặt cọc 30%: {new Intl.NumberFormat("vi-VN").format(depositAmount)} ₫
              </div>
            )}
          </>
        );

      case "tour":
        if (quantityNum <= 0) return "Nhập số người để tính tạm tính";
        return (
          <>
            <div>Số người: {quantityNum} • Tạm tính: {new Intl.NumberFormat("vi-VN").format(totalPrice!)} ₫</div>
            {depositAmount && (
              <div className="text-yellow-400 font-semibold">
                Đặt cọc 30%: {new Intl.NumberFormat("vi-VN").format(depositAmount)} ₫
              </div>
            )}
            {tourDurationDays && (
              <div className="text-blue-400 text-xs mt-1">
                Tour {tourDurationDays} ngày {tourDurationDays - 1} đêm
              </div>
            )}
          </>
        );

      case "car":
        if (quantityNum <= 0) return "Nhập số người để tính tạm tính";
        return (
          <>
            <div>Số người: {quantityNum} • Tổng tiền: {new Intl.NumberFormat("vi-VN").format(totalPrice!)} ₫</div>
            {depositAmount && (
              <div className="text-yellow-400 font-semibold">
                Đặt cọc 30%: {new Intl.NumberFormat("vi-VN").format(depositAmount)} ₫
              </div>
            )}
          </>
        );

      default:
        if (days <= 0) return "Chọn ngày để tính tạm tính";
        return (
          <>
            <div>Số ngày: {days} • Tạm tính: {new Intl.NumberFormat("vi-VN").format(totalPrice!)} ₫</div>
            {depositAmount && (
              <div className="text-yellow-400 font-semibold">
                Đặt cọc 30%: {new Intl.NumberFormat("vi-VN").format(depositAmount)} ₫
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="mb-3 text-right text-sm text-gray-300">
        Giá/{pricingConfig.unit} từ
      </div>
      <div className="mb-4 text-right text-2xl font-bold text-blue-400">
        {price || "Liên hệ"}
      </div>

      {/* Tóm tắt tính tiền */}
      <div className="mb-4 space-y-1 text-right text-sm text-gray-300">
        {renderPriceSummary()}
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        {/* Ngày đến */}
        <div className="w-full">
          <label className="mb-1 block text-sm text-gray-300">
            {pricingConfig.dateLabel.from}
          </label>
          <DatePicker
            selected={from}
            onChange={(date) => setFrom(date)}
            minDate={today}
            dateFormat="dd/MM/yyyy"
            placeholderText={`Chọn ${pricingConfig.dateLabel.from.toLowerCase()}`}
            className="block w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white"
          />
        </div>

        {/* Ngày đi - chỉ hiển thị nếu KHÔNG phải tour (vì tour tự động tính) */}
        {!pricingConfig.autoCalculateEndDate && (
          <div className="w-full">
            <label className="mb-1 block text-sm text-gray-300">
              {pricingConfig.dateLabel.to}
            </label>
            <DatePicker
              selected={to}
              onChange={(date) => setTo(date)}
              minDate={from || today}
              dateFormat="dd/MM/yyyy"
              placeholderText={`Chọn ${pricingConfig.dateLabel.to.toLowerCase()}`}
              className="block w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white"
            />
            {from && to && to < from && (
              <p className="mt-1 text-sm text-red-400">
                {pricingConfig.dateLabel.to} không được sớm hơn {pricingConfig.dateLabel.from.toLowerCase()}.
              </p>
            )}
          </div>
        )}

        {/* Hiển thị ngày kết thúc tự động cho tour (read-only) */}
        {pricingConfig.autoCalculateEndDate && to && (
          <div className="w-full">
            <label className="mb-1 block text-sm text-gray-300">
              {pricingConfig.dateLabel.to}
            </label>
            <div className="block w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-gray-400">
              {to.toLocaleDateString('vi-VN')}
            </div>
            <p className="mt-1 text-xs text-blue-400">
              ℹ️ Ngày kết thúc được tự động tính dựa trên thời lượng tour ({tourDurationDays} ngày)
            </p>
          </div>
        )}

        {/* Số lượng (số người/số xe) - hiển thị với motorbike, tour, car */}
        {pricingConfig.requiresQuantity && (
          <div>
            <label className="mb-1 block text-sm text-gray-300">
              {pricingConfig.quantityLabel}
            </label>
            <input
              type="number"
              min="1"
              max="999"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              onBlur={(e) => {
                const val = e.target.value;
                if (!val.trim() || parseInt(val) < 1) {
                  setQuantity("1");
                } else if (parseInt(val) > 999) {
                  setQuantity("999");
                }
              }}
              className={`w-full rounded-lg border px-3 py-2 outline-none ${
                quantity && !isValidQuantity(quantity)
                  ? "border-red-500 bg-black/30 text-red-400"
                  : "border-white/20 bg-black/30 text-white"
              }`}
              placeholder={`Nhập ${pricingConfig.quantityLabel?.toLowerCase()}`}
            />
            {quantity && !isValidQuantity(quantity) && (
              <p className="mt-1 text-sm text-red-400">
                Số lượng không hợp lệ (từ 1 đến 999).
              </p>
            )}
            {quantityNum > 50 && isValidQuantity(quantity) && (
              <p className="mt-1 text-sm text-yellow-400">
                Số lượng lớn. Vui lòng liên hệ để được hỗ trợ tốt nhất.
              </p>
            )}
          </div>
        )}

        {/* Họ và Tên */}
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

        {/* Email */}
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

        {/* Thông báo phương thức thanh toán */}
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3">
          <p className="text-sm text-blue-300">
            💳 <strong>Phương thức thanh toán:</strong> Chuyển khoản ngân hàng
          </p>
          <p className="text-xs text-blue-400 mt-1">
            Bạn cần đặt cọc 30% để xác nhận đơn. Phần còn lại thanh toán khi nhận dịch vụ.
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
        <div>• Hoàn tiền ngay lập tức</div>
        <div>• Xác nhận tức thì</div>
        <div>• Không cần thẻ tín dụng</div>
        <div>• Hỗ trợ 24/7</div>
      </div>
    </div>
  );
}