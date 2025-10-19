"use client";

import { useState } from "react";
import { SERVICE_TYPES } from "../types";

type PendingFormData = {
  title: string;
  type: string;
  description: string;
  location: string;
  price: string;
  images: string[];
  owner_name: string;
  phone: string;
  email: string;
  facebook: string;
  zalo: string;
  tiktok: string;
  instagram: string;
  amenities: string;
  source: string;
};

type PendingFormProps = {
  onSubmit: (form: PendingFormData, files: File[]) => Promise<void>;
  loading: boolean;
};

export default function PendingForm({ onSubmit, loading }: PendingFormProps) {
  const [form, setForm] = useState<PendingFormData>({
    title: "",
    type: "stay",
    description: "",
    location: "",
    price: "",
    images: [],
    owner_name: "",
    phone: "",
    email: "",
    facebook: "",
    zalo: "",
    tiktok: "",
    instagram: "",
    amenities: "",
    source: "form",
  });

  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.title.trim()) newErrors.title = "Tiêu đề dịch vụ là bắt buộc";
    if (!form.description.trim()) newErrors.description = "Mô tả dịch vụ là bắt buộc";
    if (!form.location.trim()) newErrors.location = "Địa điểm là bắt buộc";
    if (!form.price.trim()) newErrors.price = "Giá dịch vụ là bắt buộc";
    if (!form.owner_name.trim()) newErrors.owner_name = "Tên chủ sở hữu là bắt buộc";
    if (!form.phone.trim()) newErrors.phone = "Số điện thoại là bắt buộc";
    if (!form.email.trim()) newErrors.email = "Email là bắt buộc";
    
    // Validate email format
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    
    // Validate phone format
    if (form.phone && !/^(\+84|0)[0-9]{9}$/.test(form.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ (+84xxxxxxxxx hoặc 0xxxxxxxxx)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    await onSubmit(form, files);
    alert("✅ Dịch vụ đã được thêm vào danh sách chờ duyệt!");

    // Reset form
    setForm({
      title: "",
      type: "stay",
      description: "",
      location: "",
      price: "",
      images: [],
      owner_name: "",
      phone: "",
      email: "",
      facebook: "",
      zalo: "",
      tiktok: "",
      instagram: "",
      amenities: "",
      source: "form",
    });
    setFiles([]);
    setErrors({});
  };

  const removeImage = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 rounded-3xl p-8 border border-neutral-700 shadow-2xl">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          ➕ Thêm Dịch Vụ Mới
        </h3>
        <p className="text-gray-400 text-sm">
          Điền thông tin dịch vụ để chờ admin duyệt
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Information Section */}
        <div className="bg-neutral-800/50 rounded-2xl p-6 border border-neutral-700">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <span className="mr-2">📋</span>
            Thông Tin Cơ Bản
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tên dịch vụ *
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Nhập tên dịch vụ..."
                className={`w-full p-3 bg-neutral-700 rounded-xl text-white placeholder-gray-400 border transition-colors ${
                  errors.title ? 'border-red-500' : 'border-neutral-600 focus:border-purple-500'
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
                className="w-full p-3 bg-neutral-700 rounded-xl text-white border border-neutral-600 focus:border-purple-500 outline-none"
              >
                {SERVICE_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nguồn gửi
              </label>
              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="w-full p-3 bg-neutral-700 rounded-xl text-white border border-neutral-600 focus:border-purple-500 outline-none"
              >
                <option value="form">Form đăng ký</option>
                <option value="referral">Giới thiệu</option>
                <option value="import">Nhập từ hệ thống khác</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mô tả dịch vụ *
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Mô tả chi tiết về dịch vụ..."
                className={`w-full p-3 bg-neutral-700 rounded-xl text-white placeholder-gray-400 border transition-colors h-32 resize-none ${
                  errors.description ? 'border-red-500' : 'border-neutral-600 focus:border-purple-500'
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
                placeholder="Ví dụ: Hà Nội, TP.HCM..."
                className={`w-full p-3 bg-neutral-700 rounded-xl text-white placeholder-gray-400 border transition-colors ${
                  errors.location ? 'border-red-500' : 'border-neutral-600 focus:border-purple-500'
                } outline-none`}
              />
              {errors.location && <p className="text-red-400 text-xs mt-1">{errors.location}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Giá dịch vụ *
              </label>
              <input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Ví dụ: 500,000 VND/ngày"
                className={`w-full p-3 bg-neutral-700 rounded-xl text-white placeholder-gray-400 border transition-colors ${
                  errors.price ? 'border-red-500' : 'border-neutral-600 focus:border-purple-500'
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
                placeholder="Ví dụ: wifi, hồ bơi, gym, parking (cách nhau bằng dấu phẩy)"
                className="w-full p-3 bg-neutral-700 rounded-xl text-white placeholder-gray-400 border border-neutral-600 focus:border-purple-500 outline-none"
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
              onClick={() => document.getElementById("pending-files")?.click()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <span>📷</span>
              Tải lên hình ảnh
            </button>
            
            <input
              id="pending-files"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (!e.target.files) return;
                setFiles(Array.from(e.target.files));
              }}
            />

            {files.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {files.map((file, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`preview-${i}`}
                      className="h-24 w-full object-cover rounded-xl border border-neutral-600"
                    />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Owner Information Section */}
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
                placeholder="Nhập tên đầy đủ..."
                className={`w-full p-3 bg-neutral-700 rounded-xl text-white placeholder-gray-400 border transition-colors ${
                  errors.owner_name ? 'border-red-500' : 'border-neutral-600 focus:border-purple-500'
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
                placeholder="+84xxxxxxxxx hoặc 0xxxxxxxxx"
                className={`w-full p-3 bg-neutral-700 rounded-xl text-white placeholder-gray-400 border transition-colors ${
                  errors.phone ? 'border-red-500' : 'border-neutral-600 focus:border-purple-500'
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
                placeholder="example@email.com"
                className={`w-full p-3 bg-neutral-700 rounded-xl text-white placeholder-gray-400 border transition-colors ${
                  errors.email ? 'border-red-500' : 'border-neutral-600 focus:border-purple-500'
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
                placeholder="https://facebook.com/..."
                className="w-full p-3 bg-neutral-700 rounded-xl text-white placeholder-gray-400 border border-neutral-600 focus:border-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Zalo
              </label>
              <input
                value={form.zalo}
                onChange={(e) => setForm({ ...form, zalo: e.target.value })}
                placeholder="Số điện thoại Zalo"
                className="w-full p-3 bg-neutral-700 rounded-xl text-white placeholder-gray-400 border border-neutral-600 focus:border-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                TikTok
              </label>
              <input
                value={form.tiktok}
                onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
                placeholder="@username hoặc link TikTok"
                className="w-full p-3 bg-neutral-700 rounded-xl text-white placeholder-gray-400 border border-neutral-600 focus:border-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Instagram
              </label>
              <input
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                placeholder="@username hoặc link Instagram"
                className="w-full p-3 bg-neutral-700 rounded-xl text-white placeholder-gray-400 border border-neutral-600 focus:border-purple-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang gửi...
              </span>
            ) : (
              "🚀 Gửi Dịch Vụ Chờ Duyệt"
            )}
          </button>
          
          <p className="text-center text-gray-400 text-sm mt-3">
            Dịch vụ sẽ được admin xem xét và duyệt trong vòng 24-48 giờ
          </p>
        </div>
      </div>
    </div>
  );
}