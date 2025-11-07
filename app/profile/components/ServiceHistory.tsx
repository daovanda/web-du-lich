"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useServiceHistory } from "../hooks/useServiceHistory";

type Props = {
  serviceHistory?: any[];
  getStatusColor?: (status: string) => string;
  onPendingTransactionsChange?: (count: number) => void;
};

// Modal hủy dịch vụ
function CancelModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  needRefund,
  totalPaid
}: { 
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  needRefund: boolean;
  totalPaid: number;
}) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const predefinedReasons = [
    "Thay đổi kế hoạch du lịch",
    "Tìm được dịch vụ phù hợp hơn",
    "Lý do cá nhân"
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", { 
      style: "currency", 
      currency: "VND" 
    }).format(value);
  };

  const handleSubmit = async () => {
    if (needRefund && !selectedReason && !customReason.trim()) {
      alert("Vui lòng chọn hoặc nhập lý do hủy");
      return;
    }

    setIsSubmitting(true);
    const finalReason = selectedReason === "other" ? customReason : selectedReason;
    await onConfirm(needRefund ? finalReason : undefined);
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-xl max-w-md w-full p-6 shadow-xl">
        <h3 className="text-xl font-bold mb-4">
          {needRefund ? "Hủy dịch vụ và yêu cầu hoàn tiền" : "Xác nhận hủy dịch vụ"}
        </h3>
        
        {needRefund ? (
          <>
            <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-sm text-amber-200 mb-2">
                Bạn sẽ được hoàn lại số tiền đã thanh toán:
              </p>
              <p className="text-2xl font-bold text-amber-400">
                {formatCurrency(totalPaid)}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Lý do hủy dịch vụ <span className="text-red-400">*</span>
              </label>
              
              <div className="space-y-2 mb-3">
                {predefinedReasons.map((reason) => (
                  <label key={reason} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => {
                        setSelectedReason(e.target.value);
                        setCustomReason("");
                      }}
                      className="text-indigo-500"
                    />
                    <span className="text-sm">{reason}</span>
                  </label>
                ))}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="reason"
                    value="other"
                    checked={selectedReason === "other"}
                    onChange={() => setSelectedReason("other")}
                    className="text-indigo-500"
                  />
                  <span className="text-sm">Khác (Vui lòng ghi rõ)</span>
                </label>
              </div>

              {selectedReason === "other" && (
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Nhập lý do của bạn..."
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              )}
            </div>

            <p className="text-xs text-gray-400 mb-4">
              * Yêu cầu hoàn tiền sẽ được xử lý trong vòng 3-5 ngày làm việc
            </p>
          </>
        ) : (
          <p className="text-gray-300 mb-6">
            Bạn có chắc chắn muốn hủy dịch vụ này? Hành động này không thể hoàn tác.
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-neutral-700 rounded-lg hover:bg-neutral-600 transition disabled:opacity-50"
          >
            Đóng
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-rose-600 rounded-lg hover:bg-rose-500 transition disabled:opacity-50"
          >
            {isSubmitting ? "Đang xử lý..." : needRefund ? "Xác nhận hủy & hoàn tiền" : "Xác nhận hủy"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ServiceHistory({ 
  serviceHistory, 
  getStatusColor, 
  onPendingTransactionsChange 
}: Props) {
  const router = useRouter();
  
  // Use custom hook
  const { 
    data, 
    loading, 
    error, 
    cancelBooking, 
    cancelBookingWithRefund 
  } = useServiceHistory({ 
    initialData: serviceHistory 
  });
  
  // State cho lazy loading
  const [displayCount, setDisplayCount] = useState(3);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // State cho cancel modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

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
    
    if (status === "cancelled") {
      return "cancelled";
    }
    
    if (payment_status === "paid" && status === "confirmed") {
      return "completed";
    }
    
    if (payment_status === "paid" && status === "pending") {
      return "waiting_admin_confirm";
    }
    
    if (deposit_status === "paid" && payment_status === "unpaid" && payment_proof_url) {
      return "waiting_payment_confirm";
    }
    
    if (deposit_status === "paid" && payment_status === "unpaid" && !payment_proof_url) {
      return "need_full_payment";
    }
    
    if (deposit_status === "unpaid" && deposit_proof_url) {
      return "waiting_deposit_confirm";
    }
    
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

  // Đếm số giao dịch đang chờ
  const pendingTransactionsCount = useMemo(() => {
    return items.filter(item => {
      return item?.status !== "confirmed" && item?.status !== "cancelled";
    }).length;
  }, [items]);

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

  // Tính tổng số tiền đã thanh toán
  const calculateTotalPaid = (item: any): number => {
    let totalPaid = 0;
    
    if (item.deposit_status === "paid") {
      totalPaid += item.deposit_amount || 0;
    }
    
    if (item.payment_status === "paid") {
      const remaining = (item.total_price || 0) - (item.deposit_amount || 0);
      totalPaid += remaining;
    }
    
    return totalPaid;
  };

  // Mở modal hủy
  const openCancelModal = (item: any) => {
    setSelectedBooking(item);
    setCancelModalOpen(true);
  };

  // Xử lý hủy dịch vụ
  const handleCancelConfirm = async (reason?: string) => {
    if (!selectedBooking) return;
    
    const paymentStep = getPaymentStep(selectedBooking);
    const needRefund = paymentStep !== "need_deposit";
    const totalPaid = calculateTotalPaid(selectedBooking);
    
    let result;
    
    if (needRefund) {
      result = await cancelBookingWithRefund(
        selectedBooking.id, 
        totalPaid, 
        reason || ""
      );
    } else {
      result = await cancelBooking(selectedBooking.id);
    }
    
    if (result.success) {
      setCancelModalOpen(false);
      setSelectedBooking(null);
      
      if (needRefund) {
        alert("Đã hủy dịch vụ và gửi yêu cầu hoàn tiền thành công! Chúng tôi sẽ xử lý trong vòng 3-5 ngày làm việc.");
      } else {
        alert("Đã hủy dịch vụ thành công!");
      }
    } else {
      alert("Lỗi: " + (result.error || "Không thể hủy dịch vụ"));
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
      <CancelModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setSelectedBooking(null);
        }}
        onConfirm={handleCancelConfirm}
        needRefund={selectedBooking ? getPaymentStep(selectedBooking) !== "need_deposit" : false}
        totalPaid={selectedBooking ? calculateTotalPaid(selectedBooking) : 0}
      />

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
                            {createdAtDisplay} •{" "}
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

                            {/* Hiển thị thông tin hoàn tiền nếu có */}
                            {item?.refund_status && item.refund_status !== "not_requested" && (
                              <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                <p className="text-sm text-amber-200 mb-1">
                                  <span className="font-medium">Yêu cầu hoàn tiền:</span>{" "}
                                  {item.refund_status === "requested" && "Đang chờ xử lý"}
                                  {item.refund_status === "approved" && "Đã chấp nhận"}
                                  {item.refund_status === "processing" && "Đang xử lý"}
                                  {item.refund_status === "completed" && "Đã hoàn thành"}
                                  {item.refund_status === "rejected" && "Đã từ chối"}
                                </p>
                                <p className="text-sm text-amber-100">
                                  Số tiền: {formatCurrencyVND(item.refund_amount)}
                                </p>
                                {item.refund_reason && (
                                  <p className="text-xs text-amber-200/80 mt-1">
                                    Lý do: {item.refund_reason}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 shrink-0">
                          {/* Nút thanh toán */}
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
                          
                          {/* Nút xem chi tiết */}
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
                              onClick={() => openCancelModal(item)}
                              className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-500"
                            >
                              {paymentStep === "need_deposit" ? "Hủy dịch vụ" : "Hủy & hoàn tiền"}
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