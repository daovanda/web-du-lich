"use client";

import { useState } from "react";
import { X, Calendar, Clock, DollarSign, CreditCard, Package, CheckCircle, XCircle, AlertCircle, Link2, User, Phone, FileText, MessageSquare } from "lucide-react";
import { Booking } from "../types";

interface BookingDetailModalProps {
  booking: Booking;
  onClose: () => void;
}

export default function BookingDetailModal({ booking, onClose }: BookingDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'payment' | 'proofs'>('info');
  
  const remainingAmount = (booking.total_price || 0) - (booking.deposit_amount || 0);

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleDateString("vi-VN");
    } catch {
      return "—";
    }
  };

  const formatDateTime = (date: string | null | undefined) => {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleString("vi-VN");
    } catch {
      return "—";
    }
  };

  const formatPrice = (amount: number | null | undefined) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: any }> = {
      confirmed: { label: "Đã xác nhận", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle },
      pending: { label: "Chờ xử lý", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Clock },
      cancelled: { label: "Đã hủy", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle }
    };
    const config = configs[status] || configs.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const getPaymentBadge = (status: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      paid: { label: "Đã thanh toán", color: "bg-green-500/20 text-green-400 border-green-500/30" },
      unpaid: { label: "Chưa thanh toán", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
      refunded: { label: "Đã hoàn tiền", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" }
    };
    const config = configs[status] || configs.unpaid;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPayoutBadge = (status: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      paid: { label: "Đã thanh toán", color: "bg-green-500/20 text-green-400 border-green-500/30" },
      pending: { label: "Chờ thanh toán", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
      failed: { label: "Thất bại", color: "bg-red-500/20 text-red-400 border-red-500/30" }
    };
    const config = configs[status] || configs.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getRefundStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      not_requested: { label: "Chưa yêu cầu", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
      requested: { label: "Đang chờ", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
      approved: { label: "Đã duyệt", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      processing: { label: "Đang xử lý", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
      completed: { label: "Đã hoàn trả", color: "bg-green-500/20 text-green-400 border-green-500/30" },
      rejected: { label: "Từ chối", color: "bg-red-500/20 text-red-400 border-red-500/30" }
    };
    const config = configs[status] || configs.not_requested;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700/50 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header - Compact */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Chi tiết đơn đặt</h2>
              <p className="text-xs text-gray-400 font-mono">#{booking.booking_code || "N/A"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 bg-gray-900/50 border-b border-gray-800">
          {[
            { id: 'info', label: 'Thông tin', icon: User },
            { id: 'payment', label: 'Thanh toán', icon: DollarSign },
            { id: 'proofs', label: 'Minh chứng', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-gray-800 text-white border-t-2 border-blue-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Tab: Thông tin */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              {/* Customer Info Card */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-700 flex-shrink-0 ring-2 ring-gray-600">
                    {booking.user_avatar_url ? (
                      <img src={booking.user_avatar_url} alt={booking.full_name || "User"} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-gray-500">👤</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-white mb-1">{booking.full_name || booking.user_full_name || "Khách vãng lai"}</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Phone className="w-3.5 h-3.5 text-blue-400" />
                        <span>{booking.phone || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        Đặt: {formatDateTime(booking.created_at)}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>
              </div>

              {/* Service Info */}
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4 text-purple-400" />
                  <h4 className="text-sm font-semibold text-white">Dịch vụ</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-white font-medium">{booking.service_title || "—"}</span>
                    {booking.service_type && (
                      <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">{booking.service_type}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Calendar className="w-3.5 h-3.5 text-green-400" />
                    <span>{formatDate(booking.date_from)} → {formatDate(booking.date_to)}</span>
                  </div>
                  {booking.quantity && booking.quantity > 1 && (
                    <div className="text-sm text-gray-300">
                      Số lượng: <span className="font-semibold text-white">{booking.quantity}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              {booking.additional_requests && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                    <h4 className="text-xs font-semibold text-blue-400">Yêu cầu từ khách</h4>
                  </div>
                  <p className="text-sm text-blue-200">{booking.additional_requests}</p>
                </div>
              )}

              {booking.notes && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <h4 className="text-xs font-semibold text-amber-400">Ghi chú nội bộ</h4>
                  </div>
                  <p className="text-sm text-amber-200">{booking.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Thanh toán */}
          {activeTab === 'payment' && (
            <div className="space-y-4">
              {/* Price Breakdown */}
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <h4 className="text-sm font-semibold text-white">Chi tiết thanh toán</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Tổng giá trị đơn</span>
                    <span className="text-white font-semibold">{formatPrice(booking.total_price)}</span>
                  </div>
                  <div className="border-t border-gray-700 my-2"></div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-300">Đặt cọc</span>
                    <div className="flex items-center gap-2">
                      <span className="text-orange-400 font-semibold">{formatPrice(booking.deposit_amount)}</span>
                      {getPaymentBadge(booking.deposit_status)}
                    </div>
                  </div>
                  {booking.deposit_paid_at && (
                    <div className="text-xs text-gray-400 text-right">
                      Thanh toán: {formatDateTime(booking.deposit_paid_at)}
                    </div>
                  )}
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-300">Còn lại</span>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 font-semibold">{formatPrice(remainingAmount)}</span>
                      {getPaymentBadge(booking.payment_status)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  <h4 className="text-sm font-semibold text-white">Phương thức thanh toán</h4>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white capitalize">{booking.payment_method || "Chưa chọn"}</p>
                    <p className="text-xs text-gray-400">Phương thức thanh toán</p>
                  </div>
                </div>
              </div>

              {/* Payout to Partner */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  <h4 className="text-sm font-semibold text-white">Thanh toán cho Partner</h4>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Trạng thái</span>
                  {getPayoutBadge(booking.payout_status)}
                </div>
                {booking.payout_proof_url && (
                  <a
                    href={booking.payout_proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 mt-2"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    Xem biên lai
                  </a>
                )}
              </div>

              {/* Timeline */}
              {(booking.confirmed_at || booking.cancelled_at) && (
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                  <h4 className="text-sm font-semibold text-white mb-3">Timeline</h4>
                  <div className="space-y-2">
                    {booking.confirmed_at && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-400">Xác nhận đơn</p>
                          <p className="text-xs text-white">{formatDateTime(booking.confirmed_at)}</p>
                        </div>
                      </div>
                    )}
                    {booking.cancelled_at && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-400">Hủy đơn</p>
                          <p className="text-xs text-white">{formatDateTime(booking.cancelled_at)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Minh chứng */}
          {activeTab === 'proofs' && (
            <div className="space-y-4">
              {/* Deposit Proof */}
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-400" />
                    <h4 className="text-sm font-semibold text-white">Minh chứng đặt cọc</h4>
                  </div>
                  {getPaymentBadge(booking.deposit_status)}
                </div>
                {booking.deposit_proof_url ? (
                  <div className="relative rounded-lg overflow-hidden border-2 border-gray-700 bg-gray-800 group">
                    <img
                      src={booking.deposit_proof_url}
                      alt="Deposit Proof"
                      className="w-full max-h-64 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <a
                      href={booking.deposit_proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-2 right-2 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Link2 className="w-3 h-3" />
                      Mở ảnh gốc
                    </a>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-800/50 rounded-lg border border-gray-700 border-dashed">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm">Chưa có minh chứng</p>
                  </div>
                )}
              </div>

              {/* Payment Proof */}
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <h4 className="text-sm font-semibold text-white">Minh chứng thanh toán full</h4>
                  </div>
                  {getPaymentBadge(booking.payment_status)}
                </div>
                {booking.payment_proof_url ? (
                  <div className="relative rounded-lg overflow-hidden border-2 border-gray-700 bg-gray-800 group">
                    <img
                      src={booking.payment_proof_url}
                      alt="Payment Proof"
                      className="w-full max-h-64 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <a
                      href={booking.payment_proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-2 right-2 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Link2 className="w-3 h-3" />
                      Mở ảnh gốc
                    </a>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-800/50 rounded-lg border border-gray-700 border-dashed">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm">Chưa có minh chứng</p>
                  </div>
                )}
              </div>

              {/* Refund Proof - NEW */}
              {booking.refund_proof_url && (
                <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl p-4 border border-red-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-red-400" />
                      <h4 className="text-sm font-semibold text-white">Minh chứng hoàn trả</h4>
                    </div>
                    {getRefundStatusBadge(booking.refund_status)}
                  </div>
                  <div className="relative rounded-lg overflow-hidden border-2 border-red-700/50 bg-gray-800 group">
                    <img
                      src={booking.refund_proof_url}
                      alt="Refund Proof"
                      className="w-full max-h-64 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <a
                      href={booking.refund_proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-2 right-2 px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Link2 className="w-3 h-3" />
                      Mở ảnh gốc
                    </a>
                  </div>
                  {booking.refund_amount && (
                    <div className="mt-3 pt-3 border-t border-red-500/20">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Số tiền đã hoàn trả</span>
                        <span className="text-red-400 font-semibold">{formatPrice(booking.refund_amount)}</span>
                      </div>
                      {booking.refund_processed_at && (
                        <div className="text-xs text-gray-400 text-right mt-1">
                          Hoàn trả lúc: {formatDateTime(booking.refund_processed_at)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Payout Proof */}
              {booking.payout_proof_url && (
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <h4 className="text-sm font-semibold text-white">Biên lai thanh toán Partner</h4>
                    </div>
                    {getPayoutBadge(booking.payout_status)}
                  </div>
                  <div className="relative rounded-lg overflow-hidden border-2 border-gray-700 bg-gray-800 group">
                    <img
                      src={booking.payout_proof_url}
                      alt="Payout Proof"
                      className="w-full max-h-64 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <a
                      href={booking.payout_proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-2 right-2 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Link2 className="w-3 h-3" />
                      Mở ảnh gốc
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 text-sm font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}