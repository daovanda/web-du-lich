"use client";

import { useState, useMemo } from "react";
import { Service } from "../types";
import { formatAmenities } from "../helpers";
import { fetchServiceDetail, useServicesDetailStatus } from "../hooks/useServiceDetails";
import StayDetailEditor from "./StayDetailEditor";
import CarDetailEditor from "./CarDetailEditor";
import MotorbikeDetailEditor from "./MotorbikeDetailEditor";
import TourDetailEditor from "./TourDetailEditor";

type OfficialTableProps = {
  services: Service[];
  loading: boolean;
  onToggleStatus: (svc: Service, newStatus: string) => Promise<void> | void;
  onDetail: (svc: Service) => void;
  onRefresh?: () => void;
};

export default function OfficialTable({
  services,
  loading,
  onToggleStatus,
  onDetail,
  onRefresh,
}: OfficialTableProps) {
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Editor states
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorType, setEditorType] = useState<"stay" | "car" | "motorbike" | "tour" | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Check which services have detail data
  const { detailStatus, loading: statusLoading } = useServicesDetailStatus(services);

  // Helper: thời gian tạo
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    if (diff < 1) return "Vừa xong";
    if (diff < 24) return `${Math.floor(diff)}h`;
    return `${Math.floor(diff / 24)}d`;
  };

  const getStatusColor = (status?: string | null) => {
    switch (status) {
      case "active":
        return "text-green-400";
      case "inactive":
        return "text-yellow-400";
      case "archived":
        return "text-gray-500";
      default:
        return "text-gray-400";
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

  // Open appropriate editor based on service type
  const handleOpenEditor = async (svc: Service, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!["stay", "car", "motorbike", "tour"].includes(svc.type)) {
      alert(`Editor cho loại "${svc.type}" chưa được hỗ trợ`);
      return;
    }

    setSelectedService(svc);
    setEditorType(svc.type as "stay" | "car" | "motorbike" | "tour");
    setLoadingDetail(true);
    
    // Fetch detail data using the service function
    const data = await fetchServiceDetail(svc.id, svc.type as "stay" | "car" | "motorbike" | "tour");
    setDetailData(data);
    setLoadingDetail(false);
    setEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setEditorOpen(false);
    setEditorType(null);
    setSelectedService(null);
    setDetailData(null);
  };

  const handleSaveEditor = () => {
    // Refresh data if callback provided
    if (onRefresh) {
      onRefresh();
    }
    handleCloseEditor();
  };

  // Filter services
  const filteredServices = useMemo(() => {
    return services.filter((svc) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        !search ||
        svc.title.toLowerCase().includes(search) ||
        svc.location?.toLowerCase().includes(search) ||
        svc.owner_name?.toLowerCase().includes(search) ||
        svc.tags?.some((tag) => tag.toLowerCase().includes(search));

      const matchesStatus = statusFilter === "all" || svc.status === statusFilter;
      const matchesType = typeFilter === "all" || svc.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [services, searchTerm, statusFilter, typeFilter]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Official Services</h2>
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
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">📋</span>
          Official Services
          <span className="text-sm font-normal text-gray-400">({filteredServices.length})</span>
        </h2>
        {statusLoading && (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            Kiểm tra...
          </span>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo tên, địa điểm, chủ sở hữu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-white text-sm placeholder-gray-500 focus:border-blue-500 focus:bg-gray-900 outline-none transition-all"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Status */}
        {["all", "active", "inactive", "archived"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === status
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            {status === "all" ? "Tất cả" : status}
          </button>
        ))}

        <div className="w-px h-6 bg-gray-800"></div>

        {/* Type */}
        {["all", "stay", "car", "motorbike", "tour"].map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              typeFilter === type
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            {type === "all" ? "Tất cả loại" : getTypeIcon(type)}
          </button>
        ))}
      </div>

      {/* Services List - Compact Design */}
      {filteredServices.length > 0 ? (
        <div className="space-y-2">
          {filteredServices.map((svc) => {
            const isLoading = actionLoading[svc.id];
            const hasDetail = detailStatus[svc.id] || false;
            
            return (
              <div
                key={svc.id}
                onClick={() => onDetail(svc)}
                className="group bg-gradient-to-br from-gray-900/80 to-gray-900/50 border border-gray-800 rounded-xl p-3 hover:border-gray-700 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar - Smaller */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-800 ring-2 ring-gray-700 group-hover:ring-blue-500 transition-all">
                      {svc.image_url ? (
                        <img
                          src={svc.image_url}
                          alt={svc.title}
                          className="w-full h-full object-cover"
                        />
                      ) : svc.images?.length ? (
                        <img
                          src={svc.images[0]}
                          alt={svc.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-xl">
                          {getTypeIcon(svc.type)}
                        </div>
                      )}
                    </div>
                    
                    {/* Status indicator dot */}
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900 ${
                      svc.status === 'active' ? 'bg-green-500' : 
                      svc.status === 'inactive' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}></div>
                    
                    {/* Warning dot for missing details */}
                    {!hasDetail && !statusLoading && (
                      <div 
                        className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-900 animate-pulse"
                        title="Chưa có thông tin chi tiết"
                      />
                    )}
                  </div>

                  {/* Content - Compact */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-white text-sm truncate group-hover:text-blue-400 transition-colors">
                        {svc.title}
                      </h3>
                      {!hasDetail && !statusLoading && (
                        <span 
                          className="text-red-400 text-xs flex-shrink-0"
                          title="Chưa có thông tin chi tiết"
                        >
                          ⚠️
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        {getTypeIcon(svc.type)}
                        <span className="capitalize">{svc.type}</span>
                      </span>
                      {svc.location && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[120px]">{svc.location}</span>
                        </>
                      )}
                      {svc.price && (
                        <>
                          <span>•</span>
                          <span className="text-green-400 font-medium">{svc.price}</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="text-gray-500">{formatDate(svc.created_at)}</span>
                    </div>
                  </div>

                  {/* Actions - Compact */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 flex-shrink-0"
                  >
                    {/* Rating */}
                    <div className="px-2 py-1 bg-gray-800/50 rounded-lg flex items-center gap-1">
                      <span className="text-yellow-400 text-xs">⭐</span>
                      <span className="text-white text-xs font-semibold">
                        {svc.average_rating?.toFixed(1) || "0.0"}
                      </span>
                      <span className="text-gray-500 text-xs">
                        ({svc.reviews_count || 0})
                      </span>
                    </div>

                    {/* Edit Button */}
                    <button
                      onClick={(e) => handleOpenEditor(svc, e)}
                      disabled={loadingDetail && selectedService?.id === svc.id}
                      className={`relative px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        hasDetail 
                          ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30" 
                          : "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30 animate-pulse"
                      }`}
                      title={hasDetail ? "Chỉnh sửa chi tiết" : "Thêm thông tin chi tiết"}
                    >
                      {loadingDetail && selectedService?.id === svc.id ? (
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : hasDetail ? (
                        "✏️"
                      ) : (
                        "➕"
                      )}
                    </button>

                    {/* Toggle Status */}
                    <button
                      onClick={() =>
                        handleAction(
                          () =>
                            onToggleStatus(
                              svc,
                              svc.status === "active" ? "inactive" : "active"
                            ),
                          `${svc.id}-toggle`
                        )
                      }
                      disabled={isLoading}
                      className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        svc.status === "active"
                          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                          : "bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                      }`}
                    >
                      {isLoading ? (
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : svc.status === "active" ? (
                        "⏸️"
                      ) : (
                        "▶️"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400 bg-gray-900/30 rounded-xl border border-gray-800">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-sm">Không tìm thấy dịch vụ nào phù hợp.</p>
        </div>
      )}

      {/* Quick Stats - Compact */}
      {services.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-xl border border-gray-800">
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-semibold text-white">{services.filter((s) => s.status === "active").length}</span>
              Active
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="font-semibold text-white">{services.filter((s) => s.status === "inactive").length}</span>
              Inactive
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span className="font-semibold text-white">{services.filter((s) => s.status === "archived").length}</span>
              Archived
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-semibold text-white">{services.filter((s) => !detailStatus[s.id]).length}</span>
              Chưa đủ
            </span>
          </div>
          <span className="text-xs text-gray-400">
            Total: <span className="font-semibold text-white">{services.length}</span>
          </span>
        </div>
      )}

      {/* Editors - Render based on type */}
      {editorOpen && selectedService && (
        <>
          {editorType === "stay" && (
            <StayDetailEditor
              open={editorOpen}
              serviceId={selectedService.id}
              existingStay={detailData}
              onClose={handleCloseEditor}
              onSave={handleSaveEditor}
            />
          )}

          {editorType === "car" && (
            <CarDetailEditor
              open={editorOpen}
              serviceId={selectedService.id}
              existingCar={detailData}
              onClose={handleCloseEditor}
              onSave={handleSaveEditor}
            />
          )}

          {editorType === "motorbike" && (
            <MotorbikeDetailEditor
              open={editorOpen}
              serviceId={selectedService.id}
              existingMotorbike={detailData}
              onClose={handleCloseEditor}
              onSave={handleSaveEditor}
            />
          )}

          {editorType === "tour" && (
            <TourDetailEditor
              open={editorOpen}
              serviceId={selectedService.id}
              existingTour={detailData}
              onClose={handleCloseEditor}
              onSave={handleSaveEditor}
            />
          )}
        </>
      )}
    </div>
  );
}