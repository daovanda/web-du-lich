"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/apiClient";
import { Service } from "../types";
import { uploadImagesToBucket } from "../helpers";
import { useServiceDetail } from "../hooks/useServiceDetails";
import ImageEditorModal from "./ImageEditorModal";
import TourDetailEditor from "../components/TourDetailEditor";
import StayDetailEditor from "../components/StayDetailEditor";
import CarDetailEditor from "../components/CarDetailEditor";
import MotorbikeDetailEditor from "../components/MotorbikeDetailEditor";

type Props = {
  open: boolean;
  service: Service | null;
  onClose: () => void;
  onUpdate?: (updatedService: Service) => void;
};

export default function ServiceDetailModal({ open, service, onClose, onUpdate }: Props) {
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [showTourEditor, setShowTourEditor] = useState(false);
  const [showStayEditor, setShowStayEditor] = useState(false);
  const [showCarEditor, setShowCarEditor] = useState(false);
  const [showMotorbikeEditor, setShowMotorbikeEditor] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Use the hook to fetch service details với refreshKey
  const { data: serviceDetail, loading } = useServiceDetail(
    open ? service?.id || null : null,
    open ? (service?.type as any) || null : null,
    refreshKey
  );

  // Reset state khi modal mở/đóng hoặc service thay đổi
  useEffect(() => {
    if (open && service) {
      setExistingImages(service.images || []);
      setRefreshKey(0);
      setNotification(null);
    } else if (!open) {
      // Reset tất cả state khi đóng modal
      setShowImageEditor(false);
      setShowTourEditor(false);
      setShowStayEditor(false);
      setShowCarEditor(false);
      setShowMotorbikeEditor(false);
    }
  }, [open, service?.id]);

  // Update existingImages khi service.images thay đổi
  useEffect(() => {
    if (service?.images) {
      setExistingImages(service.images);
    }
  }, [service?.images]);

  // Auto hide notification sau 5s
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (!open || !service) return null;

  const formatCurrencyVND = (value?: string | number | null) => {
    if (!value) return "—";
    const num = typeof value === 'string' ? parseInt(value.replace(/[^\d]/g, '')) : value;
    if (isNaN(num)) return value.toString();
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatDateOnly = (dateString?: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getTypeLabel = (type?: string | null) => {
    const typeMap: Record<string, string> = {
      "stay": "Lưu trú",
      "car": "Thuê xe",
      "motorbike": "Thuê xe máy",
      "tour": "Tour du lịch"
    };
    return typeMap[type || ""] || type || "—";
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  };

  const handleSaveImages = async ({
    avatarFile,
    additionalFiles,
    existingImages: newExistingImages,
    removeAvatar,
  }: {
    avatarFile: File | null;
    additionalFiles: File[];
    existingImages: string[];
    removeAvatar?: boolean;
  }) => {
    if (!service?.id) throw new Error("Không có ID dịch vụ");

    const bucketName = "services_images";
    const folderPath = service.id;
    
    console.log(`📁 Upload destination: ${bucketName}/${folderPath}`);
    
    let newImageUrl = service.image_url;
    let newImages = [...newExistingImages];
    
    // Xử lý xóa avatar
    if (removeAvatar) {
      newImageUrl = null;
    }
    
    // Upload avatar mới
    if (avatarFile) {
      const urls = await uploadImagesToBucket([avatarFile], bucketName, folderPath);
      newImageUrl = urls[0] || null;
    }
    
    // Upload ảnh phụ mới
    if (additionalFiles.length > 0) {
      const urls = await uploadImagesToBucket(additionalFiles, bucketName, folderPath);
      newImages = [...newImages, ...urls];
    }
    
    // Cập nhật database qua REST API
    await apiRequest<{ success: boolean }>(`/api/admin/services/${service.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        image_url: newImageUrl,
        images: newImages,
        updated_at: new Date().toISOString(),
      }),
      fallbackMessage: "Không thể cập nhật ảnh dịch vụ",
    });
    
    // Cập nhật local state
    const updatedService = { ...service, image_url: newImageUrl, images: newImages };
    onUpdate?.(updatedService);
    setExistingImages(newImages);
    showNotification('success', "Đã cập nhật ảnh thành công!");
  };

  const handleDetailSaved = () => {
    // Trigger re-fetch by changing key
    setRefreshKey(prev => prev + 1);
    showNotification('success', "Đã lưu thông tin chi tiết thành công!");
  };

  const renderDetailButton = () => {
    const buttonClass = "px-4 py-2 rounded-lg text-sm font-medium text-white transition disabled:opacity-50";
    
    switch (service.type) {
      case "tour":
        return (
          <button
            onClick={() => setShowTourEditor(true)}
            disabled={loading}
            className={`${buttonClass} bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600`}
          >
            {serviceDetail ? "Sửa Tour" : "Thêm Tour"}
          </button>
        );
      
      case "stay":
        return (
          <button
            onClick={() => setShowStayEditor(true)}
            disabled={loading}
            className={`${buttonClass} bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600`}
          >
            {serviceDetail ? "Sửa Chỗ ở" : "Thêm Chỗ ở"}
          </button>
        );
      
      case "car":
        return (
          <button
            onClick={() => setShowCarEditor(true)}
            disabled={loading}
            className={`${buttonClass} bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600`}
          >
            {serviceDetail ? "Sửa Xe" : "Thêm Xe"}
          </button>
        );
      
      case "motorbike":
        return (
          <button
            onClick={() => setShowMotorbikeEditor(true)}
            disabled={loading}
            className={`${buttonClass} bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600`}
          >
            {serviceDetail ? "Sửa Xe máy" : "Thêm Xe máy"}
          </button>
        );
      
      default:
        return null;
    }
  };

  const renderServiceDetails = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-6 h-6 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin" />
            <span>Đang tải thông tin...</span>
          </div>
        </div>
      );
    }

    if (!serviceDetail) {
      return (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
          <div className="text-gray-400 mb-3">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">Chưa có thông tin chi tiết cho dịch vụ này</p>
          </div>
          <p className="text-xs text-gray-500">Nhấn nút <span className="font-semibold">Thêm...</span> ở trên để thêm thông tin</p>
        </div>
      );
    }

    switch (service.type) {
      case "tour":
        return (
          <div className="bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-xl p-5 border border-green-700/50">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <span>🗺️</span>
              <span>Thông Tin Tour</span>
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div>
                <span className="block text-xs text-gray-400 mb-1">Điểm đến</span>
                <p className="text-white font-medium">{serviceDetail.destination}</p>
              </div>
              <div>
                <span className="block text-xs text-gray-400 mb-1">Thời lượng</span>
                <p className="text-white font-medium">{serviceDetail.duration_days} ngày</p>
              </div>
              <div>
                <span className="block text-xs text-gray-400 mb-1">Khởi hành</span>
                <p className="text-white">{formatDateOnly(serviceDetail.start_date)}</p>
              </div>
              <div>
                <span className="block text-xs text-gray-400 mb-1">Kết thúc</span>
                <p className="text-white">{formatDateOnly(serviceDetail.end_date)}</p>
              </div>
              <div>
                <span className="block text-xs text-gray-400 mb-1">Chỗ trống</span>
                <p className="text-green-400 font-semibold">{serviceDetail.available_slots} chỗ</p>
              </div>
              {serviceDetail.guide_name && (
                <div>
                  <span className="block text-xs text-gray-400 mb-1">Hướng dẫn viên</span>
                  <p className="text-white">{serviceDetail.guide_name}</p>
                </div>
              )}
            </div>

            {serviceDetail.itinerary && Object.keys(serviceDetail.itinerary).length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                  <span>📅</span>
                  <span>Lịch trình</span>
                </h4>
                <div className="space-y-2">
                  {Object.entries(serviceDetail.itinerary).map(([day, content], index) => (
                    <div key={day} className="flex gap-2 bg-gray-800/50 rounded-lg p-3">
                      <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-400 text-xs mb-0.5">{day}</p>
                        <p className="text-sm text-gray-300">{String(content)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case "stay":
        return (
          <div className="bg-gradient-to-br from-emerald-900/20 to-blue-900/20 rounded-xl p-5 border border-emerald-700/50">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <span>🏠</span>
              <span>Thông Tin Chỗ ở</span>
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <span className="block text-xs text-gray-400 mb-1">Loại chỗ ở</span>
                <p className="text-white font-medium capitalize">{serviceDetail.accommodation_type.replace('_', ' ')}</p>
              </div>
              <div>
                <span className="block text-xs text-gray-400 mb-1">Số khách tối đa</span>
                <p className="text-white font-medium">{serviceDetail.max_guests} người</p>
              </div>
              <div>
                <span className="block text-xs text-gray-400 mb-1">Số phòng</span>
                <p className="text-white font-medium">{serviceDetail.number_of_rooms} phòng</p>
              </div>
              <div>
                <span className="block text-xs text-gray-400 mb-1">Số giường</span>
                <p className="text-white font-medium">{serviceDetail.number_of_beds} giường</p>
              </div>
              {serviceDetail.price_per_night && (
                <div className="md:col-span-2">
                  <span className="block text-xs text-gray-400 mb-1">Giá mỗi đêm</span>
                  <p className="text-emerald-400 font-semibold text-lg">
                    {formatCurrencyVND(serviceDetail.price_per_night)}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case "car":
        return (
          <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-xl p-5 border border-orange-700/50">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <span>🚗</span>
              <span>Thông Tin Xe</span>
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <span className="block text-xs text-gray-400 mb-1">Tuyến đường</span>
                <p className="text-white font-medium">{serviceDetail.route}</p>
              </div>
              <div>
                <span className="block text-xs text-gray-400 mb-1">Điểm khởi hành</span>
                <p className="text-white">{serviceDetail.departure_location}</p>
                {serviceDetail.departure_time && (
                  <p className="text-orange-400 text-sm mt-1">{serviceDetail.departure_time}</p>
                )}
              </div>
              <div>
                <span className="block text-xs text-gray-400 mb-1">Điểm đến</span>
                <p className="text-white">{serviceDetail.arrival_location}</p>
                {serviceDetail.arrival_time && (
                  <p className="text-orange-400 text-sm mt-1">{serviceDetail.arrival_time}</p>
                )}
              </div>
              <div>
                <span className="block text-xs text-gray-400 mb-1">Thời gian</span>
                <p className="text-white font-medium">
                  {serviceDetail.duration_hours ? `${serviceDetail.duration_hours}h` : "—"}
                </p>
              </div>
              <div>
                <span className="block text-xs text-gray-400 mb-1">Loại xe</span>
                <p className="text-white font-medium capitalize">{serviceDetail.vehicle_type}</p>
              </div>
              <div>
                <span className="block text-xs text-gray-400 mb-1">Số chỗ ngồi</span>
                <p className="text-orange-400 font-semibold">{serviceDetail.seats} chỗ</p>
              </div>
            </div>
          </div>
        );

      case "motorbike":
        return (
          <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-xl p-5 border border-cyan-700/50">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <span>🏍️</span>
              <span>Thông Tin Xe Máy</span>
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <span className="block text-xs text-gray-400 mb-1">Xe</span>
                <p className="text-white font-bold text-lg">
                  {serviceDetail.brand} {serviceDetail.model}
                </p>
              </div>
              <div>
                <span className="block text-xs text-gray-400 mb-1">Loại xe</span>
                <p className="text-white capitalize">{serviceDetail.bike_type}</p>
              </div>
              <div>
                <span className="block text-xs text-gray-400 mb-1">Dung tích</span>
                <p className="text-white font-medium">{serviceDetail.engine_size}cc</p>
              </div>
              <div>
                <span className="block text-xs text-gray-400 mb-1">Năm sản xuất</span>
                <p className="text-white font-medium">{serviceDetail.year}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-gray-900 to-black text-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-800 max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-gray-800">
            <div className="flex-1">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {service.title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className={`px-2 py-1 rounded ${
                  service.status === "active" ? "bg-green-500/20 text-green-400" :
                  service.status === "inactive" ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-gray-500/20 text-gray-400"
                }`}>
                  {service.status === "active" ? "Hoạt động" : 
                   service.status === "inactive" ? "Tạm dừng" : "Lưu trữ"}
                </span>
                <span>•</span>
                <span>{getTypeLabel(service.type)}</span>
                <span>•</span>
                <span>ID: {service.id.slice(0, 8)}...</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {renderDetailButton()}
              <button
                onClick={() => setShowImageEditor(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-sm font-medium transition"
              >
                Ảnh
              </button>
              <button 
                onClick={onClose} 
                className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Notification */}
          {notification && (
            <div className={`mx-5 mt-4 p-3 rounded-lg border flex items-center gap-3 ${
              notification.type === 'success' 
                ? 'bg-green-900/20 border-green-700 text-green-400' 
                : 'bg-red-900/20 border-red-700 text-red-400'
            }`}>
              <span className="text-xl">{notification.type === 'success' ? '✅' : '❌'}</span>
              <p className="flex-1 text-sm">{notification.message}</p>
              <button 
                onClick={() => setNotification(null)}
                className="hover:opacity-70 transition"
              >
                ×
              </button>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Service Overview */}
            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
              <h3 className="text-base font-semibold mb-4">📋 Tổng Quan</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="block text-xs text-gray-400 mb-1">Địa điểm</span>
                  <p className="text-white">{service.location || "—"}</p>
                </div>
                <div>
                  <span className="block text-xs text-gray-400 mb-1">Giá</span>
                  <p className="text-white font-semibold">{formatCurrencyVND(service.price)}</p>
                </div>
                <div>
                  <span className="block text-xs text-gray-400 mb-1">Đánh giá</span>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-white font-semibold">{service.average_rating || "0.0"}</span>
                    <span className="text-gray-400">({service.reviews_count || 0})</span>
                  </div>
                </div>
                <div>
                  <span className="block text-xs text-gray-400 mb-1">Ngày tạo</span>
                  <p className="text-white">{formatDate(service.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Service Specific Details */}
            {renderServiceDetails()}

            {/* Owner Information */}
            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
              <h3 className="text-base font-semibold mb-4">👤 Chủ Sở Hữu</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="block text-xs text-gray-400 mb-1">Tên</span>
                  <p className="text-white">{service.owner_name || "—"}</p>
                </div>
                <div>
                  <span className="block text-xs text-gray-400 mb-1">Điện thoại</span>
                  <p className="text-white">{service.phone || "—"}</p>
                </div>
                <div>
                  <span className="block text-xs text-gray-400 mb-1">Email</span>
                  <p className="text-white">{service.email || "—"}</p>
                </div>
                <div>
                  <span className="block text-xs text-gray-400 mb-1">Facebook</span>
                  <p className="text-white">{service.facebook || "—"}</p>
                </div>
                <div>
                  <span className="block text-xs text-gray-400 mb-1">Zalo</span>
                  <p className="text-white">{service.zalo || "—"}</p>
                </div>
                <div>
                  <span className="block text-xs text-gray-400 mb-1">TikTok</span>
                  <p className="text-white">{service.tiktok || "—"}</p>
                </div>
              </div>
            </div>

            {/* Images */}
            {existingImages.length > 0 && (
              <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                <h3 className="text-base font-semibold mb-4">🖼️ Hình Ảnh</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {existingImages.map((img, i) => (
                    <div key={i} className="group relative overflow-hidden rounded-lg border border-gray-700">
                      <img 
                        src={img} 
                        alt={`${service.title} - ${i + 1}`}
                        className="w-full h-24 object-cover group-hover:scale-105 transition" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {service.description && (
              <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                <h3 className="text-base font-semibold mb-3">📝 Mô Tả</h3>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {service.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ImageEditorModal
        open={showImageEditor}
        initialAvatarUrl={service.image_url}
        initialImages={service.images || []}
        onClose={() => setShowImageEditor(false)}
        onSave={handleSaveImages}
        maxAdditionalImages={9}
        maxFileSizeMB={5}
      />

      {service.type === "tour" && (
        <TourDetailEditor
          open={showTourEditor}
          serviceId={service.id}
          existingTour={serviceDetail}
          onClose={() => setShowTourEditor(false)}
          onSave={handleDetailSaved}
        />
      )}

      {service.type === "stay" && (
        <StayDetailEditor
          open={showStayEditor}
          serviceId={service.id}
          existingStay={serviceDetail}
          onClose={() => setShowStayEditor(false)}
          onSave={handleDetailSaved}
        />
      )}

      {service.type === "car" && (
        <CarDetailEditor
          open={showCarEditor}
          serviceId={service.id}
          existingCar={serviceDetail}
          onClose={() => setShowCarEditor(false)}
          onSave={handleDetailSaved}
        />
      )}

      {service.type === "motorbike" && (
        <MotorbikeDetailEditor
          open={showMotorbikeEditor}
          serviceId={service.id}
          existingMotorbike={serviceDetail}
          onClose={() => setShowMotorbikeEditor(false)}
          onSave={handleDetailSaved}
        />
      )}
    </>
  );
}