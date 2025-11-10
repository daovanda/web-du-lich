// app/service-history/ServiceHistory.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useServiceHistory } from "@/app/profile/hooks/useServiceHistory";
import { useServiceFilters } from "./hooks/useServiceFilters";
import { getPaymentStep, calculateTotalPaid } from "./utils/statusHelpers";
import CancelModal from "./components/CancelModal";
import ServiceFilters from "./components/ServiceFilters";
import ServiceCard from "./components/ServiceCard";
import EmptyState from "./components/EmptyState";

type ServiceHistoryProps = {
  serviceHistory?: any[];
  getStatusColor?: (status: string) => string;
  onPendingTransactionsChange?: (count: number) => void;
};

export default function ServiceHistory({ 
  serviceHistory, 
  getStatusColor, 
  onPendingTransactionsChange 
}: ServiceHistoryProps) {
  const router = useRouter();
  
  // Use custom hooks
  const { 
    data, 
    loading, 
    error, 
    cancelBooking, 
    cancelBookingWithRefund 
  } = useServiceHistory({ 
    initialData: serviceHistory 
  });
  
  const {
    selectedType,
    selectedProcessStatus,
    displayCount,
    setSelectedType,
    setSelectedProcessStatus,
    setDisplayCount,
    serviceTypes,
    statusCounts,
    displayedItems,
    pendingTransactionsCount,
    hasMore
  } = useServiceFilters(data);
  
  // State cho lazy loading và modal
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // Notify parent về số giao dịch đang chờ
  useEffect(() => {
    if (onPendingTransactionsChange) {
      onPendingTransactionsChange(pendingTransactionsCount);
    }
  }, [pendingTransactionsCount, onPendingTransactionsChange]);

  const loadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayCount(prev => prev + 3);
      setIsLoadingMore(false);
    }, 300);
  };

  const handlePay = (bookingId: string) => {
    if (!bookingId) return;
    router.push(`/payment?bookingId=${bookingId}`);
  };

  const openCancelModal = (item: any) => {
    setSelectedBooking(item);
    setCancelModalOpen(true);
  };

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
          <ServiceFilters
            selectedType={selectedType}
            selectedProcessStatus={selectedProcessStatus}
            serviceTypes={serviceTypes}
            statusCounts={statusCounts}
            onTypeChange={setSelectedType}
            onProcessStatusChange={setSelectedProcessStatus}
          />

          {displayedItems.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-6">
              {displayedItems.map((item, index) => (
                <ServiceCard
                  key={item?.id}
                  item={item}
                  index={index}
                  onPay={handlePay}
                  onCancel={openCancelModal}
                />
              ))}

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