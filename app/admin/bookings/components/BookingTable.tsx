"use client";

import { useState } from "react";
import { Booking, BookingStatus, PayoutStatus } from "../types";
import BookingDetailModal from "./BookingDetailModal";
import PayoutModal from "./PayoutModal"; // ← MỚI: Modal thanh toán partner

interface BookingTableProps {
  bookings: Booking[];
  loading: boolean;
  updateStatus: (id: string, status: BookingStatus) => void;
  updatePayoutStatus: (
    id: string,
    status: PayoutStatus,
    proofUrl?: string
  ) => void;
}

export function BookingTable({
  bookings,
  loading,
  updateStatus,
  updatePayoutStatus,
}: BookingTableProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [payoutModal, setPayoutModal] = useState<Booking | null>(null);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "confirmed": return "text-green-500";
      case "pending": return "text-yellow-500";
      case "cancelled": return "text-red-500";
      default: return "text-gray-400";
    }
  };

  const getPayoutColor = (status: PayoutStatus) => {
    switch (status) {
      case "paid": return "text-green-500";
      case "failed": return "text-red-500";
      case "pending": return "text-yellow-500";
      default: return "text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Danh sách đơn đặt</h2>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-black border border-gray-800 rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-800 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const displayedBookings = bookings;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Đơn đặt ({displayedBookings.length})
        </h2>
      </div>

      {/* Danh sách đơn đặt */}
      {displayedBookings.length > 0 ? (
        <div className="space-y-3">
          {displayedBookings.map((b) => (
            <div
              key={b.id}
              onClick={() => setSelectedBooking(b)}
              className="bg-black border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                {/* Thông tin chính */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                    {b.user_avatar_url ? (
                      <img
                        src={b.user_avatar_url}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        ?
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white truncate">
                        {b.full_name || b.user_full_name || "Không tên"}
                      </p>
                      <span className={`text-xs ${getStatusColor(b.status)}`}>
                        ●
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">@{b.phone || "—"}</p>
                    <p className="text-xs text-gray-500">{b.service_title || "—"}</p>
                  </div>
                </div>

                {/* Hành động */}
                <div
                  className="flex items-center gap-2 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Trạng thái đơn */}
                  <select
                    value={b.status}
                    onChange={(e) => updateStatus(b.id, e.target.value as BookingStatus)}
                    className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-200 text-xs"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  {/* Thanh toán Partner */}
                  {b.status === "confirmed" && b.payout_status === "pending" && (
                    <button
                      onClick={() => setPayoutModal(b)}
                      className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                    >
                      TT Partner
                    </button>
                  )}
                </div>
              </div>

              {/* Thông tin phụ */}
              <div className="flex gap-4 text-xs text-gray-400 mt-3 flex-wrap">
                <span>Ngày đặt: {formatDate(b.created_at)}</span>
                <span>Thời gian: {b.date_from} → {b.date_to}</span>

                {/* Trạng thái thanh toán Partner */}
                <span className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${getPayoutColor(b.payout_status)}`}></span>
                  Partner: <strong>{b.payout_status}</strong>
                </span>

                {/* Link minh chứng */}
                {b.payout_proof_url && (
                  <a
                    href={b.payout_proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline truncate max-w-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Xem biên lai
                  </a>
                )}

                {b.additional_requests && (
                  <span className="truncate max-w-xs">
                    Yêu cầu: {b.additional_requests}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            Không có đơn đặt
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Không có đơn đặt</h3>
          <p className="text-gray-400 text-sm">Hiện chưa có đơn đặt nào.</p>
        </div>
      )}

      {/* Thống kê nhanh */}
      {displayedBookings.length > 0 && (
        <div className="flex items-center justify-between py-4 border-t border-gray-800 text-sm text-gray-400 flex-wrap gap-3">
          <div className="flex items-center gap-6 flex-wrap">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div> Confirmed:
              {displayedBookings.filter((b) => b.status === "confirmed").length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div> Pending:
              {displayedBookings.filter((b) => b.status === "pending").length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div> Cancelled:
              {displayedBookings.filter((b) => b.status === "cancelled").length}
            </span>
          </div>
          <div>Tổng: {displayedBookings.length}</div>
        </div>
      )}

      {/* Modal chi tiết */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}

      {/* MỚI: Modal thanh toán Partner */}
      {payoutModal && (
        <PayoutModal
          booking={payoutModal}
          onClose={() => setPayoutModal(null)}
          onConfirm={(proofUrl) => {
            updatePayoutStatus(payoutModal.id, "paid", proofUrl);
            setPayoutModal(null);
          }}
        />
      )}
    </div>
  );
}