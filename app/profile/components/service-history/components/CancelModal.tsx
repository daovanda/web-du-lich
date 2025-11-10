// app/service-history/components/CancelModal.tsx

"use client";

import { useState } from "react";
import { PREDEFINED_CANCEL_REASONS } from "../utils/constants";
import { formatCurrencyVND } from "../utils/formatters";

type CancelModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  needRefund: boolean;
  totalPaid: number;
};

export default function CancelModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  needRefund,
  totalPaid
}: CancelModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
                {formatCurrencyVND(totalPaid)}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Lý do hủy dịch vụ <span className="text-red-400">*</span>
              </label>
              
              <div className="space-y-2 mb-3">
                {PREDEFINED_CANCEL_REASONS.map((reason) => (
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