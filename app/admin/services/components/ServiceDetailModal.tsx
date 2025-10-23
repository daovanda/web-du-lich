"use client";

import { useEffect, useState } from "react";
import { Service } from "../types";
import { uploadImagesToBucket } from "../helpers";
import { supabase } from "@/lib/supabase";
import ImageEditorModal from "./ImageEditorModal";

type Props = {
  open: boolean;
  service: Service | null;
  onClose: () => void;
  onUpdate?: (updatedService: Service) => void;
};

export default function ServiceDetailModal({ open, service, onClose, onUpdate }: Props) {
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Sync existing images khi mở modal
  useEffect(() => {
    if (service?.images) {
      setExistingImages(service.images);
    }
  }, [service?.images]);

  if (!open || !service) return null;

  /* ========== HELPER FUNCTIONS (GIỮ NGUYÊN) ========== */
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

  /* ========== SAVE IMAGES (CHUYỂN VÀO ImageEditorModal) ========== */
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

    // Upload ảnh đại diện
    if (avatarFile) {
      const urls = await uploadImagesToBucket([avatarFile], "services_images");
      newImageUrl = urls[0] || null;
    }

    // Upload ảnh phụ
    if (additionalFiles.length > 0) {
      const urls = await uploadImagesToBucket(additionalFiles, "services_images");
      newImages = [...newImages, ...urls];
    }

    // Cập nhật DB
    const { error: dbError } = await supabase
      .from("services")
      .update({
        image_url: newImageUrl,
        images: newImages,
        updated_at: new Date().toISOString(),
      })
      .eq("id", service.id);

    if (dbError) throw dbError;

    // Cập nhật UI
    const updatedService = { ...service, image_url: newImageUrl, images: newImages };
    onUpdate?.(updatedService);

    // Cập nhật state để hiển thị ảnh mới
    setExistingImages(newImages);

    alert("Đã cập nhật ảnh thành công!");
  };

  /* ========== RENDER ========== */
  return (
    <>
      {/* === MODAL CHI TIẾT DỊCH VỤ (GIỮ NGUYÊN 100%) === */}
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4 py-8">
        <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white w-full max-w-4xl rounded-3xl shadow-2xl border border-neutral-700 max-h-[95vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-700 p-6 rounded-t-3xl">
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
                  X
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Service Overview */}
            <div className="bg-neutral-800/50 rounded-2xl p-6 border border-neutral-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="mr-2">Tổng Quan Dịch Vụ</span>
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

            {/* Owner Information */}
            <div className="bg-neutral-800/50 rounded-2xl p-6 border border-neutral-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="mr-2">Thông Tin Chủ Sở Hữu</span>
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
                  <span className="mr-2">Tiện Nghi</span>
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
                  <span className="mr-2">Hình Ảnh Dịch Vụ</span>
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
                  <span className="mr-2">Mô Tả Dịch Vụ</span>
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

      {/* === DÙNG COMPONENT MỚI: ImageEditorModal === */}
      <ImageEditorModal
        open={showImageEditor}
        initialAvatarUrl={service.image_url}
        initialImages={service.images || []}
        onClose={() => setShowImageEditor(false)}
        onSave={handleSaveImages}
        maxAdditionalImages={9}
        maxFileSizeMB={5}
      />
    </>
  );
}