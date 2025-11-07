// components/StatCard.tsx
"use client";

import { TrendingUp, TrendingDown, DollarSign, Package, CheckCircle, XCircle, Clock, Wallet } from "lucide-react";
import { Booking } from "../types";

interface StatCardProps {
  label: string;
  value: number;
  color: string;
  icon?: 'revenue' | 'booking' | 'confirmed' | 'cancelled' | 'pending' | 'wallet';
  bookings?: Booking[];
  type?: 'count' | 'revenue' | 'expected-revenue' | 'actual-revenue';
}

export function StatCard({ 
  label, 
  value, 
  color, 
  icon = 'booking',
  bookings = [],
  type = 'count'
}: StatCardProps) {
  
  // Tính toán dữ liệu 7 ngày gần nhất
  const getLast7DaysData = () => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    return last7Days.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      
      if (type === 'count') {
        // Đếm số booking
        const count = bookings.filter(b => 
          b.created_at?.startsWith(dateStr)
        ).length;
        return { date: dateStr, value: count };
      } else if (type === 'expected-revenue') {
        // Tổng doanh thu dự kiến (tất cả bookings không bị cancelled)
        const revenue = bookings
          .filter(b => 
            b.created_at?.startsWith(dateStr) && 
            b.status !== 'cancelled'
          )
          .reduce((sum, b) => sum + (b.total_price || 0), 0);
        return { date: dateStr, value: revenue };
      } else if (type === 'actual-revenue') {
        // Doanh thu thực (đã thanh toán cho đối tác)
        const revenue = bookings
          .filter(b => 
            b.created_at?.startsWith(dateStr) && 
            b.payout_status === 'paid'
          )
          .reduce((sum, b) => sum + (b.total_price || 0), 0);
        return { date: dateStr, value: revenue };
      }
      return { date: dateStr, value: 0 };
    });
  };

  const chartData = getLast7DaysData();
  const maxValue = Math.max(...chartData.map(d => d.value), 1);
  
  // Tính % thay đổi so với ngày hôm qua
  const yesterdayValue = chartData[chartData.length - 2]?.value || 0;
  const todayValue = chartData[chartData.length - 1]?.value || 0;
  const changePercent = yesterdayValue > 0 
    ? ((todayValue - yesterdayValue) / yesterdayValue * 100).toFixed(1)
    : 0;
  const isPositive = Number(changePercent) >= 0;

  // Icon mapping
  const iconMap = {
    revenue: DollarSign,
    booking: Package,
    confirmed: CheckCircle,
    cancelled: XCircle,
    pending: Clock,
    wallet: Wallet
  };
  const IconComponent = iconMap[icon];

  // Format value
  const formatValue = () => {
    if (type === 'expected-revenue' || type === 'actual-revenue') {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(value);
    }
    return value.toLocaleString();
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} p-5 shadow-xl hover:shadow-2xl transition-all duration-300 group`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/80 text-sm font-medium uppercase tracking-wide">
              {label}
            </p>
            <div className="flex items-baseline gap-2 mt-2">
              <h3 className="text-3xl font-bold text-white">
                {formatValue()}
              </h3>
              {/* Trend indicator */}
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                isPositive 
                  ? 'bg-white/20 text-white' 
                  : 'bg-black/20 text-white'
              }`}>
                {isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(Number(changePercent))}%
              </div>
            </div>
          </div>

          {/* Icon */}
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform">
            <IconComponent className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Mini Chart */}
        <div className="flex items-end gap-1 h-12 mt-4">
          {chartData.map((data, index) => {
            const height = maxValue > 0 ? (data.value / maxValue) * 100 : 0;
            const isToday = index === chartData.length - 1;
            
            return (
              <div
                key={data.date}
                className="flex-1 group/bar relative"
              >
                <div
                  className={`w-full rounded-t transition-all duration-300 ${
                    isToday 
                      ? 'bg-white shadow-lg' 
                      : 'bg-white/40 group-hover/bar:bg-white/60'
                  }`}
                  style={{ height: `${height}%` }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {new Date(data.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
                    <br />
                    {type === 'count' ? (
                      `${data.value} đơn`
                    ) : (
                      new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                        notation: 'compact'
                      }).format(data.value)
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
          <span className="text-white/70 text-xs">7 ngày qua</span>
          <span className="text-white/90 text-xs font-medium">
            {type === 'count' ? (
              `Hôm nay: ${todayValue}`
            ) : (
              `Hôm nay: ${new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                notation: 'compact',
                maximumFractionDigits: 0
              }).format(todayValue)}`
            )}
          </span>
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    </div>
  );
}