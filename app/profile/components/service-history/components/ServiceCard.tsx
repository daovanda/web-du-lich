// app/service-history/components/ServiceCard.tsx

"use client";

import { formatCurrencyVND, formatDateOnly, formatDateTime } from "../utils/formatters";
import { getPaymentStep, getPaymentStepText, getStatusColor } from "../utils/statusHelpers";

type ServiceCardProps = {
  item: any;
  index: number;
  onPay: (bookingId: string) => void;
  onCancel: (item: any) => void;
};

export default function ServiceCard({ item, index, onPay, onCancel }: ServiceCardProps) {
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
      className="bg-black border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700 transition-all duration-300 animate-fadeIn"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image Section */}
      <div className="relative">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full aspect-[4/3] object-cover"
          />
        ) : (
          <div className="w-full aspect-[4/3] bg-neutral-900 flex items-center justify-center">
            <svg className="w-12 h-12 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Status Badge */}
        {hasPendingAction && (
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/90 backdrop-blur-sm rounded-full">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              <span className="text-xs font-medium text-white">Cần xử lý</span>
            </div>
          </div>
        )}
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs font-medium text-white">
            {type}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Header */}
        <div>
          <h3 className="font-semibold text-base text-white mb-1 line-clamp-1">{title}</h3>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span>{createdAtDisplay}</span>
            <span>•</span>
            <span className={`font-medium ${getStatusColor(status)}`}>{status}</span>
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5 text-neutral-300">
            <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">{checkIn}</span>
          </div>
          <svg className="w-4 h-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div className="flex items-center gap-1.5 text-neutral-300">
            <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">{checkOut}</span>
          </div>
        </div>

        {/* Payment Info */}
        <div className="space-y-2 p-3 bg-neutral-900/50 rounded-xl border border-neutral-800">
          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Tổng tiền</span>
            <span className="text-sm font-semibold text-white">{totalPriceFormatted}</span>
          </div>
          
          {/* Deposit */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Đặt cọc</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${
                item?.deposit_status === "paid" ? "text-emerald-400 line-through" : "text-amber-400"
              }`}>
                {depositFormatted}
              </span>
              {item?.deposit_status === "paid" && (
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
          
          {/* Remaining */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Còn lại</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${
                item?.payment_status === "paid" ? "text-emerald-400 line-through" : "text-rose-400"
              }`}>
                {remainingFormatted}
              </span>
              {item?.payment_status === "paid" && (
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="pt-2 border-t border-neutral-800">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${paymentStepInfo.color.replace('text-', 'bg-')}`} />
              <span className={`text-xs font-medium ${paymentStepInfo.color}`}>
                {paymentStepInfo.text}
              </span>
            </div>
          </div>
        </div>

        {/* Refund Info */}
        {item?.refund_status && item.refund_status !== "not_requested" && (
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-amber-200 mb-1">
                  Hoàn tiền: {
                    item.refund_status === "requested" ? "Đang chờ xử lý" :
                    item.refund_status === "approved" ? "Đã chấp nhận" :
                    item.refund_status === "processing" ? "Đang xử lý" :
                    item.refund_status === "completed" ? "Đã hoàn thành" :
                    "Đã từ chối"
                  }
                </p>
                <p className="text-xs text-amber-100 font-semibold">
                  {formatCurrencyVND(item.refund_amount)}
                </p>
                {item.refund_reason && (
                  <p className="text-xs text-amber-200/70 mt-1 line-clamp-2">
                    {item.refund_reason}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {/* Payment Button */}
          {(paymentStep === "need_deposit" || paymentStep === "need_full_payment") && 
            bookingId && !isCancelled && (
            <button
              onClick={() => onPay(bookingId)}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Thanh toán
            </button>
          )}
          
          {/* View Details Button */}
          {(paymentStep === "waiting_deposit_confirm" || paymentStep === "waiting_payment_confirm") && 
            bookingId && !isCancelled && (
            <button
              onClick={() => onPay(bookingId)}
              className="flex-1 py-2.5 px-4 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-600/30 rounded-xl text-sm font-semibold text-amber-400 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Chi tiết
            </button>
          )}
          
          {/* Cancel Button */}
          {canCancel && bookingId && (
            <button
              onClick={() => onCancel(item)}
              className="flex-1 py-2.5 px-4 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-600/30 rounded-xl text-sm font-semibold text-rose-400 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {paymentStep === "need_deposit" ? "Hủy" : "Hủy & Hoàn"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}