"use client";

import { useState, useEffect } from "react";
import { PendingService } from "../types";
import { SERVICE_TYPES } from "../types";
import {
  updatePendingService,
  approvePendingAsService,
} from "../api";
import { uploadImagesToBucket } from "../helpers";

type ApproveForm = {
  title: string;
  description: string;
  type: string;
  location: string;
  price: string;
  images: string[];
  amenities: string;
  owner_name: string;
  phone: string;
  email: string;
  facebook: string;
  zalo: string;
  tiktok: string;
  instagram: string;
};

type Props = {
  open: boolean;
  pending: PendingService | null;
  onClose: () => void;
  onApprove: (form: any, files: File[]) => Promise<void>;
  onReject: (reason: string) => void;
  refresh: () => void;
};

export default function ApproveModal({
  open,
  pending,
  onClose,
  onReject,
  refresh,
}: Props) {
  const [form, setForm] = useState<ApproveForm>({
    title: "",
    description: "",
    type: "stay",
    location: "",
    price: "",
    images: [],
    amenities: "",
    owner_name: "",
    phone: "",
    email: "",
    facebook: "",
    zalo: "",
    tiktok: "",
    instagram: "",
  });

  const [files, setFiles] = useState<File[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function amenitiesToString(amenities: any): string {
    if (!amenities) return "";
    if (typeof amenities === "string") return amenities;
    if (Array.isArray(amenities)) {
      if (amenities.length === 0) return "";
      if (typeof amenities[0] === "string") return amenities.join(", ");
      if (amenities[0]?.name) return amenities.map((a) => a.name).join(", ");
    }
    return "";
  }

  useEffect(() => {
    if (pending) {
      setForm({
        title: pending.title || "",
        description: pending.description || "",
        type: pending.type || "stay",
        location: pending.location || "",
        price: pending.price || "",
        images: Array.isArray(pending.images)
          ? pending.images
          : typeof pending.images === "string"
          ? [pending.images]
          : [],
        amenities: amenitiesToString((pending as any).amenities),
        owner_name: pending.owner_name || "",
        phone: pending.phone || "",
        email: pending.email || "",
        facebook: pending.facebook || "",
        zalo: pending.zalo || "",
        tiktok: pending.tiktok || "",
        instagram: pending.instagram || "",
      });
      setFiles([]);
      setNewFiles([]);
      setErrors({});
    }
  }, [pending]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.title.trim()) newErrors.title = "Tiêu đề là bắt buộc";
    if (!form.description.trim()) newErrors.description = "Mô tả là bắt buộc";
    if (!form.location.trim()) newErrors.location = "Địa điểm là bắt buộc";
    if (!form.price.trim()) newErrors.price = "Giá là bắt buộc";
    if (!form.owner_name.trim()) newErrors.owner_name = "Tên chủ sở hữu là bắt buộc";
    if (!form.phone.trim()) newErrors.phone = "Số điện thoại là bắt buộc";
    if (!form.email.trim()) newErrors.email = "Email là bắt buộc";
    
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    
    if (form.phone && !/^(\+84|0)[0-9]{9}$/.test(form.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (!open || !pending) return null;

  const handleSaveChanges = async () => {
    if (!pending?.id) return;
    
    if (!validateForm()) {
      alert("Vui lòng kiểm tra lại các trường bắt buộc");
      return;
    }
    
    setSaving(true);
    try {
      let newImageUrls: string[] = [];
      if (newFiles.length > 0) {
        newImageUrls = await uploadImagesToBucket(newFiles, "pending_services_images");
      }

      const allImages = [...form.images, ...newImageUrls];

      await updatePendingService(pending.id, {
        title: form.title,
        description: form.description,
        type: form.type,
        location: form.location,
        price: form.price,
        images: allImages,
        amenities: form.amenities,
        owner_name: form.owner_name,
        phone: form.phone,
        email: form.email,
        facebook: form.facebook,
        zalo: form.zalo,
        tiktok: form.tiktok,
        instagram: form.instagram,
      } as any);

      alert("✅ Đã lưu thay đổi thành công!");
      refresh();
      setNewFiles([]);
    } catch (err: any) {
      console.error(err);
      alert("❌ Lỗi khi lưu: " + (err?.message ?? err));
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!validateForm()) {
      alert("Vui lòng kiểm tra lại các trường bắt buộc trước khi duyệt");
      return;
    }
    
    try {
      await approvePendingAsService(pending, form, files);
      alert("✅ Đã duyệt và chuyển sang dịch vụ!");
      refresh();
      onClose();
    } catch (err: any) {
      console.error(err);
      alert("❌ Lỗi khi duyệt: " + (err?.message ?? err));
    }
  };

  const handleRemoveImage = (imgUrl: string) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((i) => i !== imgUrl),
    }));
  };

  const removeNewImage = (index: number) => {
    setNewFiles(newFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-8">
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white rounded-3xl w-full max-w-4xl max-h-[95vh] overflow-y-auto border border-neutral-700 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-700 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                🔍 Duyệt Dịch Vụ
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                ID: {pending.id} | Trạng thái: {pending.status}
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-white text-2xl transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Service Information */}
          <div className="bg-neutral-800/50 rounded-2xl p-6 border border-neutral-700">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">📋</span>
              Thông Tin Dịch Vụ
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tên dịch vụ *
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={`w-full p-3 bg-neutral-700 rounded-xl text-white border transition-colors ${
                    errors.title ? 'border-red-500' : 'border-neutral-600 focus:border-green-500'
                  } outline-none`}
                />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Loại dịch vụ *
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full p-3 bg-neutral-700 rounded-xl text-white border border-neutral-600 focus:border-green-500 outline-none"
                >
                  {SERVICE_TYPES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nguồn gửi
                </label>
                <input
                  value={(pending as any).source || "form"}
                  disabled
                  className="w-full p-3 bg-neutral-600 rounded-xl text-gray-300 border border-neutral-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mô tả *
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`w-full p-3 bg-neutral-700 rounded-xl text-white border transition-colors h-32 resize-none ${
                    errors.description ? 'border-red-500' : 'border-neutral-600 focus:border-green-500'
                  } outline-none`}
                />
                {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Địa điểm *
                </label>
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className={`w-full p-3 bg-neutral-700 rounded-xl text-white border transition-colors ${
                    errors.location ? 'border-red-500' : 'border-neutral-600 focus:border-green-500'
                  } outline-none`}
                />
                {errors.location && <p className="text-red-400 text-xs mt-1">{errors.location}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Giá *
                </label>
                <input
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className={`w-full p-3 bg-neutral-700 rounded-xl text-white border transition-colors ${
                    errors.price ? 'border-red-500' : 'border-neutral-600 focus:border-green-500'
                  } outline-none`}
                />
                {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tiện nghi
                </label>
                <input
                  value={form.amenities}
                  onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                  placeholder="wifi, pool, gym, parking (cách nhau bằng dấu phẩy)"
                  className="w-full p-3 bg-neutral-700 rounded-xl text-white border border-neutral-600 focus:border-green-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="bg-neutral-800/50 rounded-2xl p-6 border border-neutral-700">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">📷</span>
              Hình Ảnh Dịch Vụ
            </h4>
            
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => document.getElementById("new-images")?.click()}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:opacity-90 transition"
              >
                📷 Thêm hình ảnh
              </button>
              
              <input
                id="new-images"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files && setNewFiles(Array.from(e.target.files))}
              />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Existing Images */}
                {form.images.map((url, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={url}
                      alt={`existing-${i}`}
                      className="h-24 w-full object-cover rounded-xl border border-neutral-600"
                    />
                    <button
                      onClick={() => handleRemoveImage(url)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}

                {/* New Images Preview */}
                {newFiles.map((file, i) => (
                  <div key={`new-${i}`} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`new-${i}`}
                      className="h-24 w-full object-cover rounded-xl border border-neutral-600 opacity-80"
                    />
                    <button
                      onClick={() => removeNewImage(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Owner Information */}
          <div className="bg-neutral-800/50 rounded-2xl p-6 border border-neutral-700">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">👤</span>
              Thông Tin Chủ Sở Hữu
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tên chủ sở hữu *
                </label>
                <input
                  value={form.owner_name}
                  onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
                  className={`w-full p-3 bg-neutral-700 rounded-xl text-white border transition-colors ${
                    errors.owner_name ? 'border-red-500' : 'border-neutral-600 focus:border-green-500'
                  } outline-none`}
                />
                {errors.owner_name && <p className="text-red-400 text-xs mt-1">{errors.owner_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Số điện thoại *
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={`w-full p-3 bg-neutral-700 rounded-xl text-white border transition-colors ${
                    errors.phone ? 'border-red-500' : 'border-neutral-600 focus:border-green-500'
                  } outline-none`}
                />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full p-3 bg-neutral-700 rounded-xl text-white border transition-colors ${
                    errors.email ? 'border-red-500' : 'border-neutral-600 focus:border-green-500'
                  } outline-none`}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Facebook
                </label>
                <input
                  value={form.facebook}
                  onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                  className="w-full p-3 bg-neutral-700 rounded-xl text-white border border-neutral-600 focus:border-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Zalo
                </label>
                <input
                  value={form.zalo}
                  onChange={(e) => setForm({ ...form, zalo: e.target.value })}
                  className="w-full p-3 bg-neutral-700 rounded-xl text-white border border-neutral-600 focus:border-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  TikTok
                </label>
                <input
                  value={form.tiktok}
                  onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
                  className="w-full p-3 bg-neutral-700 rounded-xl text-white border border-neutral-600 focus:border-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Instagram
                </label>
                <input
                  value={form.instagram}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  className="w-full p-3 bg-neutral-700 rounded-xl text-white border border-neutral-600 focus:border-green-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 transition disabled:opacity-50 text-white font-semibold"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang lưu...
                </span>
              ) : (
                "💾 Lưu Thay Đổi"
              )}
            </button>

            <button
              onClick={handleApprove}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 transition text-white font-semibold"
            >
              ✅ Duyệt Dịch Vụ
            </button>

            <button
              onClick={() => {
                const reason = prompt("Lý do từ chối:") || "";
                if (reason) onReject(reason);
              }}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90 transition text-white font-semibold"
            >
              ❌ Từ Chối
            </button>

            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 hover:opacity-90 transition text-white font-semibold"
            >
              🔒 Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}