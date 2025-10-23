"use client";

import { useState } from "react";
import { useUsers } from "./hooks/useUsers";
import { Profile } from "./types";
import SummaryCards from "./components/SummaryCards";
import RolePieChart from "./components/RolePieChart";
import UserLineChart from "./components/UserLineChart";
import UserFilters from "./components/UserFilters";
import UsersTable from "./components/UsersTable";
import UserDetailModal from "./components/UserDetailModal";

export default function AdminUsersPage() {
  const {
    users,
    stats,
    summary,
    chartData,
    lineData,
    loading,
    updateRole,
    updateStatus,
  } = useUsers();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "all" | "user" | "partner" | "admin"
  >("all");
  const [dateFilter, setDateFilter] = useState<"all" | "7d" | "30d">("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "pending" | "banned"
  >("all");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  /* ✅ Lọc người dùng thực sự trước khi gửi xuống bảng */
  const filteredUsers = users.filter((u) => {
    const keyword = search.toLowerCase();

    const matchSearch =
      !keyword ||
      [u.full_name, u.username, u.phone].some((f) =>
        f?.toLowerCase().includes(keyword)
      );

    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;

    const now = new Date();
    let matchDate = true;
    if (dateFilter === "7d") {
      const d = new Date(u.created_at);
      matchDate = (now.getTime() - d.getTime()) / 86400000 <= 7;
    } else if (dateFilter === "30d") {
      const d = new Date(u.created_at);
      matchDate = (now.getTime() - d.getTime()) / 86400000 <= 30;
    }

    return matchSearch && matchRole && matchStatus && matchDate;
  });

  return (
    <div className="bg-black text-gray-100 min-h-screen p-6 space-y-10">
      <h1 className="text-3xl font-bold text-center">Quản lý người dùng</h1>

      {/* Tổng quan */}
      <SummaryCards summary={summary} />

      {/* Biểu đồ */}
      <div className="grid md:grid-cols-2 gap-6">
        <RolePieChart data={chartData} />
        <UserLineChart data={lineData} />
      </div>

      {/* Bộ lọc */}
      <UserFilters
        search={search}
        setSearch={setSearch}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* Bảng người dùng */}
      <UsersTable
        users={filteredUsers} // ✅ truyền danh sách đã lọc
        stats={stats}
        search={search}
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        dateFilter={dateFilter}
        page={page}
        setPage={setPage}
        loading={loading}
        updateRole={updateRole}
        updateStatus={updateStatus}
        openUserDetail={setSelectedUser}
      />

      {/* Modal chi tiết */}
      <UserDetailModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}
