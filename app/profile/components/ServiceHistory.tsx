"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Props = {
  serviceHistory?: any[];
  getStatusColor?: (status: string) => string;
};

export default function ServiceHistory({ serviceHistory, getStatusColor }: Props) {
  const router = useRouter();

  // State dữ liệu (ưu tiên props; nếu không có sẽ fetch)
  const [data, setData] = useState<any[] | null>(serviceHistory ?? null);
  const [loading, setLoading] = useState<boolean>(!serviceHistory);
  const [error, setError] = useState<string>("");

  // Fetch trực tiếp từ Supabase thay vì API
  useEffect(() => {
    if (serviceHistory && Array.isArray(serviceHistory)) {
      setData(serviceHistory);
      setLoading(false);
      return;
    }
    
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        
        // Fetch trực tiếp từ Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setData([]);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("bookings_view")
          .select(`
            id, user_id, service_id, date_from, date_to, total_price, 
            payment_status, status, created_at, service_title, 
            service_type, service_image_url
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        if (!isMounted) return;
        setData(data ?? []);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message || "Không thể tải dữ liệu");
        setData([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    
    return () => {
      isMounted = false;
    };
  }, [serviceHistory]);

  // Mặc định màu trạng thái nếu không truyền hàm
  const getStatusColorSafe = (status: string) => {
    if (getStatusColor) return getStatusColor(status);
    if (status === "pending") return "text-amber-400";
    if (status === "confirmed") return "text-emerald-400";
    if (status === "cancelled") return "text-rose-400";
    return "text-gray-400";
  };

  const [selectedType, setSelectedType] = useState<string>("__all__");

  // Lấy danh sách loại dịch vụ từ view (service_type), fallback services.type nếu có
  const serviceTypes = useMemo(() => {
    const types = Array.from(
      new Set(
        (data || [])
          .map((i) => i?.service_type || i?.services?.type || null)
          .filter(Boolean)
      )
    ) as string[];
    types.sort((a, b) => a.localeCompare(b));
    return types;
  }, [data]);

  // Sắp xếp + lọc theo loại
  const items = useMemo(() => {
    const sorted = [...(data || [])].sort((a, b) => {
      const ta = new Date(a?.created_at || 0).getTime();
      const tb = new Date(b?.created_at || 0).getTime();
      return tb - ta;
    });
    if (selectedType === "__all__") return sorted;
    return sorted.filter(
      (i) => i?.service_type === selectedType || i?.services?.type === selectedType
    );
  }, [data, selectedType]);

  const handlePay = (bookingId: string) => {
    if (!bookingId) return;
    router.push(`/payment?bookingId=${bookingId}`);
  };

  // Định dạng tiền VND, an toàn với chuỗi numeric từ DB
  const formatCurrencyVND = (value?: number | string | null) => {
    if (value === null || value === undefined || value === "") return "--";
    const num = Number(value);
    if (Number.isNaN(num)) return "--";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  // Hiển thị ngày kiểu DATE 'YYYY-MM-DD' từ DB
  const formatDateOnly = (value?: string | null) => {
    if (!value || typeof value !== "string") return "--";
    const [y, m, d] = value.split("-");
    if (!y || !m || !d) return "--";
    const year = Number(y);
    const monthIndex = Number(m) - 1;
    const day = Number(d);
    if (!Number.isFinite(year) || !Number.isFinite(monthIndex) || !Number.isFinite(day)) return "--";
    const date = new Date(year, monthIndex, day);
    if (Number.isNaN(date.getTime())) return "--";
    return date.toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" });
  };

  // Hiển thị created_at (timestamp)
  const formatDateTime = (value?: string | number | Date | null) => {
    if (!value) return "--";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "--";
    return d.toLocaleString("vi-VN", {
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="text-sm text-gray-400">
        Đang tải lịch sử dịch vụ...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-rose-400">
        Lỗi: {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Lịch sử sử dụng dịch vụ</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Lọc theo loại:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-md border border-white/10 bg-neutral-900 px-3 py-1.5 text-sm text-white"
          >
            <option value="__all__">Tất cả</option>
            {serviceTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(items?.length || 0) === 0 ? (
        <p className="text-gray-400 text-center">
          Chưa có dịch vụ nào được sử dụng.
        </p>
      ) : (
        <div className="space-y-6">
          {items.map((item) => {
            const bookingId = item?.id;

            // DỮ LIỆU PHẲNG TỪ VIEW
            const title = item?.service_title || item?.services?.title || "Dịch vụ";
            const type = item?.service_type || item?.services?.type || "Khác";
            const image = item?.service_image_url || item?.services?.image_url || "";

            const createdAtDisplay = formatDateTime(item?.created_at);

            const status = item?.status || "unknown";
            const paymentStatus = typeof item?.payment_status === "string" ? item.payment_status : "";

            const totalPriceFormatted = formatCurrencyVND(item?.total_price);
            const checkIn = formatDateOnly(item?.date_from);
            const checkOut = formatDateOnly(item?.date_to);

            const paymentStatusClass =
              paymentStatus === "unpaid"
                ? "text-amber-400"
                : paymentStatus === "paid"
                ? "text-emerald-400"
                : paymentStatus === "refunded"
                ? "text-sky-400"
                : "text-gray-400";

            return (
              <div
                key={bookingId}
                className="bg-neutral-900 rounded-xl overflow-hidden shadow hover:shadow-lg transition"
              >
                {image && (
                  <img
                    src={image}
                    alt={title}
                    className="w-full h-56 object-cover"
                  />
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-lg">{title}</h3>
                      <p className="text-sm text-gray-400">Loại: {type}</p>
                      <p className="text-sm text-gray-500">
                        {createdAtDisplay} –{" "}
                        <span className={`font-medium ${getStatusColorSafe(status)}`}>
                          {status}
                        </span>
                      </p>
                      <p className="mt-1 text-sm text-gray-300">
                        Ngày đến: <span className="text-gray-200">{checkIn}</span>
                      </p>
                      <p className="text-sm text-gray-300">
                        Ngày đi: <span className="text-gray-200">{checkOut}</span>
                      </p>
                      <p className="mt-1 text-sm text-gray-100">
                        Tổng tiền:{" "}
                        <span className="font-semibold text-white">{totalPriceFormatted}</span>
                      </p>
                      <p className="mt-1 text-sm text-gray-300">
                        Trạng thái thanh toán:{" "}
                        <span className={`font-medium ${paymentStatusClass}`}>
                          {paymentStatus || "--"}
                        </span>
                      </p>
                    </div>

                    {(paymentStatus === "unpaid" || status === "pending") && bookingId && (
                      <button
                        onClick={() => handlePay(bookingId)}
                        className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
                      >
                        Thanh toán
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}