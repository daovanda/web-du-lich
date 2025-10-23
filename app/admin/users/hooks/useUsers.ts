"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
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
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) return console.error(error);
    if (!data) return;

    setUsers(data);
    await fetchStats(data.map(u => u.id));
    buildSummaryAndCharts(data);
    setLoading(false);
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

  async function fetchStats(userIds: string[]) {
    const newStats: Record<string, UserStats> = {};
    const init = (id: string) => { if (!newStats[id]) newStats[id] = { services_count: 0, bookings_count: 0, service_reviews_count: 0, location_reviews_count: 0 }; };

    const [services, bookings, sReviews, lReviews] = await Promise.all([
      supabase.from("services").select("owner_id").in("owner_id", userIds),
      supabase.from("bookings").select("user_id").in("user_id", userIds),
      supabase.from("service_reviews").select("user_id").in("user_id", userIds),
      supabase.from("reviews").select("user_id").in("user_id", userIds),
    ]);

    services.data?.forEach(s => (init(s.owner_id), newStats[s.owner_id].services_count++));
    bookings.data?.forEach(b => (init(b.user_id), newStats[b.user_id].bookings_count++));
    sReviews.data?.forEach(r => (init(r.user_id), newStats[r.user_id].service_reviews_count++));
    lReviews.data?.forEach(r => (init(r.user_id), newStats[r.user_id].location_reviews_count++));
    setStats(newStats);
  }

  async function updateRole(id: string, role: string) {
    const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
    if (!error) fetchUsers();
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("profiles").update({ status }).eq("id", id);
    if (!error) fetchUsers();
  }

  return { users, stats, summary, chartData, lineData, loading, updateRole, updateStatus };
}
