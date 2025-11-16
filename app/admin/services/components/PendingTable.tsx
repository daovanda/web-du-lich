"use client";

import { useState } from "react";
import { PendingService } from "../types";

type PendingTableProps = {
  pendingServices: PendingService[];
  loading: boolean;
  onApprove: (p: PendingService) => void;
  onToggle: (id: string, newStatus: string) => void;
  onDetail: (p: PendingService) => void;
};

export default function PendingTable({
  pendingServices,
  loading,
  onApprove,
  onToggle,
  onDetail,
}: PendingTableProps) {
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Helper functions
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
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "rejected":
        return "text-red-400";
      case "draft":
      default:
        return "text-blue-400";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return { bg: "bg-green-500/20 border-green-500/30", text: "text-green-400", icon: "✓" };
      case "pending":
        return { bg: "bg-yellow-500/20 border-yellow-500/30", text: "text-yellow-400", icon: "⏳" };
      case "rejected":
        return { bg: "bg-red-500/20 border-red-500/30", text: "text-red-400", icon: "✕" };
      case "draft":
      default:
        return { bg: "bg-blue-500/20 border-blue-500/30", text: "text-blue-400", icon: "🆕" };
    }
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case "stay":
        return "🏨";
      case "car":
        return "🚗";
      case "motorbike":
        return "🏍️";
      case "tour":
        return "🗺️";
      default:
        return "📦";
    }
  };

  const handleAction = async (action: () => Promise<void> | void, key: string) => {
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    try {
      await action();
    } catch (error) {
      console.error(`Action ${key} failed:`, error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  // Filter services
  const filteredServices = pendingServices.filter((service) => {
    const matchesSearch =
      !searchTerm ||
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || service.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Pending Services</h2>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-800 rounded w-3/4 mb-2"></div>
                  <div className="h-2 bg-gray-800 rounded w-1/2"></div>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">⏳</span>
          Pending Services
          <span className="text-sm font-normal text-gray-400">({filteredServices.length})</span>
        </h2>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm dịch vụ chờ duyệt..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-white text-sm placeholder-gray-500 focus:border-blue-500 focus:bg-gray-900 outline-none transition-all"
        />
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["all", "draft", "pending", "approved", "rejected"].map((status) => {
          const badge = getStatusBadge(status);
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === status
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                  : `${badge.bg} ${badge.text} border hover:brightness-110`
              }`}
            >
              {status === "all" ? "Tất cả" : (
                <span className="flex items-center gap-1">
                  <span>{badge.icon}</span>
                  <span className="capitalize">{status}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Services List - Compact Design */}
      {filteredServices?.length > 0 ? (
        <div className="space-y-2">
          {filteredServices.map((p) => {
            const isActionLoading = actionLoading[p.id];
            const badge = getStatusBadge(p.status);

            return (
              <div
                key={p.id}
                onClick={() => onDetail(p)}
                className="group bg-gradient-to-br from-gray-900/80 to-gray-900/50 border border-gray-800 rounded-xl p-3 hover:border-gray-700 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar - Smaller */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-800 ring-2 ring-gray-700 group-hover:ring-purple-500 transition-all">
                      {p.images?.[0] ? (
                        <img
                          src={p.image_url || p.images[0]}
                          alt="service"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl text-gray-500">
                          {getTypeIcon(p.type)}
                        </div>
                      )}
                    </div>
                    
                    {/* Status badge on avatar */}
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900 ${
                      p.status === 'approved' ? 'bg-green-500' : 
                      p.status === 'pending' ? 'bg-yellow-500' : 
                      p.status === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
                    }`}></div>
                    
                    {/* New indicator pulse */}
                    {p.status === 'draft' && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
                    )}
                  </div>

                  {/* Content - Compact */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-white text-sm truncate group-hover:text-purple-400 transition-colors">
                        {p.title}
                      </h3>
                      {/* Status badge inline */}
                      <span className={`px-1.5 py-0.5 ${badge.bg} ${badge.text} border rounded text-xs font-semibold flex items-center gap-0.5 flex-shrink-0`}>
                        <span>{badge.icon}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        {getTypeIcon(p.type)}
                        <span className="capitalize">{p.type}</span>
                      </span>
                      {p.location && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[120px]">{p.location}</span>
                        </>
                      )}
                      {p.price && (
                        <>
                          <span>•</span>
                          <span className="text-green-400 font-medium">{p.price}</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="text-gray-500">{formatDate(p.created_at)}</span>
                    </div>
                  </div>

                  {/* Actions - Compact */}
                  <div
                    className="flex items-center gap-1.5 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Approve Button */}
                    <button
                      onClick={() =>
                        handleAction(() => onApprove(p), `${p.id}-approve`)
                      }
                      disabled={isActionLoading}
                      className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {actionLoading[`${p.id}-approve`] ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span className="flex items-center gap-1">
                          <span>✓</span>
                          <span>Approve</span>
                        </span>
                      )}
                    </button>

                    {/* Toggle Button */}
                    <button
                      onClick={() =>
                        handleAction(
                          () =>
                            onToggle(
                              p.id,
                              p.status === "draft" ? "pending" : "draft"
                            ),
                          `${p.id}-toggle`
                        )
                      }
                      disabled={isActionLoading}
                      className="px-2.5 py-1.5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600"
                    >
                      {actionLoading[`${p.id}-toggle`] ? (
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        "🔄"
                      )}
                    </button>

                    {/* View Details Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDetail(p);
                      }}
                      className="px-2.5 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs font-semibold rounded-lg transition-all border border-blue-500/30"
                    >
                      👁️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400 bg-gray-900/30 rounded-xl border border-gray-800">
          <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">
              {searchTerm || statusFilter !== "all" ? "🔍" : "📦"}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {searchTerm || statusFilter !== "all"
              ? "Không tìm thấy dịch vụ"
              : "Chưa có dịch vụ chờ duyệt"}
          </h3>
          <p className="text-gray-500 text-sm">
            {searchTerm || statusFilter !== "all"
              ? "Thử điều chỉnh bộ lọc hoặc tìm kiếm"
              : "Yêu cầu dịch vụ mới sẽ xuất hiện ở đây"}
          </p>
        </div>
      )}

      {/* Quick Stats - Compact */}
      {pendingServices.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-xl border border-gray-800">
          <div className="flex items-center gap-4 text-xs flex-wrap">
            <span className="flex items-center gap-1.5 text-gray-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="font-semibold text-white">{pendingServices.filter((s) => s.status === "draft").length}</span>
              draft
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="font-semibold text-white">{pendingServices.filter((s) => s.status === "pending").length}</span>
              Pending
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-semibold text-white">{pendingServices.filter((s) => s.status === "approved").length}</span>
              approved
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="font-semibold text-white">{pendingServices.filter((s) => s.status === "rejected").length}</span>
              Rejected
            </span>
          </div>
          <span className="text-xs text-gray-400">
            Total: <span className="font-semibold text-white">{pendingServices.length}</span>
          </span>
        </div>
      )}
    </div>
  );
}