// components/DashboardStats.tsx
"use client";

import { StatCard } from "./StatCard";
import { Booking } from "../types";

interface DashboardStatsProps {
  bookings: Booking[];
  loading?: boolean;
}

export function DashboardStats({ bookings, loading }: DashboardStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-48 bg-gray-900/50 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Tính toán các chỉ số
  const totalBookings = bookings.length;
  
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
  
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;

  // Doanh thu dự kiến: Tổng total_price của tất cả bookings không bị cancelled
  const expectedRevenue = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => sum + (b.total_price || 0), 0);

  // Doanh thu thực: Tổng total_price của các bookings đã thanh toán cho đối tác (payout_status = 'paid')
  const actualRevenue = bookings
    .filter(b => b.payout_status === 'paid')
    .reduce((sum, b) => sum + (b.total_price || 0), 0);

  // Bookings đang chờ thanh toán partner
  const pendingPayoutBookings = bookings.filter(b => b.payout_status === 'pending').length;

  // Bookings đã thanh toán partner
  const paidPayoutBookings = bookings.filter(b => b.payout_status === 'paid').length;

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Tổng đơn đặt"
          value={totalBookings}
          color="from-blue-500 to-blue-600"
          icon="booking"
          bookings={bookings}
          type="count"
        />
        
        <StatCard
          label="Đã xác nhận"
          value={confirmedBookings}
          color="from-green-500 to-green-600"
          icon="confirmed"
          bookings={bookings.filter(b => b.status === 'confirmed')}
          type="count"
        />
        
        <StatCard
          label="Chờ xử lý"
          value={pendingBookings}
          color="from-yellow-500 to-yellow-600"
          icon="pending"
          bookings={bookings.filter(b => b.status === 'pending')}
          type="count"
        />
        
        <StatCard
          label="Đã hủy"
          value={cancelledBookings}
          color="from-red-500 to-red-600"
          icon="cancelled"
          bookings={bookings.filter(b => b.status === 'cancelled')}
          type="count"
        />
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          label="Doanh thu dự kiến"
          value={expectedRevenue}
          color="from-purple-500 to-purple-600"
          icon="revenue"
          bookings={bookings}
          type="expected-revenue"
        />
        
        <StatCard
          label="Doanh thu thực tế"
          value={actualRevenue}
          color="from-emerald-500 to-emerald-600"
          icon="wallet"
          bookings={bookings}
          type="actual-revenue"
        />
      </div>

      {/* Partner Payout Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-400 text-sm font-medium uppercase tracking-wide">
                Chờ TT Partner
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {pendingPayoutBookings}
              </p>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-gradient-to-br from-teal-500/10 to-teal-600/10 border border-teal-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-400 text-sm font-medium uppercase tracking-wide">
                Đã TT Partner
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {paidPayoutBookings}
              </p>
            </div>
            <div className="p-3 bg-teal-500/20 rounded-xl">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Comparison */}
      <div className="p-5 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <span className="text-xl">📊</span>
          So sánh doanh thu
        </h3>
        
        <div className="space-y-3">
          {/* Expected Revenue Bar */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-400">Dự kiến</span>
              <span className="text-purple-400 font-semibold">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND"
                }).format(expectedRevenue)}
              </span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Actual Revenue Bar */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-400">Thực tế</span>
              <span className="text-emerald-400 font-semibold">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND"
                }).format(actualRevenue)}
              </span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                style={{ 
                  width: `${expectedRevenue > 0 ? (actualRevenue / expectedRevenue * 100) : 0}%` 
                }}
              />
            </div>
          </div>

          {/* Percentage */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-700">
            <span className="text-gray-400 text-sm">Tỷ lệ đạt được</span>
            <span className="text-white font-bold">
              {expectedRevenue > 0 
                ? ((actualRevenue / expectedRevenue) * 100).toFixed(1) 
                : 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}