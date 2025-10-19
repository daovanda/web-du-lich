"use client";

import { useState } from "react";
import { Service } from "../types";
import { formatAmenities } from "../helpers";

type OfficialTableProps = {
  services: Service[];
  loading: boolean;
  onToggleStatus: (svc: Service, newStatus: string) => void;
  onDetail: (svc: Service) => void;
};

export default function OfficialTable({
  services,
  loading,
  onToggleStatus,
  onDetail,
}: OfficialTableProps) {
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Helper functions
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getStatusColor = (status?: string | null) => {
    if (!status) return "text-gray-400";
    switch (status) {
      case "active":
        return "text-green-500";
      case "inactive":
        return "text-yellow-500";
      case "archived":
        return "text-gray-500";
      default:
        return "text-gray-400";
    }
  };

  const getTypeIcon = (type: string) => {
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
  const filteredServices = services.filter(service => {
    const matchesSearch = !searchTerm || 
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.owner_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || service.status === statusFilter;
    const matchesType = typeFilter === "all" || service.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Official Services</h2>
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
          Official Services ({filteredServices.length})
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

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Status Filter */}
        <div className="flex gap-2">
          {["all", "active", "inactive", "archived"].map((status) => (
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

        {/* Type Filter */}
        <div className="flex gap-2 ml-4">
          {["all", "stay", "car", "motorbike", "tour"].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                typeFilter === type
                  ? "bg-white text-black"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {type === "all" ? "All Types" : getTypeIcon(type) + " " + type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Services List */}
      {filteredServices?.length > 0 ? (
        <div className="space-y-3">
          {filteredServices.map((svc) => {
            const isActionLoading = actionLoading[svc.id];

            return (
              <div
                key={svc.id}
                onClick={() => onDetail(svc)}
                className="bg-black border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  {/* Left: Service Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Service Image */}
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                      {svc.images?.[0] ? (
                        <img
                          src={svc.images[0]}
                          alt={svc.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          {getTypeIcon(svc.type)}
                        </div>
                      )}
                    </div>

                    {/* Service Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-white truncate">{svc.title}</p>
                        <span className={`text-xs ${getStatusColor(svc.status)}`}>
                          ●
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-1">
                        <span className="flex items-center gap-1">
                          {getTypeIcon(svc.type)}
                          <span className="capitalize">{svc.type}</span>
                        </span>
                        {svc.location && <span>• {svc.location}</span>}
                        <span>• {formatDate(svc.created_at)}</span>
                      </div>

                      {/* Amenities */}
                      {svc.amenities && svc.amenities.length > 0 && (
                        <p className="text-xs text-gray-500 truncate">
                          {formatAmenities(svc.amenities)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div
                    className="flex items-center gap-2 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Status Indicator */}
                    <span className={`text-xs ${getStatusColor(svc.status)} font-medium`}>
                      {svc.status?.toUpperCase()}
                    </span>

                    {/* Toggle Button */}
                    <button
                      onClick={() => handleAction(
                        () => onToggleStatus(svc, svc.status === "active" ? "inactive" : "active"),
                        `${svc.id}-toggle`
                      )}
                      disabled={isActionLoading}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        svc.status === "active"
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "bg-green-500 hover:bg-green-600 text-white"
                      }`}
                    >
                      {actionLoading[`${svc.id}-toggle`] ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        svc.status === "active" ? "Deactivate" : "Activate"
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
            📋
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {searchTerm || statusFilter !== "all" || typeFilter !== "all" 
              ? "No services found" 
              : "No official services"
            }
          </h3>
          <p className="text-gray-400 text-sm">
            {searchTerm || statusFilter !== "all" || typeFilter !== "all"
              ? "Try adjusting your search or filter"
              : "Approved services will appear here"
            }
          </p>
        </div>
      )}

      {/* Quick Stats - Simple Row */}
      {services.length > 0 && (
        <div className="flex items-center justify-between py-4 border-t border-gray-800">
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Active: {services.filter(s => s.status === "active").length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              Inactive: {services.filter(s => s.status === "inactive").length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              Archived: {services.filter(s => s.status === "archived").length}
            </span>
          </div>
          <div className="text-sm text-gray-400">
            Total: {services.length}
          </div>
        </div>
      )}
    </div>
  );
}