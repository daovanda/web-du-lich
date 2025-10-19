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
      case "confirmed":
        return "text-green-500";
      case "pending":
        return "text-yellow-500";
      case "new":
      default:
        return "text-blue-500";
    }
  };

  const handleAction = async (action: () => Promise<void> | void, key: string) => {
    setActionLoading(prev => ({ ...prev, [key]: true }));
    try {
      await action();
    } catch (error) {
      console.error(`Action ${key} failed:`, error);
    } finally {
      setActionLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // Filter services
  const filteredServices = pendingServices.filter(service => {
    const matchesSearch = !searchTerm || 
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || service.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Pending Services</h2>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-black border border-gray-800 rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-800 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Pending Services ({filteredServices.length})
        </h2>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:border-gray-600 focus:outline-none"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          🔍
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["all", "new", "pending", "confirmed"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              statusFilter === status
                ? "bg-white text-black"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Services List */}
      {filteredServices?.length > 0 ? (
        <div className="space-y-3">
          {filteredServices.map((p) => {
            const isActionLoading = actionLoading[p.id];

            return (
              <div
                key={p.id}
                onClick={() => onDetail(p)}
                className="bg-black border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  {/* Left: Service Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Service Image */}
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt="service"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          📷
                        </div>
                      )}
                    </div>

                    {/* Service Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-white truncate">{p.title}</p>
                        <span className={`text-xs ${getStatusColor(p.status)}`}>
                          ●
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="capitalize">{p.type}</span>
                        {p.location && <span>• {p.location}</span>}
                        <span>• {formatDate(p.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div
                    className="flex items-center gap-2 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Approve Button */}
                    <button
                      onClick={() => handleAction(() => onApprove(p), `${p.id}-approve`)}
                      disabled={isActionLoading}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading[`${p.id}-approve`] ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        "Approve"
                      )}
                    </button>

                    {/* Toggle Button */}
                    <button
                      onClick={() => handleAction(
                        () => onToggle(p.id, p.status === "new" ? "pending" : "new"),
                        `${p.id}-toggle`
                      )}
                      disabled={isActionLoading}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading[`${p.id}-toggle`] ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        "Toggle"
                      )}
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
            📦
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {searchTerm || statusFilter !== "all" 
              ? "No services found" 
              : "No pending services"
            }
          </h3>
          <p className="text-gray-400 text-sm">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filter"
              : "New service requests will appear here"
            }
          </p>
        </div>
      )}

      {/* Quick Stats - Simple Row */}
      {pendingServices.length > 0 && (
        <div className="flex items-center justify-between py-4 border-t border-gray-800">
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              New: {pendingServices.filter(s => s.status === "new").length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              Pending: {pendingServices.filter(s => s.status === "pending").length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Confirmed: {pendingServices.filter(s => s.status === "confirmed").length}
            </span>
          </div>
          <div className="text-sm text-gray-400">
            Total: {pendingServices.length}
          </div>
        </div>
      )}
    </div>
  );
}