"use client";

import { useState } from "react";
import { Booking } from "../types";
import { X, Package, User, DollarSign, Link2 } from "lucide-react";

interface PayoutModalProps {
  booking: Booking;
  onClose: () => void;
  onConfirm: (proofUrl: string) => void;
}

export default function PayoutModal({ booking, onClose, onConfirm }: PayoutModalProps) {
  const [proofUrl, setProofUrl] = useState("");

  const formatPrice = (price: number | null | undefined): string => {
    if (!price) return "0₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Xác nhận thanh toán Partner</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Thông tin chính */}
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-700">
                {booking.user_avatar_url ? (
                  <img
                    src={booking.user_avatar_url}
                    alt={booking.user_full_name || "Khách"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-gray-500" />
                )}
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <p className="text-sm text-gray-400">Khách hàng</p>
                <p className="text-white font-medium">
                  {booking.full_name || booking.user_full_name || "Khách vãng lai"}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    Dịch vụ
                  </p>
                  <p className="text-white font-medium">{booking.service_title || "—"}</p>
                </div>
                <div>
                  <p className="text-gray-400 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Giá
                  </p>
                  <p className="text-white font-medium">{formatPrice(booking.total_price)}</p>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-800" />

          {/* Nhập link minh chứng */}
          <div>
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-blue-500" />
              Minh chứng thanh toán
            </h4>
            <input
              type="url"
              placeholder="Dán link biên lai (Google Drive, ảnh, PDF...)"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-gray-600 focus:outline-none text-sm"
            />
            <p className="text-xs text-gray-400 mt-2">
              Dán link từ Google Drive, Imgur, Dropbox, hoặc bất kỳ nền tảng nào có thể truy cập công khai.
            </p>
          </div>

          {/* Hành động */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Hủy
            </button>
            <button
              onClick={() => proofUrl && onConfirm(proofUrl)}
              disabled={!proofUrl}
              className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Đã thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icon nhỏ
function CheckCircle({ className }: { className: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}