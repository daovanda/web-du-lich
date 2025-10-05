"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

type Profile = {
  id: string;
  full_name: string | null;
  role: "user" | "partner" | "admin";
  username: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  last_login_at?: string | null;
};

type UserStats = {
  services_count: number;
  bookings_count: number;
  service_reviews_count: number;
  location_reviews_count: number;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [stats, setStats] = useState<Record<string, UserStats>>({});
  const [loading, setLoading] = useState(false);

  // Tìm kiếm, filter, phân trang
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "partner" | "admin">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "7d" | "30d">("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Biểu đồ
  const [chartData, setChartData] = useState<{ role: string; count: number }[]>([]);
  const [lineData, setLineData] = useState<{ date: string; count: number }[]>([]);

  // Thống kê tổng quan
  const [summary, setSummary] = useState({ total: 0, admins: 0, partners: 0, normal: 0, newThisWeek: 0, activeThisMonth: 0 });

  // Modal chi tiết user
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [userHistory, setUserHistory] = useState<{ services: any[]; bookings: any[]; service_reviews: any[]; location_reviews: any[] }>({
    services: [],
    bookings: [],
    service_reviews: [],
    location_reviews: [],
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch profiles error:", error);
    } else {
      setUsers(data || []);
      if (data) {
        fetchStats(data.map((u) => u.id));
        const admins = data.filter((u) => u.role === "admin").length;
        const partners = data.filter((u) => u.role === "partner").length;
        const normal = data.filter((u) => u.role === "user").length;

        const now = new Date();
        const newThisWeek = data.filter((u) => {
          const d = new Date(u.created_at);
          return (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) <= 7;
        }).length;
        const activeThisMonth = data.filter((u) => {
          if (!u.last_login_at) return false;
          const d = new Date(u.last_login_at);
          return (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) <= 30;
        }).length;

        setSummary({ total: data.length, admins, partners, normal, newThisWeek, activeThisMonth });
        setChartData([
          { role: "Admin", count: admins },
          { role: "Partner", count: partners },
          { role: "User", count: normal },
        ]);
        buildLineChart(data);
      }
    }
    setLoading(false);
  }

  function buildLineChart(data: Profile[]) {
    const map: Record<string, number> = {};
    data.forEach((u) => {
      const d = new Date(u.created_at).toLocaleDateString("vi-VN");
      map[d] = (map[d] || 0) + 1;
    });
    const arr = Object.entries(map).map(([date, count]) => ({ date, count }));
    arr.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setLineData(arr);
  }

  async function fetchStats(userIds: string[]) {
    const newStats: Record<string, UserStats> = {};
    const initStats = (id: string) => {
      if (!newStats[id]) newStats[id] = { services_count: 0, bookings_count: 0, service_reviews_count: 0, location_reviews_count: 0 };
    };

    const { data: services } = await supabase.from("services").select("owner_id").in("owner_id", userIds);
    services?.forEach((s) => {
      initStats(s.owner_id);
      newStats[s.owner_id].services_count++;
    });

    const { data: bookings } = await supabase.from("bookings").select("user_id").in("user_id", userIds);
    bookings?.forEach((b) => {
      initStats(b.user_id);
      newStats[b.user_id].bookings_count++;
    });

    const { data: sReviews } = await supabase.from("service_reviews").select("user_id").in("user_id", userIds);
    sReviews?.forEach((r) => {
      initStats(r.user_id);
      newStats[r.user_id].service_reviews_count++;
    });

    const { data: lReviews } = await supabase.from("reviews").select("user_id").in("user_id", userIds);
    lReviews?.forEach((r) => {
      initStats(r.user_id);
      newStats[r.user_id].location_reviews_count++;
    });

    setStats(newStats);
  }

  async function updateRole(id: string, role: string) {
    const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
    if (error) alert("Lỗi cập nhật role: " + error.message);
    else fetchUsers();
  }

  async function openUserDetail(user: Profile) {
    setSelectedUser(user);
    const { data: services } = await supabase.from("services").select("id,title,type,created_at").eq("owner_id", user.id);
    const { data: bookings } = await supabase.from("bookings").select("id,service_id,status,date_from,date_to,created_at").eq("user_id", user.id);
    const { data: sReviews } = await supabase.from("service_reviews").select("id,rating,comment,created_at,service_id").eq("user_id", user.id);
    const { data: lReviews } = await supabase.from("reviews").select("id,rating,comment,created_at,location_id").eq("user_id", user.id);

    setUserHistory({ services: services || [], bookings: bookings || [], service_reviews: sReviews || [], location_reviews: lReviews || [] });
  }

  // Filter + search + phân trang
  const filteredUsers = users.filter((u) => {
    const keyword = search.toLowerCase();
    const matchSearch = !keyword || [u.full_name, u.username, u.phone].some((f) => f?.toLowerCase().includes(keyword));
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const now = new Date();
    let matchDate = true;
    if (dateFilter === "7d") {
      const d = new Date(u.created_at);
      matchDate = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) <= 7;
    }
    if (dateFilter === "30d") {
      const d = new Date(u.created_at);
      matchDate = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) <= 30;
    }
    return matchSearch && matchRole && matchDate;
  });
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const pagedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="bg-black text-gray-100 min-h-screen p-6 space-y-10">
      <h1 className="text-3xl font-bold text-center">Quản lý người dùng</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow"><p>Tổng</p><p className="text-2xl font-bold">{summary.total}</p></div>
        <div className="p-6 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow"><p>Admin</p><p className="text-2xl font-bold">{summary.admins}</p></div>
        <div className="p-6 rounded-lg bg-gradient-to-r from-pink-500 to-red-500 text-white shadow"><p>Partner</p><p className="text-2xl font-bold">{summary.partners}</p></div>
        <div className="p-6 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow"><p>User</p><p className="text-2xl font-bold">{summary.normal}</p></div>
      </div>

      {/* Biểu đồ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-neutral-900 rounded-lg p-4"><h3 className="font-semibold mb-2">Tỷ lệ Role</h3><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={chartData} dataKey="count" nameKey="role" outerRadius={100} label>{chartData.map((_, i) => <Cell key={i} fill={["#6366F1", "#10B981", "#F43F5E"][i]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
        <div className="bg-neutral-900 rounded-lg p-4"><h3 className="font-semibold mb-2">Người dùng theo ngày</h3><ResponsiveContainer width="100%" height={250}><LineChart data={lineData}><CartesianGrid strokeDasharray="3 3" stroke="#333" /><XAxis dataKey="date" stroke="#888" /><YAxis stroke="#888" /><Tooltip /><Legend /><Line type="monotone" dataKey="count" stroke="#6366F1" /></LineChart></ResponsiveContainer></div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap items-center gap-4">
        <input placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-3 py-2 rounded bg-neutral-900 border border-neutral-700" />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)} className="px-3 py-2 rounded bg-neutral-900 border border-neutral-700">
          <option value="all">Tất cả role</option><option value="user">User</option><option value="partner">Partner</option><option value="admin">Admin</option>
        </select>
        <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value as any)} className="px-3 py-2 rounded bg-neutral-900 border border-neutral-700">
          <option value="all">Tất cả</option><option value="7d">7 ngày qua</option><option value="30d">30 ngày qua</option>
        </select>
      </div>

      {/* Users table */}
      {loading ? <p>Đang tải...</p> : (
        <div className="overflow-x-auto rounded-lg border border-neutral-800">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-900 text-gray-400 uppercase text-xs"><tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Avatar</th><th className="px-4 py-3">Tên</th><th className="px-4 py-3">Username</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Ngày tạo</th><th className="px-4 py-3">Dịch vụ</th><th className="px-4 py-3">Booking</th><th className="px-4 py-3">ĐG dịch vụ</th><th className="px-4 py-3">ĐG địa điểm</th></tr></thead>
            <tbody className="divide-y divide-neutral-800">
              {pagedUsers.map(u => (
                <tr key={u.id} className="hover:bg-neutral-900/50 cursor-pointer" onClick={() => openUserDetail(u)}>
                  <td className="px-4 py-3 text-xs text-gray-500">{u.id.slice(0,8)}...</td>
                  <td className="px-4 py-3">{u.avatar_url ? <img src={u.avatar_url} className="h-10 w-10 rounded-full" /> : <div className="h-10 w-10 rounded-full bg-neutral-700 flex items-center justify-center">?</div>}</td>
                  <td className="px-4 py-3 font-semibold">{u.full_name}</td>
                  <td className="px-4 py-3">{u.username}</td>
                  <td className="px-4 py-3">{u.phone}</td>
                  <td className="px-4 py-3"><select value={u.role} onChange={(e)=>updateRole(u.id,e.target.value)} className="bg-black border border-neutral-700 rounded px-2 py-1"><option value="user">User</option><option value="partner">Partner</option><option value="admin">Admin</option></select></td>
                  <td className="px-4 py-3 text-gray-400">{new Date(u.created_at).toLocaleDateString("vi-VN")}</td>
                  <td className="px-4 py-3 text-center">{stats[u.id]?.services_count ?? 0}</td>
                  <td className="px-4 py-3 text-center">{stats[u.id]?.bookings_count ?? 0}</td>
                  <td className="px-4 py-3 text-center">{stats[u.id]?.service_reviews_count ?? 0}</td>
                  <td className="px-4 py-3 text-center">{stats[u.id]?.location_reviews_count ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-4">{Array.from({length: totalPages},(_,i)=>(
        <button key={i} onClick={()=>setPage(i+1)} className={`px-3 py-1 rounded ${page===i+1?"bg-indigo-600":"bg-neutral-800"}`}>{i+1}</button>
      ))}</div>

      {/* Modal chi tiết user */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-neutral-900 text-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Chi tiết người dùng</h2>
              <button onClick={()=>setSelectedUser(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <img src={selectedUser.avatar_url || "/default-avatar.png"} className="h-16 w-16 rounded-full object-cover" />
              <div><p className="text-lg font-semibold">{selectedUser.full_name}</p><p className="text-sm text-gray-400">{selectedUser.username}</p><p className="text-sm text-gray-400">📱 {selectedUser.phone}</p><p className="text-sm text-gray-400">Role: {selectedUser.role}</p><p className="text-sm text-gray-400">Ngày tạo: {new Date(selectedUser.created_at).toLocaleDateString("vi-VN")}</p><p className="text-sm text-gray-400">Last login: {selectedUser.last_login_at?new Date(selectedUser.last_login_at).toLocaleString("vi-VN"):"-"}</p></div>
            </div>
            <div className="space-y-6">
              <div><h3 className="font-semibold mb-2">Dịch vụ đã thêm</h3>{userHistory.services.length?userHistory.services.map(s=><p key={s.id}>{s.title} ({s.type})</p>):<p>Không có dịch vụ</p>}</div>
              <div><h3 className="font-semibold mb-2">Booking</h3>{userHistory.bookings.length?userHistory.bookings.map(b=><p key={b.id}>{b.service_id} - {b.status}</p>):<p>Không có booking</p>}</div>
              <div><h3 className="font-semibold mb-2">Đánh giá dịch vụ</h3>{userHistory.service_reviews.length?userHistory.service_reviews.map(r=><p key={r.id}>⭐ {r.rating} - {r.comment}</p>):<p>Không có</p>}</div>
              <div><h3 className="font-semibold mb-2">Đánh giá địa điểm</h3>{userHistory.location_reviews.length?userHistory.location_reviews.map(r=><p key={r.id}>⭐ {r.rating} - {r.comment}</p>):<p>Không có</p>}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
