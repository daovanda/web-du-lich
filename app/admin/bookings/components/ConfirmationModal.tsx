// components/ConfirmationModal.tsx
"use client";

import { X, CheckCircle, Eye } from "lucide-react";
import { Booking, formatPrice } from "../types";

interface ConfirmationModalProps {
  booking: Booking;
  type: 'deposit' | 'payment';
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmationModal({ 
  booking, 
  type, 
  onClose, 
  onConfirm 
}: ConfirmationModalProps) {
  const proofUrl = type === 'deposit' ? booking.deposit_proof_url : booking.payment_proof_url;
  const amount = type === 'deposit' ? booking.deposit_amount : (booking.total_price || 0) - (booking.deposit_amount || 0);
  const title = type === 'deposit' ? 'Xác nhận đặt cọc' : 'Xác nhận thanh toán';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-base font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-4 space-y-3">
          {/* Thông tin booking - compact */}
          <div className="bg-gray-800/50 rounded-lg p-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Khách hàng</span>
              <span className="text-white font-medium">{booking.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Mã đơn</span>
              <span className="text-white font-mono text-xs">{booking.booking_code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Dịch vụ</span>
              <span className="text-white font-medium truncate max-w-[200px]">{booking.service_title}</span>
            </div>
            <div className="flex justify-between border-t border-gray-700 pt-1.5 mt-1.5">
              <span className="text-gray-400">Số tiền</span>
              <span className="text-green-400 font-bold">{formatPrice(amount)}</span>
            </div>
          </div>

          {/* Preview ảnh minh chứng - compact */}
          {proofUrl ? (
            <div className="relative rounded-lg overflow-hidden border border-gray-700 bg-gray-800">
              <img 
                src={proofUrl} 
                alt="Proof" 
                className="w-full max-h-[200px] object-contain"
                onError={(e) => {
                  e.currentTarget.src = '';
                  e.currentTarget.style.display = 'none';
                }}
              />
              <a
                href={proofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-2 right-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                Xem gốc
              </a>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 text-xs bg-gray-800/50 rounded-lg border border-gray-700">
              Không có ảnh minh chứng
            </div>
          )}

          {/* Actions - compact */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 font-medium transition-colors text-sm"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center justify-center gap-1.5 text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}