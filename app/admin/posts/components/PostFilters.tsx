"use client";

import { Search } from "lucide-react";

type Props = {
  search: string;
  setSearch: (v: string) => void;
  statusFilter: "all" | "pending" | "approved" | "rejected";
  setStatusFilter: (v: "all" | "pending" | "approved" | "rejected") => void;
  dateFilter: "all" | "7d" | "30d";
  setDateFilter: (v: "all" | "7d" | "30d") => void;
};

export default function PostFilters({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
}: Props) {
  return (
    <div className="space-y-4">
      {/* Ô tìm kiếm */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm theo tiêu đề, mô tả hoặc tên tác giả..."
          className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:border-gray-600 focus:outline-none"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search className="w-5 h-5" />
        </div>
      </div>

      {/* Bộ lọc trạng thái */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "Tất cả trạng thái" },
          { key: "pending", label: "Đang chờ duyệt" },
          { key: "approved", label: "Đã duyệt" },
          { key: "rejected", label: "Bị từ chối" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setStatusFilter(item.key as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              statusFilter === item.key
                ? "bg-white text-black"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Bộ lọc thời gian */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "Tất cả thời gian" },
          { key: "7d", label: "7 ngày qua" },
          { key: "30d", label: "30 ngày qua" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setDateFilter(item.key as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              dateFilter === item.key
                ? "bg-white text-black"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
