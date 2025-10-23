"use client";

import { useEffect, useState } from "react";
import { Booking } from "../types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { X, Calendar, Clock, DollarSign, CreditCard, Package, CheckCircle, XCircle, AlertCircle, Link2, User, Phone } from "lucide-react";

interface BookingDetailModalProps {
  booking: Booking;
  onClose: () => void;
}

export default function BookingDetailModal({ booking, onClose }: BookingDetailModalProps) {
  const [loading, setLoading] = useState(false);

  // Hàm format an toàn
  const formatDate = (date: string | null | undefined): string => {
    if (!date) return "-";
    try {
      return format(new Date(date), "dd/MM/yyyy", { locale: vi });
    } catch {
      return "-";
    }
  };

  const formatDateTime = (date: string | null | undefined): string => {
    if (!date) return "-";
    try {
      return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return "-";
    }
  };

  const formatPrice = (price: number | null | undefined): string => {
    if (!price) return "-";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending": return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "cancelled": return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getPayoutStatus = (status: string) => {
    switch (status) {
      case "paid": return { label: "Đã thanh toán", color: "bg-green-900 text-green-300" };
      case "failed": return { label: "Thất bại", color: "bg-red-900 text-red-300" };
      case "pending": return { label: "Chờ thanh toán", color: "bg-yellow-900 text-yellow-300" };
      default: return { label: status, color: "bg-gray-900 text-gray-300" };
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Chi tiết đơn đặt</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Thông tin khách hàng */}
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-700">
                {booking.user_avatar_url ? (
                  <img
                    src={booking.user_avatar_url}
                    alt={booking.user_full_name || "Khách"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-gray-500" />
                )}
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold text-white">
                {booking.full_name || booking.user_full_name || "Khách vãng lai"}
              </h3>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="flex items-center gap-1 text-gray-400">
                  <Phone className="w-4 h-4" />
                  {booking.phone || "-"}
                </span>
                <span className="flex items-center gap-1 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  Đặt: <span className="text-white">{formatDateTime(booking.created_at)}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-800" />

          {/* Thông tin dịch vụ */}
          <div>
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-500" />
              Dịch vụ
            </h4>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-white font-medium">{booking.service_title || "—"}</span>
                <span className="text-gray-400 text-sm">{booking.service_type || ""}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(booking.date_from)} → {formatDate(booking.date_to)}</span>
              </div>
            </div>
          </div>

          {/* Trạng thái & Thanh toán */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trạng thái đơn */}
            <div>
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Trạng thái đơn
              </h4>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-white capitalize">{booking.status}</span>
                  {getStatusIcon(booking.status)}
                </div>
                {booking.confirmed_at && (
                  <p className="text-xs text-gray-400 mt-2">
                    Xác nhận: {formatDateTime(booking.confirmed_at)}
                  </p>
                )}
                {booking.cancelled_at && (
                  <p className="text-xs text-gray-400 mt-2">
                    Hủy: {formatDateTime(booking.cancelled_at)}
                  </p>
                )}
              </div>
            </div>

            {/* Thanh toán khách */}
            <div>
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-yellow-500" />
                Thanh toán từ khách
              </h4>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tổng tiền</span>
                  <span className="text-white font-medium">{formatPrice(booking.total_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Phương thức</span>
                  <span className="text-white capitalize">{booking.payment_method || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Trạng thái</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    booking.payment_status === "paid"
                      ? "bg-green-900 text-green-300"
                      : booking.payment_status === "refunded"
                      ? "bg-blue-900 text-blue-300"
                      : "bg-yellow-900 text-yellow-300"
                  }`}>
                    {booking.payment_status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Thanh toán cho Partner */}
          <div>
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-500" />
              Thanh toán cho Partner
            </h4>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Trạng thái</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPayoutStatus(booking.payout_status).color}`}>
                  {getPayoutStatus(booking.payout_status).label}
                </span>
              </div>
              {booking.payout_proof_url ? (
                <a
                  href={booking.payout_proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-400 hover:underline text-sm"
                >
                  <Link2 className="w-4 h-4" />
                  Xem biên lai thanh toán
                </a>
              ) : (
                <p className="text-gray-500 text-sm">Chưa có minh chứng</p>
              )}
            </div>
          </div>

          {/* Yêu cầu thêm & Ghi chú */}
          {(booking.additional_requests || booking.notes) && (
            <div className="space-y-4">
              {booking.additional_requests && (
                <div>
                  <h4 className="font-semibold text-white mb-2">Yêu cầu thêm từ khách</h4>
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
                    <p className="text-gray-300 text-sm">{booking.additional_requests}</p>
                  </div>
                </div>
              )}

              {booking.notes && (
                <div>
                  <h4 className="font-semibold text-white mb-2">Ghi chú nội bộ</h4>
                  <div className="bg-amber-900/20 border border-amber-800 rounded-lg p-3">
                    <p className="text-amber-300 text-sm">{booking.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}