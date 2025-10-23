"use client";

import { useState } from "react";
import { Profile, UserStats } from "../types";
import UserDetailModal from "./UserDetailModal";

type UsersTableProps = {
  users: Profile[];
  stats: Record<string, UserStats>;
  loading: boolean;
  updateRole: (id: string, role: string) => void;
  updateStatus: (id: string, status: string) => void;
  search: string;
  roleFilter: "all" | "user" | "partner" | "admin";
  statusFilter: "all" | "active" | "pending" | "banned";
  dateFilter: "all" | "7d" | "30d";
  page: number;
  setPage: (page: number) => void;
  openUserDetail: (user: Profile) => void;
};

export default function UsersTable({
  users,
  stats,
  loading,
  updateRole,
  updateStatus,
  search,
  roleFilter,
  statusFilter,
  dateFilter,
  page,
  setPage,
  openUserDetail,
}: UsersTableProps) {
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toLocaleDateString("vi-VN");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-500";
      case "pending":
        return "text-yellow-500";
      case "banned":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Danh sách người dùng</h2>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-black border border-gray-800 rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-800 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Logic lọc người dùng
  const filteredUsers = users.filter((u) => {
    // Lọc theo tìm kiếm
    if (search) {
      const query = search.toLowerCase();
      const fullName = (u.full_name || "").toLowerCase();
      const username = (u.username || "").toLowerCase();
      const phone = (u.phone || "").toLowerCase();
      if (
        !fullName.includes(query) &&
        !username.includes(query) &&
        !phone.includes(query)
      ) {
        return false;
      }
    }

    // Lọc theo vai trò
    if (roleFilter !== "all" && u.role !== roleFilter) {
      return false;
    }

    // Lọc theo trạng thái
    if (statusFilter !== "all" && u.status !== statusFilter) {
      return false;
    }

    // Lọc theo thời gian tạo
    if (dateFilter !== "all" && u.created_at) {
      const created = new Date(u.created_at);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

      if (dateFilter === "7d" && diffDays > 7) return false;
      if (dateFilter === "30d" && diffDays > 30) return false;
    }

    return true;
  });

  // Phân trang (giữ nguyên logic hiện tại, thêm nếu cần)
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(start, end);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Người dùng ({filteredUsers.length})
        </h2>
      </div>

      {/* Danh sách người dùng */}
      {paginatedUsers.length > 0 ? (
        <div className="space-y-3">
          {paginatedUsers.map((u) => (
            <div
              key={u.id}
              onClick={() => openUserDetail(u)}
              className="bg-black border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                {/* Thông tin người dùng */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                    {u.avatar_url ? (
                      <img
                        src={u.avatar_url}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        👤
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white truncate">
                        {u.full_name || "Không tên"}
                      </p>
                      <span className={`text-xs ${getStatusColor(u.status ?? "pending")}`}>
                        ●
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">@{u.username}</p>
                    <p className="text-xs text-gray-500">{u.phone}</p>
                  </div>
                </div>

                {/* Hành động */}
                <div
                  className="flex items-center gap-2 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <select
                    value={u.role}
                    onChange={(e) => updateRole(u.id, e.target.value)}
                    className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-200"
                  >
                    <option value="user">User</option>
                    <option value="partner">Partner</option>
                    <option value="admin">Admin</option>
                  </select>
                  <select
                    value={u.status}
                    onChange={(e) => updateStatus(u.id, e.target.value)}
                    className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-200"
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>
              </div>

              {/* Thống kê nhỏ */}
              <div className="flex gap-4 text-xs text-gray-400 mt-3 flex-wrap">
                <span>📅 {formatDate(u.created_at)}</span>
                <span>🛎 {stats[u.id]?.bookings_count ?? 0} booking</span>
                <span>💬 {stats[u.id]?.service_reviews_count ?? 0} review</span>
                <span>🏠 {stats[u.id]?.services_count ?? 0} dịch vụ</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            🧍
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Không có người dùng</h3>
          <p className="text-gray-400 text-sm">Không tìm thấy người dùng nào.</p>
        </div>
      )}

      {/* Thống kê nhanh */}
      {filteredUsers.length > 0 && (
        <div className="flex items-center justify-between py-4 border-t border-gray-800 text-sm text-gray-400 flex-wrap gap-3">
          <div className="flex items-center gap-6 flex-wrap">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div> Active:
              {filteredUsers.filter((u) => u.status === "active").length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div> Pending:
              {filteredUsers.filter((u) => u.status === "pending").length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div> Banned:
              {filteredUsers.filter((u) => u.status === "banned").length}
            </span>
          </div>
          <div>Tổng: {filteredUsers.length}</div>
        </div>
      )}

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded ${page === i + 1 ? "bg-white text-black" : "bg-gray-800 text-white"}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Modal chi tiết người dùng */}
      {selectedUser && (
        <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}