"use client";

import { useState } from "react";
import { Post } from "../types";

type PostsTableProps = {
  posts: Post[];
  loading: boolean;
  updateStatus: (id: string, status: string) => void;
  search: string;
  statusFilter: "all" | "pending" | "approved" | "rejected";
  dateFilter: "all" | "7d" | "30d";
  page: number;
  setPage: (page: number) => void;
  openPostDetail: (post: Post) => void;
};

export default function PostsTable({
  posts,
  loading,
  updateStatus,
  search,
  statusFilter,
  dateFilter,
  page,
  setPage,
  openPostDetail,
}: PostsTableProps) {
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    if (diffInHours < 1) return "Vừa xong";
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-500";
      case "pending":
        return "text-yellow-500";
      case "rejected":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  const handleAction = async (id: string, newStatus: string) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await updateStatus(id, newStatus);
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  // --- Lọc bài đăng ---
  const filteredPosts = posts.filter((p) => {
    if (search) {
      const query = search.toLowerCase();
      const caption = (p.caption || "").toLowerCase();
      const author = (p.author_name || "").toLowerCase();
      const service = (p.service_title || "").toLowerCase();
      if (!caption.includes(query) && !author.includes(query) && !service.includes(query)) {
        return false;
      }
    }
    if (statusFilter !== "all" && p.status !== statusFilter) return false;

    if (dateFilter !== "all" && p.created_at) {
      const created = new Date(p.created_at);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      if (dateFilter === "7d" && diffDays > 7) return false;
      if (dateFilter === "30d" && diffDays > 30) return false;
    }
    return true;
  });

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(start, end);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Danh sách bài đăng</h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-black border border-gray-800 rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gray-800 rounded-lg"></div>
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Danh sách bài đăng ({filteredPosts.length})
        </h2>
      </div>

      {paginatedPosts.length > 0 ? (
        <div className="space-y-3">
          {paginatedPosts.map((p) => {
            const isLoading = actionLoading[p.id];
            return (
              <div
                key={p.id}
                onClick={() => openPostDetail(p)}
                className="bg-black border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  {/* Trái: Thông tin bài đăng */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                      {p.image_urls?.[0] ? (
                        <img
                          src={p.image_urls[0]}
                          alt="post"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          🖼
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-white truncate">
                          {p.service_title || "Không có tiêu đề"}
                        </p>
                        <span className={`text-xs ${getStatusColor(p.status ?? "pending")}`}>
                          ●
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-1">
                        {p.caption || "Không có mô tả"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        👤 {p.author_name || "Người dùng ẩn danh"} • {formatDate(p.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Phải: Hành động */}
                  <div
                    className="flex items-center gap-2 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleAction(p.id, "approved")}
                      disabled={isLoading}
                      className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded-lg text-sm text-white disabled:opacity-50"
                    >
                      {isLoading ? "..." : "Duyệt"}
                    </button>
                    <button
                      onClick={() => handleAction(p.id, "rejected")}
                      disabled={isLoading}
                      className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded-lg text-sm text-white disabled:opacity-50"
                    >
                      {isLoading ? "..." : "Từ chối"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            📰
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Không có bài đăng</h3>
          <p className="text-gray-400 text-sm">Không tìm thấy bài đăng nào.</p>
        </div>
      )}

      {/* Hàng thống kê nhanh */}
      {filteredPosts.length > 0 && (
        <div className="flex items-center justify-between py-4 border-t border-gray-800 text-sm text-gray-400 flex-wrap gap-3">
          <div className="flex items-center gap-6 flex-wrap">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Approved: {filteredPosts.filter((p) => p.status === "approved").length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              Pending: {filteredPosts.filter((p) => p.status === "pending").length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Rejected: {filteredPosts.filter((p) => p.status === "rejected").length}
            </span>
          </div>
          <div>Tổng: {filteredPosts.length}</div>
        </div>
      )}
    </div>
  );
}
