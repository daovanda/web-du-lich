"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// ✅ Giao diện Booking từ VIEW
interface Booking {
  id: string;
  user_id: string;
  service_id: string;
  full_name: string | null;
  phone: string | null;
  additional_requests: string | null;
  date_from: string | null;
  date_to: string | null;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
  total_price?: number;
  payment_status?: string;
  payment_method?: string;
  user_full_name?: string | null;
  user_avatar_url?: string | null;
  service_title?: string | null;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
  });

  useEffect(() => {
    fetchBookings();
  }, [filterStatus]);

  /* ------------------------- Fetch bookings từ VIEW ------------------------- */
  async function fetchBookings() {
    setLoading(true);

    let query = supabase
      .from("bookings_view") // ✅ sử dụng VIEW
      .select("*")
      .order("created_at", { ascending: false });

    if (filterStatus !== "all") {
      query = query.eq("status", filterStatus);
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ Fetch bookings error:", error.message || JSON.stringify(error));
      setBookings([]);
    } else {
      setBookings(data || []);
      if (data) {
        setSummary({
          total: data.length,
          pending: data.filter((b) => b.status === "pending").length,
          confirmed: data.filter((b) => b.status === "confirmed").length,
          cancelled: data.filter((b) => b.status === "cancelled").length,
        });
      }
    }

    setLoading(false);
  }

  /* ------------------------- Cập nhật trạng thái booking ------------------------- */
  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert("❌ Lỗi cập nhật trạng thái: " + error.message);
    } else {
      alert("✅ Cập nhật trạng thái thành công!");
      fetchBookings();
    }
  }

  return (
    <div className="bg-black text-gray-100 min-h-screen p-6 space-y-10 font-sans">
      <h1 className="text-3xl font-bold text-center tracking-tight">📦 Quản lý đơn đặt dịch vụ</h1>

      {/* 📊 Thống kê tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard label="Tổng số" value={summary.total} color="from-indigo-500 to-purple-500" />
        <StatCard label="Pending" value={summary.pending} color="from-yellow-500 to-orange-500" />
        <StatCard label="Confirmed" value={summary.confirmed} color="from-emerald-500 to-teal-500" />
        <StatCard label="Cancelled" value={summary.cancelled} color="from-pink-500 to-red-500" />
      </div>

      {/* 📁 Bộ lọc */}
      <div className="flex gap-4 mt-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-neutral-900 border border-neutral-700 rounded px-4 py-2 text-white focus:border-purple-500 outline-none"
        >
          <option value="all">Tất cả</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* 📋 Danh sách Booking */}
      {loading ? (
        <p className="text-center text-gray-400 mt-6">⏳ Đang tải dữ liệu...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-800 mt-6">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-900 text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Người đặt</th>
                <th className="px-4 py-3 text-left">SĐT</th>
                <th className="px-4 py-3 text-left">Dịch vụ</th>
                <th className="px-4 py-3 text-left">Thời gian</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-left">Yêu cầu thêm</th>
                <th className="px-4 py-3 text-left">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {bookings.length > 0 ? (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-neutral-900/60 transition">
                    <td className="px-4 py-3 text-xs text-gray-500">{b.id.slice(0, 8)}...</td>
                    <td className="px-4 py-3 flex items-center gap-3">
                      {b.user_avatar_url ? (
                        <img
                          src={b.user_avatar_url}
                          alt={b.user_full_name || "avatar"}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-neutral-700 flex items-center justify-center text-gray-400">?</div>
                      )}
                      <span>{b.full_name || b.user_full_name || "—"}</span>
                    </td>
                    <td className="px-4 py-3">{b.phone || "—"}</td>
                    <td className="px-4 py-3">{b.service_title || "—"}</td>
                    <td className="px-4 py-3">{b.date_from} → {b.date_to}</td>
                    <td className="px-4 py-3">
                      <select
                        value={b.status}
                        onChange={(e) => updateStatus(b.id, e.target.value)}
                        className={`px-2 py-1 rounded border border-neutral-700 bg-neutral-800 ${
                          b.status === "pending" ? "text-yellow-400" :
                          b.status === "confirmed" ? "text-green-400" :
                          "text-red-400"
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{b.additional_requests || "—"}</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(b.created_at).toLocaleDateString("vi-VN")}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                    Không có đơn đặt nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* 📊 Component thẻ thống kê */
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`p-6 rounded-xl bg-gradient-to-r ${color} text-white shadow-lg`}>
      <p className="text-sm uppercase opacity-90">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
