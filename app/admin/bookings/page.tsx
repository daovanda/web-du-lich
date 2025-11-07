"use client";

import { useState } from "react";
import { useBookings } from "./hooks/useBookings";
import { useBookingsSummary } from "./hooks/useBookingsSummary";
import { BookingTable } from "./components/BookingTable";
import { BookingStatus, PayoutStatus, RefundStatus } from "./types";
import { DashboardStats } from './components/DashboardStats';

export default function AdminBookingsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<BookingStatus | "all">("all");
  const [filterPayoutStatus, setFilterPayoutStatus] = useState<PayoutStatus | "all">("all");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const { summary, refresh: refreshSummary } = useBookingsSummary();

  const {
    bookings: filteredBookings,
    loading: filteredLoading,
    updateStatus: rawUpdateStatus,
    updatePayoutStatus: rawUpdatePayoutStatus,
    updateRefundStatus: rawUpdateRefundStatus,
    confirmDeposit: rawConfirmDeposit,
    confirmPayment: rawConfirmPayment,
  } = useBookings(
    filterStatus,
    filterPayoutStatus,
    search,
    startDate,
    endDate
  );

  // Wrap functions to refresh summary
  const updateStatus = async (id: string, status: BookingStatus) => {
    await rawUpdateStatus(id, status);
    refreshSummary();
  };

  const updatePayoutStatus = async (
    id: string,
    status: PayoutStatus,
    proofUrl?: string
  ) => {
    await rawUpdatePayoutStatus(id, status, proofUrl);
    refreshSummary();
  };

  const updateRefundStatus = async (
    id: string,
    status: RefundStatus,
    refundAmount: number,
    proofUrl?: string,
    note?: string
  ) => {
    await rawUpdateRefundStatus(id, status, refundAmount, proofUrl, note);
    refreshSummary();
  };

  const confirmDeposit = async (id: string) => {
    const result = await rawConfirmDeposit(id);
    refreshSummary();
    return result;
  };

  const confirmPayment = async (id: string) => {
    const result = await rawConfirmPayment(id);
    refreshSummary();
    return result;
  };

  return (
    <div className="bg-black text-gray-100 min-h-screen p-6 space-y-10 font-sans">
      <h1 className="text-3xl font-bold text-center tracking-tight">
        Quản lý đơn đặt dịch vụ
      </h1>

      {/* Dashboard Stats - Thay thế các StatCard cũ */}
      <DashboardStats bookings={filteredBookings} loading={filteredLoading} />

      {/* Danh sách Booking */}
      <BookingTable
        bookings={filteredBookings}
        loading={filteredLoading}
        updateStatus={updateStatus}
        updatePayoutStatus={updatePayoutStatus}
        updateRefundStatus={updateRefundStatus}
        confirmDeposit={confirmDeposit}
        confirmPayment={confirmPayment}
      />
    </div>
  );
}