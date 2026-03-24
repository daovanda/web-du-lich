"use client";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/apiClient";
import { Profile, UserStats } from "../types";

export function useUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [stats, setStats] = useState<Record<string, UserStats>>({});
  const [summary, setSummary] = useState({ total: 0, admins: 0, partners: 0, normal: 0, newThisWeek: 0, activeThisMonth: 0 });
  const [chartData, setChartData] = useState<{ role: string; count: number }[]>([]);
  const [lineData, setLineData] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const response = await apiRequest<{ users: Profile[]; stats: Record<string, UserStats> }>(
        "/api/admin/users",
        { fallbackMessage: "Không thể tải danh sách người dùng" }
      );
      const data = response.users || [];
      setUsers(data);
      setStats(response.stats || {});
      buildSummaryAndCharts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function buildSummaryAndCharts(data: Profile[]) {
    const admins = data.filter(u => u.role === "admin").length;
    const partners = data.filter(u => u.role === "partner").length;
    const normal = data.filter(u => u.role === "user").length;
    const now = new Date();
    const newThisWeek = data.filter(u => (now.getTime() - new Date(u.created_at).getTime()) / 86400000 <= 7).length;
    const activeThisMonth = data.filter(u => u.last_login_at && (now.getTime() - new Date(u.last_login_at).getTime()) / 86400000 <= 30).length;

    setSummary({ total: data.length, admins, partners, normal, newThisWeek, activeThisMonth });
    setChartData([{ role: "Admin", count: admins }, { role: "Partner", count: partners }, { role: "User", count: normal }]);
    buildLineChart(data);
  }

  function buildLineChart(data: Profile[]) {
    const map: Record<string, number> = {};
    data.forEach(u => {
      const d = new Date(u.created_at).toLocaleDateString("vi-VN");
      map[d] = (map[d] || 0) + 1;
    });
    const arr = Object.entries(map).map(([date, count]) => ({ date, count }));
    arr.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setLineData(arr);
  }

  async function updateRole(id: string, role: string) {
    await apiRequest(`/api/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
      fallbackMessage: "Không thể cập nhật vai trò",
    });
    fetchUsers();
  }

  async function updateStatus(id: string, status: string) {
    await apiRequest(`/api/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      fallbackMessage: "Không thể cập nhật trạng thái",
    });
    fetchUsers();
  }

  return { users, stats, summary, chartData, lineData, loading, updateRole, updateStatus };
}
