// components/BookingTable.tsx
"use client";

import { useState, useMemo } from "react";
import { Booking, BookingStatus, PayoutStatus, RefundStatus, getCurrentStep, PAYMENT_STEPS, formatPrice, getDaysUntilServiceEnd } from "../types";
import BookingDetailModal from "./BookingDetailModal";
import PayoutModal from "./PayoutModal";
import RefundModal from "./RefundModal";
import BookingFilter from "./BookingFilter";
import ConfirmationModal from "./ConfirmationModal";
import { Eye, CheckCircle, X, CreditCard, Package, FileText, Calendar, RefreshCw, XCircle } from "lucide-react";

interface BookingTableProps {
  bookings: Booking[];
  loading: boolean;
  updateStatus: (id: string, status: BookingStatus) => void;
  updatePayoutStatus: (id: string, status: PayoutStatus, proofUrl?: string) => void;
  updateRefundStatus: (id: string, status: RefundStatus, refundAmount: number, proofUrl?: string, note?: string) => Promise<void>;
  confirmDeposit: (id: string) => Promise<boolean>;
  confirmPayment: (id: string) => Promise<boolean>;
}

export function BookingTable({
  bookings,
  loading,
  updateStatus,
  updatePayoutStatus,
  updateRefundStatus,
  confirmDeposit,
  confirmPayment,
}: BookingTableProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [payoutModal, setPayoutModal] = useState<Booking | null>(null);
  const [refundModal, setRefundModal] = useState<Booking | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ booking: Booking; type: 'deposit' | 'payment' } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stepFilter, setStepFilter] = useState<"all" | "cancelled_no_action" | 1 | 2 | 3 | 4 | 5 | 6 | 7>("all");
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    if (diff < 1) return "Vừa xong";
    if (diff < 24) return `${Math.floor(diff)}h`;
    return `${Math.floor(diff / 24)}d`;
  };

  // Filter bookings - Show ALL bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      // Apply search filter
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        !search ||
        booking.full_name?.toLowerCase().includes(search) ||
        booking.phone?.toLowerCase().includes(search) ||
        booking.booking_code?.toLowerCase().includes(search) ||
        booking.service_title?.toLowerCase().includes(search);

      // Apply status filter
      const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
      
      // Apply step filter
      const currentStep = getCurrentStep(booking);
      const matchesStep = 
        stepFilter === "all" || 
        (stepFilter === "cancelled_no_action" && currentStep === null) ||
        currentStep === stepFilter;
      
      return matchesSearch && matchesStatus && matchesStep;
    });
  }, [bookings, searchTerm, statusFilter, stepFilter]);

  // Count by step - include null as "cancelled_no_action"
  const stepCounts = useMemo(() => {
    const counts: Record<string, number> = { 
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0,
      cancelled_no_action: 0 
    };
    
    bookings.forEach(b => {
      const step = getCurrentStep(b);
      if (step === null) {
        counts.cancelled_no_action++;
      } else {
        counts[step]++;
      }
    });
    
    return counts;
  }, [bookings]);

  // Handle confirm actions
  const handleConfirm = async (type: 'deposit' | 'payment', bookingId: string) => {
    setActionLoading(prev => ({ ...prev, [bookingId]: true }));
    
    try {
      if (type === 'deposit') {
        await confirmDeposit(bookingId);
      } else {
        await confirmPayment(bookingId);
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  // Get step indicator color
  const getStepDotColor = (step: number | null) => {
    if (step === null) return 'bg-gray-500';
    switch(step) {
      case 1: return 'bg-yellow-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-blue-500';
      case 4: return 'bg-purple-500';
      case 5: return 'bg-green-500';
      case 6: return 'bg-emerald-500';
      case 7: return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Đơn đặt dịch vụ</h2>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-800 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-3 bg-gray-800 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-800 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">📋</span>
          Đơn đặt dịch vụ
          <span className="text-sm font-normal text-gray-400">({filteredBookings.length})</span>
        </h2>
      </div>

      {/* Filter Component */}
      <BookingFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        stepFilter={stepFilter}
        setStepFilter={setStepFilter}
        stepCounts={stepCounts}
      />

      {/* Bookings List */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-2">
          {filteredBookings.map((booking) => {
            const currentStep = getCurrentStep(booking);
            
            // Handle cancelled bookings without payment (step = null)
            if (currentStep === null) {
              return (
                <div
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking)}
                  className="group bg-gradient-to-br from-gray-900/80 to-gray-900/50 border border-gray-700 rounded-xl p-3 hover:border-gray-600 hover:shadow-lg transition-all cursor-pointer opacity-60"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-800 ring-2 ring-gray-700">
                        {booking.user_avatar_url ? (
                          <img
                            src={booking.user_avatar_url}
                            alt={booking.full_name || "User"}
                            className="w-full h-full object-cover grayscale"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-xl text-gray-500">
                            👤
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900 bg-gray-500"></div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-gray-400 text-sm truncate line-through">
                          {booking.full_name || "Khách vãng lai"}
                        </h3>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-500/10 text-gray-400 border border-gray-500/50">
                          Đã hủy
                        </span>
                        {booking.booking_code && (
                          <span className="text-[10px] text-gray-500 font-mono">#{booking.booking_code}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          <span className="truncate max-w-[150px] line-through">{booking.service_title}</span>
                        </span>
                        {booking.phone && (
                          <>
                            <span>•</span>
                            <span className="truncate">{booking.phone}</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="text-gray-500">{formatDate(booking.created_at)}</span>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="px-2.5 py-1.5 bg-gray-500/20 text-gray-400 border border-gray-500/30 text-xs font-semibold rounded-lg flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Không cần xử lý
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            // Normal flow (steps 1-7)
            const stepConfig = PAYMENT_STEPS[currentStep];
            const isLoading = actionLoading[booking.id];
            const depositAmount = booking.deposit_amount || 0;
            const remainingAmount = (booking.total_price || 0) - depositAmount;
            const daysUntilEnd = getDaysUntilServiceEnd(booking);
            
            return (
              <div
                key={booking.id}
                onClick={() => setSelectedBooking(booking)}
                className={`group bg-gradient-to-br from-gray-900/80 to-gray-900/50 border rounded-xl p-3 hover:border-gray-700 hover:shadow-lg transition-all cursor-pointer ${stepConfig.borderColor}`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-800 ring-2 ring-gray-700 group-hover:ring-blue-500 transition-all">
                      {booking.user_avatar_url ? (
                        <img
                          src={booking.user_avatar_url}
                          alt={booking.full_name || "User"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-xl text-gray-500">
                          👤
                        </div>
                      )}
                    </div>
                    
                    {/* Step indicator dot */}
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900 ${getStepDotColor(currentStep)}`}></div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-white text-sm truncate group-hover:text-blue-400 transition-colors">
                        {booking.full_name || "Khách vãng lai"}
                      </h3>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${stepConfig.bgColor} ${stepConfig.color} border ${stepConfig.borderColor}`}>
                        {stepConfig.shortLabel}
                      </span>
                      {booking.booking_code && (
                        <span className="text-[10px] text-gray-500 font-mono">#{booking.booking_code}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        <span className="truncate max-w-[150px]">{booking.service_title}</span>
                      </span>
                      {booking.phone && (
                        <>
                          <span>•</span>
                          <span className="truncate">{booking.phone}</span>
                        </>
                      )}
                      
                      {/* Display amount based on step */}
                      {currentStep === 1 || currentStep === 2 ? (
                        <>
                          <span>•</span>
                          <span className="text-yellow-400 font-semibold">
                            Cọc: {formatPrice(depositAmount)}
                          </span>
                        </>
                      ) : currentStep === 3 || currentStep === 4 ? (
                        <>
                          <span>•</span>
                          <span className="text-blue-400 font-semibold">
                            Còn: {formatPrice(remainingAmount)}
                          </span>
                        </>
                      ) : (
                        <>
                          <span>•</span>
                          <span className="text-green-400 font-semibold">
                            Tổng: {formatPrice(booking.total_price)}
                          </span>
                        </>
                      )}
                      
                      {/* Show days until service end for step 5 */}
                      {currentStep === 5 && daysUntilEnd !== null && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {daysUntilEnd > 0 ? (
                              <span className="text-blue-400">Còn {daysUntilEnd} ngày</span>
                            ) : daysUntilEnd === 0 ? (
                              <span className="text-orange-400">Hôm nay</span>
                            ) : (
                              <span className="text-green-400">Đã qua {Math.abs(daysUntilEnd)} ngày</span>
                            )}
                          </span>
                        </>
                      )}
                      
                      <span>•</span>
                      <span className="text-gray-500">{formatDate(booking.created_at)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 flex-shrink-0"
                  >
                    {/* Step 2: Confirm deposit */}
                    {currentStep === 2 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmModal({ booking, type: 'deposit' });
                        }}
                        disabled={isLoading}
                        className="px-2.5 py-1.5 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30 text-xs font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        XN cọc
                      </button>
                    )}

                    {/* Step 4: Confirm payment */}
                    {currentStep === 4 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmModal({ booking, type: 'payment' });
                        }}
                        disabled={isLoading}
                        className="px-2.5 py-1.5 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30 text-xs font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        XN TT
                      </button>
                    )}

                    {/* Step 6: Payout to partner */}
                    {currentStep === 6 && booking.payout_status === 'pending' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPayoutModal(booking);
                        }}
                        disabled={isLoading}
                        className="px-2.5 py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center gap-1"
                      >
                        <CreditCard className="w-3 h-3" />
                        TT Partner
                      </button>
                    )}

                    {/* Step 7: Refund action button */}
                    {currentStep === 7 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRefundModal(booking);
                        }}
                        disabled={isLoading}
                        className="px-2.5 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 text-xs font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Xử lý HT
                      </button>
                    )}

                    {/* Status badge */}
                    <div className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                      booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                      booking.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {booking.status}
                    </div>
                  </div>
                </div>

                {/* Mini timeline progress - Updated to 7 steps */}
                <div className="flex items-center gap-1 mt-2.5 pt-2.5 border-t border-gray-800/50">
                  {[1, 2, 3, 4, 5, 6, 7].map((step) => {
                    const isActive = currentStep >= step;
                    const isCurrent = currentStep === step;
                    return (
                      <div
                        key={step}
                        className={`flex-1 h-1 rounded-full transition-all ${
                          isCurrent ? 'bg-blue-500 shadow-lg shadow-blue-500/50' :
                          isActive ? 'bg-green-500' : 
                          'bg-gray-800'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400 bg-gray-900/30 rounded-xl border border-gray-800">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-sm">Không tìm thấy đơn đặt nào phù hợp.</p>
        </div>
      )}

      {/* Quick Stats */}
      {bookings.length > 0 && (
        <div className="p-3 bg-gray-900/30 rounded-xl border border-gray-800 space-y-2">
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-semibold text-white">{bookings.filter((b) => b.status === "confirmed").length}</span>
              Confirmed
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="font-semibold text-white">{bookings.filter((b) => b.status === "pending").length}</span>
              Pending
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="font-semibold text-white">{bookings.filter((b) => b.status === "cancelled").length}</span>
              Cancelled
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-xs pt-2 border-t border-gray-800 flex-wrap">
            {Object.entries(stepCounts).map(([step, count]) => {
              if (step === 'cancelled_no_action') {
                return (
                  <span key={step} className="flex items-center gap-1.5 text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                    <span className="font-semibold text-white">{count}</span>
                    <span>Hủy (0đ)</span>
                  </span>
                );
              }
              
              const stepNum = parseInt(step) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
              const stepConfig = PAYMENT_STEPS[stepNum];
              return (
                <span key={step} className="flex items-center gap-1.5 text-gray-400">
                  <div className={`w-2 h-2 rounded-full ${getStepDotColor(stepNum)}`}></div>
                  <span className="font-semibold text-white">{count}</span>
                  <span>{stepConfig.shortLabel}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
      
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

      {refundModal && (
        <RefundModal
          booking={refundModal}
          onClose={() => setRefundModal(null)}
          onUpdateRefund={updateRefundStatus}
        />
      )}

      {confirmModal && (
        <ConfirmationModal
          booking={confirmModal.booking}
          type={confirmModal.type}
          onClose={() => setConfirmModal(null)}
          onConfirm={() => handleConfirm(confirmModal.type, confirmModal.booking.id)}
        />
      )}
    </div>
  );
}