"use client";

import { useState } from "react";
import { useBookings } from "./hooks/useBookings";
import { useBookingsSummary } from "./hooks/useBookingsSummary";   // ← MỚI
import { StatCard } from "./components/StatCard";
import { BookingTable } from "./components/BookingTable";
import { BookingFilter } from "./components/BookingFilter";
import { BookingStatus, PayoutStatus } from "./types";

export default function AdminBookingsPage() {
  // ------------------- Bộ lọc -------------------
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<BookingStatus | "all">("all");
  const [filterPayoutStatus, setFilterPayoutStatus] = useState<PayoutStatus | "all">("all");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // ------------------- Summary (toàn hệ thống) -------------------
  // Luôn lấy tổng, không phụ thuộc filter
  const { summary, refresh: refreshSummary } = useBookingsSummary();

  // ------------------- Danh sách đã lọc -------------------
  const {
    bookings: filteredBookings,
    loading: filteredLoading,
    updateStatus: rawUpdateStatus,
    updatePayoutStatus: rawUpdatePayoutStatus,
  } = useBookings(
    filterStatus,
    filterPayoutStatus,
    search,
    startDate,
    endDate
  );

  // Bọc lại để refresh summary ngay khi có thay đổi
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

  // ------------------- UI -------------------
  return (
    <div className="bg-black text-gray-100 min-h-screen p-6 space-y-10 font-sans">
      {/* Tiêu đề */}
      <h1 className="text-3xl font-bold text-center tracking-tight">
        Quản lý đơn đặt dịch vụ
      </h1>

      {/* Thống kê trạng thái đơn đặt – DỮ LIỆU TOÀN BỘ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard label="Tổng số" value={summary.total} color="from-indigo-500 to-purple-500" />
        <StatCard label="Chờ xác nhận" value={summary.pending} color="from-yellow-500 to-orange-500" />
        <StatCard label="Đã xác nhận" value={summary.confirmed} color="from-emerald-500 to-teal-500" />
        <StatCard label="Đã hủy" value={summary.cancelled} color="from-pink-500 to-red-500" />
      </div>

      {/* Thống kê thanh toán cho Partner – DỮ LIỆU TOÀN BỘ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Chờ TT Partner"
          value={summary.partner_pending}
          color="from-amber-500 to-yellow-600"
        />
        <StatCard
          label="Đã TT Partner"
          value={summary.partner_paid}
          color="from-green-500 to-emerald-600"
        />
        <StatCard
          label="TT Partner thất bại"
          value={summary.partner_failed}
          color="from-red-500 to-rose-600"
        />
      </div>

      {/* Bộ lọc nâng cao */}
      <BookingFilter
        search={search}
        setSearch={setSearch}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterPayoutStatus={filterPayoutStatus}
        setFilterPayoutStatus={setFilterPayoutStatus}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      {/* Danh sách Booking – DỮ LIỆU ĐÃ LỌC */}
      <BookingTable
        bookings={filteredBookings}
        loading={filteredLoading}
        updateStatus={updateStatus}
        updatePayoutStatus={updatePayoutStatus}
      />
    </div>
  );
}