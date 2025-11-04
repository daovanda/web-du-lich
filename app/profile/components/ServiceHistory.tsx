"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Props = {
  serviceHistory?: any[];
  getStatusColor?: (status: string) => string;
  onPendingTransactionsChange?: (count: number) => void;
};

export default function ServiceHistory({ serviceHistory, getStatusColor, onPendingTransactionsChange }: Props) {
  const router = useRouter();

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
          .from("bookings")
          .select(`
            id, user_id, service_id, date_from, date_to, total_price, 
            payment_status, deposit_status, deposit_amount, deposit_proof_url,
            payment_proof_url, status, created_at, cancelled_at,
            services(title, type, image_url)
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

  // Màu trạng thái
  const getStatusColorSafe = (status: string) => {
    if (getStatusColor) return getStatusColor(status);
    if (status === "pending") return "text-amber-400";
    if (status === "confirmed") return "text-emerald-400";
    if (status === "cancelled") return "text-rose-400";
    return "text-gray-400";
  };

  // Xác định trạng thái thanh toán hiện tại
  const getPaymentStep = (item: any): string => {
    const { deposit_status, deposit_proof_url, payment_status, payment_proof_url, status } = item;
    
    // Nếu booking đã bị hủy, không cần hiển thị trạng thái thanh toán
    if (status === "cancelled") {
      return "cancelled";
    }
    
    // Hoàn thành - đã thanh toán đầy đủ và được xác nhận
    if (payment_status === "paid" && status === "confirmed") {
      return "completed";
    }
    
    // Đã thanh toán đủ nhưng chưa được admin confirm
    if (payment_status === "paid" && status === "pending") {
      return "waiting_admin_confirm";
    }
    
    // Chờ xác nhận thanh toán full
    if (deposit_status === "paid" && payment_status === "unpaid" && payment_proof_url) {
      return "waiting_payment_confirm";
    }
    
    // Cần thanh toán phần còn lại
    if (deposit_status === "paid" && payment_status === "unpaid" && !payment_proof_url) {
      return "need_full_payment";
    }
    
    // Chờ xác nhận đặt cọc
    if (deposit_status === "unpaid" && deposit_proof_url) {
      return "waiting_deposit_confirm";
    }
    
    // Cần đặt cọc
    if (deposit_status === "unpaid" && !deposit_proof_url) {
      return "need_deposit";
    }
    
    return "unknown";
  };

  const [selectedType, setSelectedType] = useState<string>("__all__");

  // Lấy danh sách loại dịch vụ
  const serviceTypes = useMemo(() => {
    const types = Array.from(
      new Set(
        (data || [])
          .map((i) => i?.services?.type || null)
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
    return sorted.filter((i) => i?.services?.type === selectedType);
  }, [data, selectedType]);

  // Đếm số giao dịch đang chờ (tất cả đơn chưa confirmed và chưa cancelled)
  const pendingTransactionsCount = useMemo(() => {
    const count = items.filter(item => {
      return item?.status !== "confirmed" && item?.status !== "cancelled";
    }).length;
    console.log("ServiceHistory - Pending count:", count);
    console.log("Items with pending status:", items.filter(item => {
      return item?.status !== "confirmed" && item?.status !== "cancelled";
    }));
    return count;
  }, [items]);

  // Notify parent component về số lượng pending transactions
  useEffect(() => {
    if (onPendingTransactionsChange) {
      onPendingTransactionsChange(pendingTransactionsCount);
    }
  }, [pendingTransactionsCount, onPendingTransactionsChange]);

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

  // Lấy text trạng thái thanh toán
  const getPaymentStepText = (step: string): { text: string; color: string } => {
    switch (step) {
      case "need_deposit":
        return { text: "Cần đặt cọc", color: "text-amber-400" };
      case "waiting_deposit_confirm":
        return { text: "Chờ xác nhận đặt cọc", color: "text-yellow-400" };
      case "need_full_payment":
        return { text: "Cần thanh toán phần còn lại", color: "text-orange-400" };
      case "waiting_payment_confirm":
        return { text: "Chờ xác nhận thanh toán", color: "text-yellow-400" };
      case "waiting_admin_confirm":
        return { text: "Đã thanh toán đầy đủ và chờ sử dụng dịch vụ", color: "text-blue-400" };
      case "completed":
        return { text: "Đã thanh toán đầy đủ và hoàn thành dịch vụ", color: "text-emerald-400" };
      case "cancelled":
        return { text: "Đã hủy", color: "text-rose-400" };
      default:
        return { text: "Chưa rõ", color: "text-gray-400" };
    }
  };

  return (
    <div>
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
                  setDisplayCount(3);
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
                const title = item?.services?.title || "Dịch vụ";
                const type = item?.services?.type || "Khác";
                const image = item?.services?.image_url || "";
                const createdAtDisplay = formatDateTime(item?.created_at);
                const status = item?.status || "unknown";
                const totalPriceFormatted = formatCurrencyVND(item?.total_price);
                const depositFormatted = formatCurrencyVND(item?.deposit_amount);
                const remainingAmount = (item?.total_price || 0) - (item?.deposit_amount || 0);
                const remainingFormatted = formatCurrencyVND(remainingAmount);
                const checkIn = formatDateOnly(item?.date_from);
                const checkOut = formatDateOnly(item?.date_to);
                const isCancelled = status === "cancelled";
                const canCancel = !isCancelled && status === "pending";
                
                const paymentStep = getPaymentStep(item);
                const paymentStepInfo = getPaymentStepText(paymentStep);
                // Hiển thị chấm đỏ cho tất cả đơn chưa confirmed và chưa cancelled
                const hasPendingAction = status !== "confirmed" && status !== "cancelled";

                return (
                  <div
                    key={bookingId}
                    className={`bg-neutral-800 rounded-xl overflow-hidden shadow hover:shadow-lg transition animate-fadeIn relative ${
                      hasPendingAction ? "ring-2 ring-red-500/50" : ""
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Chấm đỏ indicator */}
                    {hasPendingAction && (
                      <div className="absolute top-3 right-3 z-10">
                        <div className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </div>
                      </div>
                    )}

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
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{title}</h3>
                            {hasPendingAction && (
                              <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                              </div>
                            )}
                          </div>
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
                          
                          {/* Thông tin thanh toán chi tiết */}
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <p className="text-sm text-gray-100 mb-1">
                              Tổng tiền:{" "}
                              <span className="font-semibold text-white">{totalPriceFormatted}</span>
                            </p>
                            <p className="text-sm text-gray-300">
                              Đặt cọc:{" "}
                              <span className={`font-medium ${
                                item?.deposit_status === "paid" ? "text-green-400 line-through" : "text-yellow-400"
                              }`}>
                                {depositFormatted}
                              </span>
                              {item?.deposit_status === "paid" && (
                                <span className="ml-2 text-xs text-green-400">✓ Đã thanh toán</span>
                              )}
                            </p>
                            <p className="text-sm text-gray-300">
                              Còn lại:{" "}
                              <span className={`font-medium ${
                                item?.payment_status === "paid" ? "text-green-400 line-through" : "text-red-400"
                              }`}>
                                {remainingFormatted}
                              </span>
                              {item?.payment_status === "paid" && (
                                <span className="ml-2 text-xs text-green-400">✓ Đã thanh toán</span>
                              )}
                            </p>
                            <p className="mt-2 text-sm">
                              <span className="text-gray-400">Trạng thái: </span>
                              <span className={`font-semibold ${paymentStepInfo.color}`}>
                                {paymentStepInfo.text}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 shrink-0">
                          {/* Nút thanh toán - hiển thị khi cần đặt cọc hoặc thanh toán full */}
                          {(paymentStep === "need_deposit" || paymentStep === "need_full_payment") && 
                            bookingId && !isCancelled && (
                            <button
                              onClick={() => handlePay(bookingId)}
                              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 flex items-center gap-1"
                            >
                              <span>💳</span>
                              Thanh toán
                            </button>
                          )}
                          
                          {/* Nút xem chi tiết - hiển thị khi đang chờ xác nhận */}
                          {(paymentStep === "waiting_deposit_confirm" || paymentStep === "waiting_payment_confirm") && 
                            bookingId && !isCancelled && (
                            <button
                              onClick={() => handlePay(bookingId)}
                              className="rounded-lg bg-yellow-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-yellow-500 flex items-center gap-1"
                            >
                              <span>⏱️</span>
                              Xem chi tiết
                            </button>
                          )}
                          
                          {/* Nút hủy */}
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
                    className="px-6 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition disabled:opacity-50"
                  >
                    {isLoadingMore ? "Đang tải..." : "Xem thêm"}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

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