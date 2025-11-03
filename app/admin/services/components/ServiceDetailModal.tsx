"use client";

import { useEffect, useState } from "react";
import { Service } from "../types";
import { uploadImagesToBucket } from "../helpers";
import { supabase } from "@/lib/supabase";
import ImageEditorModal from "./ImageEditorModal";
import TourDetailEditor from "./TourDetailEditor";

type Props = {
  open: boolean;
  service: Service | null;
  onClose: () => void;
  onUpdate?: (updatedService: Service) => void;
};

type TourDetail = {
  destination: string;
  duration_days: number;
  start_date: string;
  end_date: string;
  available_slots: number;
  guide_name: string | null;
  itinerary: Record<string, string> | null;
};

export default function ServiceDetailModal({ open, service, onClose, onUpdate }: Props) {
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [showTourEditor, setShowTourEditor] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [tourDetail, setTourDetail] = useState<TourDetail | null>(null);
  const [loadingTour, setLoadingTour] = useState(false);

  // Sync existing images khi mở modal
  useEffect(() => {
    if (service?.images) {
      setExistingImages(service.images);
    }
  }, [service?.images]);

  // Fetch tour details nếu service type là tour
  useEffect(() => {
    const fetchTourDetails = async () => {
      if (service?.type === "tour" && service?.id && open) {
        setLoadingTour(true);
        try {
          const { data, error } = await supabase
            .from("tours")
            .select("*")
            .eq("id", service.id)
            .maybeSingle();

          if (!error && data) {
            setTourDetail(data);
          } else {
            setTourDetail(null);
          }
        } catch (err) {
          console.error("Error fetching tour:", err);
          setTourDetail(null);
        } finally {
          setLoadingTour(false);
        }
      }
    };

    fetchTourDetails();
  }, [service?.id, service?.type, open]);

  if (!open || !service) return null;

  /* ========== HELPER FUNCTIONS ========== */
  const formatCurrencyVND = (value?: string | null) => {
    if (!value) return "—";
    const numMatch = value.match(/[\d,]+/);
    if (!numMatch) return value;
    const num = parseInt(numMatch[0].replace(/,/g, ''));
    if (isNaN(num)) return value;
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

  const getStatusColor = (status?: string | null) => {
    switch (status) {
      case "active": return "text-green-400";
      case "inactive": return "text-yellow-400";
      case "archived": return "text-gray-400";
      default: return "text-gray-400";
    }
  };

  const getTypeLabel = (type?: string | null) => {
    const typeMap: Record<string, string> = {
      "stay": "Lưu trú",
      "car": "Thuê xe",
      "motorbike": "Thuê xe máy",
      "tour": "Tour du lịch",
      "trekking": "Trekking"
    };
    return typeMap[type || ""] || type || "—";
  };

  /* ========== SAVE IMAGES ========== */
  const handleSaveImages = async ({
    avatarFile,
    additionalFiles,
    existingImages: newExistingImages,
  }: {
    avatarFile: File | null;
    additionalFiles: File[];
    existingImages: string[];
  }) => {
    if (!service?.id) throw new Error("Không có ID dịch vụ");

    let newImageUrl = service.image_url;
    let newImages = [...newExistingImages];

    if (avatarFile) {
      const urls = await uploadImagesToBucket([avatarFile], "services_images");
      newImageUrl = urls[0] || null;
    }

    if (additionalFiles.length > 0) {
      const urls = await uploadImagesToBucket(additionalFiles, "services_images");
      newImages = [...newImages, ...urls];
    }

    const { error: dbError } = await supabase
      .from("services")
      .update({
        image_url: newImageUrl,
        images: newImages,
        updated_at: new Date().toISOString(),
      })
      .eq("id", service.id);

    if (dbError) throw dbError;

    const updatedService = { ...service, image_url: newImageUrl, images: newImages };
    onUpdate?.(updatedService);
    setExistingImages(newImages);

    alert("Đã cập nhật ảnh thành công!");
  };

  /* ========== SAVE TOUR DETAILS ========== */
  const handleTourSaved = async () => {
    // Re-fetch tour details after save
    if (service?.id) {
      const { data } = await supabase
        .from("tours")
        .select("*")
        .eq("id", service.id)
        .maybeSingle();

      if (data) {
        setTourDetail(data);
      }
    }
  };

  /* ========== RENDER ========== */
  return (
    <>
      {/* === MODAL CHI TIẾT DỊCH VỤ === */}
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4 py-8">
        <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white w-full max-w-4xl rounded-3xl shadow-2xl border border-neutral-700 max-h-[95vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-700 p-6 rounded-t-3xl z-10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {service.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span className={getStatusColor(service.status)}>
                      {service.status === "active" ? "Hoạt động" : 
                       service.status === "inactive" ? "Tạm dừng" : 
                       service.status === "archived" ? "Lưu trữ" : service.status}
                    </span>
                  </span>
                  <span>•</span>
                  <span>{getTypeLabel(service.type)}</span>
                  <span>•</span>
                  <span>ID: {service.id.slice(0, 8)}...</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Nút Tour Editor - Chỉ hiện với type="tour" */}
                {service.type === "tour" && (
                  <button
                    onClick={() => setShowTourEditor(true)}
                    disabled={loadingTour}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 rounded-lg text-sm font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingTour ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang tải...
                      </span>
                    ) : tourDetail ? (
                      "Sửa thông tin tour"
                    ) : (
                      "Thêm thông tin tour"
                    )}
                  </button>
                )}
                <button
                  onClick={() => setShowImageEditor(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-sm font-medium text-white transition"
                >
                  Chỉnh sửa ảnh
                </button>
                <button 
                  onClick={onClose} 
                  className="text-gray-400 hover:text-white text-2xl transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Service Overview */}
            <div className="bg-neutral-800/50 rounded-2xl p-6 border border-neutral-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="mr-2">📋 Tổng Quan Dịch Vụ</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wide mb-1">Loại dịch vụ</span>
                    <p className="text-white font-medium">{getTypeLabel(service.type)}</p>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wide mb-1">Địa điểm</span>
                    <p className="text-white">{service.location || "—"}</p>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wide mb-1">Giá dịch vụ</span>
                    <p className="text-white font-semibold text-lg">{formatCurrencyVND(service.price)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wide mb-1">Đánh giá trung bình</span>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400 text-xl">⭐</span>
                      <span className="text-white font-semibold text-lg">{service.average_rating || "0.0"}</span>
                      <span className="text-gray-400 text-sm">({service.reviews_count || 0} đánh giá)</span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wide mb-1">Số lượt đánh giá</span>
                    <p className="text-white">{service.reviews_count || 0}</p>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wide mb-1">Ngày tạo</span>
                    <p className="text-white">{formatDate(service.created_at)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wide mb-1">Trạng thái</span>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      service.status === "active" ? "bg-green-500/20 text-green-400" :
                      service.status === "inactive" ? "bg-yellow-500/20 text-yellow-400" :
                      service.status === "archived" ? "bg-gray-500/20 text-gray-400" :
                      "bg-gray-500/20 text-gray-400"
                    }`}>
                      {service.status === "active" ? "Hoạt động" : 
                       service.status === "inactive" ? "Tạm dừng" : 
                       service.status === "archived" ? "Lưu trữ" : service.status || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wide mb-1">Ngày duyệt</span>
                    <p className="text-white">{formatDate(service.approved_at)}</p>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wide mb-1">Duyệt bởi</span>
                    <p className="text-white">{service.approved_by ? "Admin" : "—"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tour Details Section - Chỉ hiện nếu type="tour" */}
            {service.type === "tour" && (
              <div className="bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-2xl p-6 border border-green-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="mr-2">🗺️ Thông Tin Tour</span>
                </h3>
                
                {loadingTour ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3 text-gray-400">
                      <div className="w-6 h-6 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin" />
                      <span>Đang tải thông tin tour...</span>
                    </div>
                  </div>
                ) : tourDetail ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <span className="block text-xs text-gray-400 uppercase tracking-wide mb-1">Điểm đến</span>
                        <p className="text-white font-medium">{tourDetail.destination}</p>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-400 uppercase tracking-wide mb-1">Thời lượng</span>
                        <p className="text-white font-medium">{tourDetail.duration_days} ngày</p>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-400 uppercase tracking-wide mb-1">Khởi hành</span>
                        <p className="text-white">{formatDateOnly(tourDetail.start_date)}</p>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-400 uppercase tracking-wide mb-1">Kết thúc</span>
                        <p className="text-white">{formatDateOnly(tourDetail.end_date)}</p>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-400 uppercase tracking-wide mb-1">Chỗ trống</span>
                        <p className="text-white font-semibold text-lg text-green-400">{tourDetail.available_slots} chỗ</p>
                      </div>
                      {tourDetail.guide_name && (
                        <div>
                          <span className="block text-xs text-gray-400 uppercase tracking-wide mb-1">Hướng dẫn viên</span>
                          <p className="text-white">{tourDetail.guide_name}</p>
                        </div>
                      )}
                    </div>

                    {/* Itinerary */}
                    {tourDetail.itinerary && Object.keys(tourDetail.itinerary).length > 0 && (
                      <div className="mt-6 pt-6 border-t border-neutral-700">
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <span>📅</span>
                          <span>Lịch trình chi tiết</span>
                        </h4>
                        <div className="space-y-3">
                          {Object.entries(tourDetail.itinerary).map(([day, content], index) => (
                            <div key={day} className="flex gap-3 bg-neutral-800/50 rounded-xl p-4">
                              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium capitalize text-gray-300 mb-1">
                                  {day.replace(/_/g, " ").replace(/day/i, "Ngày")}
                                </p>
                                <p className="text-gray-400 text-sm leading-relaxed">{String(content)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p className="mb-4">Chưa có thông tin tour chi tiết</p>
                    <button
                      onClick={() => setShowTourEditor(true)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition"
                    >
                      Thêm thông tin tour
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Owner Information */}
            <div className="bg-neutral-800/50 rounded-2xl p-6 border border-neutral-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="mr-2">👤 Thông Tin Chủ Sở Hữu</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wide mb-1">Tên chủ sở hữu</span>
                    <p className="text-white font-medium">{service.owner_name || "—"}</p>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wide mb-1">Số điện thoại</span>
                    <p className="text-white">{service.phone || "—"}</p>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wide mb-1">Email</span>
                    <p className="text-white">{service.email || "—"}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wide mb-1">Facebook</span>
                    <p className="text-white">{service.facebook || "—"}</p>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wide mb-1">Zalo</span>
                    <p className="text-white">{service.zalo || "—"}</p>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wide mb-1">TikTok</span>
                    <p className="text-white">{service.tiktok || "—"}</p>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wide mb-1">Instagram</span>
                    <p className="text-white">{service.instagram || "—"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            {service.amenities && Array.isArray(service.amenities) && service.amenities.length > 0 && (
              <div className="bg-neutral-800/50 rounded-2xl p-6 border border-neutral-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="mr-2">✨ Tiện Nghi</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {service.amenities.map((amenity, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                    >
                      {typeof amenity === 'string' ? amenity : amenity.name || amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Images */}
            {existingImages.length > 0 && (
              <div className="bg-neutral-800/50 rounded-2xl p-6 border border-neutral-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="mr-2">🖼️ Hình Ảnh Dịch Vụ</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {existingImages.map((img, i) => (
                    <div key={i} className="group relative overflow-hidden rounded-xl border border-neutral-600">
                      <img 
                        src={img} 
                        alt={`${service.title} - ${i + 1}`}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {service.description && (
              <div className="bg-neutral-800/50 rounded-2xl p-6 border border-neutral-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="mr-2">📝 Mô Tả Dịch Vụ</span>
                </h3>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {service.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Editor Modal */}
      <ImageEditorModal
        open={showImageEditor}
        initialAvatarUrl={service.image_url}
        initialImages={service.images || []}
        onClose={() => setShowImageEditor(false)}
        onSave={handleSaveImages}
        maxAdditionalImages={9}
        maxFileSizeMB={5}
      />

      {/* Tour Detail Editor Modal */}
      {service.type === "tour" && (
        <TourDetailEditor
          open={showTourEditor}
          serviceId={service.id}
          existingTour={tourDetail}
          onClose={() => setShowTourEditor(false)}
          onSave={handleTourSaved}
        />
      )}
    </>
  );
}