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

  // State toggle
  const [isExpanded, setIsExpanded] = useState(false);
  
  // State dữ liệu
  const [data, setData] = useState<any[] | null>(serviceHistory ?? null);
  const [loading, setLoading] = useState<boolean>(!serviceHistory);
  const [error, setError] = useState<string>("");
  
  // State cho lazy loading
  const [displayCount, setDisplayCount] = useState(3);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // State cho cancel
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Fetch dữ liệu
  useEffect(() => {
    if (serviceHistory && Array.isArray(serviceHistory)) {
      setData(serviceHistory);
      setLoading(false);
      return;
    }
    
    if (!isExpanded) return; // Chỉ fetch khi expanded
    
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        
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
            payment_status, status, created_at, cancelled_at,
            service_title, service_type, service_image_url
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
  }, [serviceHistory, isExpanded]);

  // Màu trạng thái
  const getStatusColorSafe = (status: string) => {
    if (getStatusColor) return getStatusColor(status);
    if (status === "pending") return "text-amber-400";
    if (status === "confirmed") return "text-emerald-400";
    if (status === "cancelled") return "text-rose-400";
    return "text-gray-400";
  };

  const [selectedType, setSelectedType] = useState<string>("__all__");

  // Lấy danh sách loại dịch vụ
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

  // Items để hiển thị (lazy loading)
  const displayedItems = useMemo(() => {
    return items.slice(0, displayCount);
  }, [items, displayCount]);

  const hasMore = displayCount < items.length;

  // Load more items
  const loadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + 3, items.length));
      setIsLoadingMore(false);
    }, 300);
  };

  const handlePay = (bookingId: string) => {
    if (!bookingId) return;
    router.push(`/payment?bookingId=${bookingId}`);
  };

  // Hủy booking
  const handleCancel = async (bookingId: string) => {
    if (!bookingId) return;
    
    const confirmed = window.confirm("Bạn có chắc chắn muốn hủy dịch vụ này?");
    if (!confirmed) return;
    
    setCancellingId(bookingId);
    
    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString()
        })
        .eq("id", bookingId);
      
      if (error) throw error;
      
      // Cập nhật local state
      setData(prevData => 
        prevData?.map(item => 
          item.id === bookingId 
            ? { ...item, status: "cancelled", cancelled_at: new Date().toISOString() }
            : item
        ) ?? null
      );
      
      alert("Đã hủy dịch vụ thành công!");
    } catch (e: any) {
      console.error("Error cancelling booking:", e);
      alert("Lỗi: " + (e?.message || "Không thể hủy dịch vụ"));
    } finally {
      setCancellingId(null);
    }
  };

  // Format functions
  const formatCurrencyVND = (value?: number | string | null) => {
    if (value === null || value === undefined || value === "") return "--";
    const num = Number(value);
    if (Number.isNaN(num)) return "--";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

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

  return (
    <div className="bg-neutral-900 rounded-xl shadow overflow-hidden">
      {/* Header - Always visible */}
      <div className="p-6 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Lịch sử sử dụng dịch vụ</h2>
          <button
            onClick={() => {
              setIsExpanded(!isExpanded);
              if (!isExpanded) {
                setDisplayCount(3); // Reset khi mở
              }
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:opacity-90 transition"
          >
            {isExpanded ? "Thu gọn" : "Xem lịch sử"}
          </button>
        </div>
      </div>

      {/* Expandable content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded
            ? "max-h-[5000px] opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="p-6">
          {loading ? (
            <div className="text-sm text-gray-400 text-center py-8">
              Đang tải lịch sử dịch vụ...
            </div>
          ) : error ? (
            <div className="text-sm text-rose-400 text-center py-8">
              Lỗi: {error}
            </div>
          ) : (
            <>
              {/* Filter */}
              {serviceTypes.length > 0 && (
                <div className="mb-4 flex items-center justify-end gap-2">
                  <label className="text-sm text-gray-400">Lọc theo loại:</label>
                  <select
                    value={selectedType}
                    onChange={(e) => {
                      setSelectedType(e.target.value);
                      setDisplayCount(3); // Reset display count khi filter
                    }}
                    className="rounded-md border border-white/10 bg-neutral-800 px-3 py-1.5 text-sm text-white"
                  >
                    <option value="__all__">Tất cả</option>
                    {serviceTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(items?.length || 0) === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  Chưa có dịch vụ nào được sử dụng.
                </p>
              ) : (
                <div className="space-y-6">
                  {displayedItems.map((item, index) => {
                    const bookingId = item?.id;
                    const title = item?.service_title || item?.services?.title || "Dịch vụ";
                    const type = item?.service_type || item?.services?.type || "Khác";
                    const image = item?.service_image_url || item?.services?.image_url || "";
                    const createdAtDisplay = formatDateTime(item?.created_at);
                    const status = item?.status || "unknown";
                    const paymentStatus = typeof item?.payment_status === "string" ? item.payment_status : "";
                    const totalPriceFormatted = formatCurrencyVND(item?.total_price);
                    const checkIn = formatDateOnly(item?.date_from);
                    const checkOut = formatDateOnly(item?.date_to);
                    const isCancelled = status === "cancelled";
                    const canCancel = !isCancelled && status === "pending";

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
                        className="bg-neutral-800 rounded-xl overflow-hidden shadow hover:shadow-lg transition animate-fadeIn"
                        style={{ animationDelay: `${index * 100}ms` }}
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
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{title}</h3>
                              <p className="text-sm text-gray-400">Loại: {type}</p>
                              <p className="text-sm text-gray-500">
                                {createdAtDisplay} —{" "}
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

                            <div className="flex flex-col gap-2 shrink-0">
                              {(paymentStatus === "unpaid" || status === "pending") && bookingId && !isCancelled && (
                                <button
                                  onClick={() => handlePay(bookingId)}
                                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
                                >
                                  Thanh toán
                                </button>
                              )}
                              
                              {canCancel && bookingId && (
                                <button
                                  onClick={() => handleCancel(bookingId)}
                                  disabled={cancellingId === bookingId}
                                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {cancellingId === bookingId ? "Đang hủy..." : "Hủy dịch vụ"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Load more button */}
                  {hasMore && (
                    <div className="flex justify-center pt-4">
                      <button
                        onClick={loadMore}
                        disabled={isLoadingMore}
                        className="px-6 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition disabled:opacity-50"
                      >
                        {isLoadingMore ? "Đang tải..." : "Xem thêm"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}