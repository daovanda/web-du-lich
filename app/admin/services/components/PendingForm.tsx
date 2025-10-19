"use client";

import { useState } from "react";
import { PENDING_SERVICE_TYPES, SERVICE_SOURCES } from "../types";

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
  onSubmit: (form: PendingFormData, avatarFile: File | null, additionalFiles: File[]) => Promise<void>;
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

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Helper functions
  const validatePhone = (phone: string) => {
    const cleanPhone = phone.replace(/\s/g, '');
    const phoneRegex = /^(\+84|84|0)[0-9]{9,10}$/;
    return phoneRegex.test(cleanPhone);
  };

  const validateFiles = (files: File[]) => {
    const maxFiles = 10;
    const maxSize = 5 * 1024 * 1024; // 5MB per file
    
    if (files.length > maxFiles) {
      return `Tối đa ${maxFiles} hình ảnh`;
    }
    
    for (const file of files) {
      if (file.size > maxSize) {
        return `File "${file.name}" quá lớn (tối đa 5MB)`;
      }
      if (!file.type.startsWith('image/')) {
        return `File "${file.name}" không phải hình ảnh hợp lệ`;
      }
    }
    
    return null;
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('84')) {
      return '+' + cleaned;
    } else if (cleaned.startsWith('0')) {
      return '+84' + cleaned.slice(1);
    }
    return phone;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.title.trim()) newErrors.title = "Tiêu đề dịch vụ là bắt buộc";
    if (form.title.trim().length < 3) newErrors.title = "Tiêu đề phải có ít nhất 3 ký tự";
    if (form.title.trim().length > 200) newErrors.title = "Tiêu đề không được quá 200 ký tự";
    
    if (!form.description.trim()) newErrors.description = "Mô tả dịch vụ là bắt buộc";
    if (form.description.trim().length < 10) newErrors.description = "Mô tả phải có ít nhất 10 ký tự";
    if (form.description.trim().length > 1000) newErrors.description = "Mô tả không được quá 1000 ký tự";
    
    if (!form.location.trim()) newErrors.location = "Địa điểm là bắt buộc";
    if (!form.price.trim()) newErrors.price = "Giá dịch vụ là bắt buộc";
    
    if (!form.owner_name.trim()) newErrors.owner_name = "Tên chủ sở hữu là bắt buộc";
    if (form.owner_name.trim().length < 2) newErrors.owner_name = "Tên chủ sở hữu phải có ít nhất 2 ký tự";
    
    if (!form.phone.trim()) newErrors.phone = "Số điện thoại là bắt buộc";
    if (form.phone && !validatePhone(form.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ (ví dụ: +84123456789, 0123456789)";
    }
    
    if (!form.email.trim()) newErrors.email = "Email là bắt buộc";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // File validation
    const allFiles = [...(avatarFile ? [avatarFile] : []), ...additionalFiles];
    const fileError = validateFiles(allFiles);
    if (fileError) {
      newErrors.files = fileError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileError = validateFiles([file]);
    
    if (fileError) {
      setErrors({ ...errors, files: fileError });
      return;
    }
    
    setAvatarFile(file);
    setErrors({ ...errors, files: "" });
  };

  const handleAdditionalFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const newFiles = Array.from(e.target.files);
    const fileError = validateFiles(newFiles);
    
    if (fileError) {
      setErrors({ ...errors, files: fileError });
      return;
    }
    
    setAdditionalFiles(newFiles);
    setErrors({ ...errors, files: "" });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      await onSubmit(form, avatarFile, additionalFiles);
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
      setAvatarFile(null);
      setAdditionalFiles([]);
      setErrors({});
    } catch (error) {
      console.error('Submit error:', error);
      alert("❌ Có lỗi xảy ra khi gửi dịch vụ. Vui lòng thử lại!");
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    if (errors.files) {
      setErrors({ ...errors, files: "" });
    }
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalFiles(additionalFiles.filter((_, i) => i !== index));
    if (errors.files) {
      setErrors({ ...errors, files: "" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-black border border-gray-800 rounded-2xl p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Thêm Dịch Vụ Mới</h2>
        <p className="text-gray-400 text-sm">Điền thông tin để chờ admin duyệt</p>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">Thông Tin Cơ Bản</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tên dịch vụ *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Nhập tên dịch vụ..."
              maxLength={200}
              className={`w-full p-3 bg-gray-900 border rounded-lg text-white placeholder-gray-500 transition-colors ${
                errors.title ? 'border-red-500' : 'border-gray-700 focus:border-blue-500'
              } outline-none`}
            />
            <div className="flex justify-between mt-1">
              {errors.title && <p className="text-red-400 text-xs">{errors.title}</p>}
              <p className="text-gray-500 text-xs ml-auto">{form.title.length}/200</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Loại dịch vụ *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 outline-none"
              >
                {PENDING_SERVICE_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nguồn gửi</label>
              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 outline-none"
              >
                {SERVICE_SOURCES.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Mô tả dịch vụ *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Mô tả chi tiết về dịch vụ..."
              maxLength={1000}
              className={`w-full p-3 bg-gray-900 border rounded-lg text-white placeholder-gray-500 transition-colors h-24 resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-700 focus:border-blue-500'
              } outline-none`}
            />
            <div className="flex justify-between mt-1">
              {errors.description && <p className="text-red-400 text-xs">{errors.description}</p>}
              <p className="text-gray-500 text-xs ml-auto">{form.description.length}/1000</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Địa điểm *</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Ví dụ: Hà Nội, TP.HCM..."
                className={`w-full p-3 bg-gray-900 border rounded-lg text-white placeholder-gray-500 transition-colors ${
                  errors.location ? 'border-red-500' : 'border-gray-700 focus:border-blue-500'
                } outline-none`}
              />
              {errors.location && <p className="text-red-400 text-xs mt-1">{errors.location}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Giá dịch vụ *</label>
              <input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Ví dụ: 500,000 VND/ngày"
                className={`w-full p-3 bg-gray-900 border rounded-lg text-white placeholder-gray-500 transition-colors ${
                  errors.price ? 'border-red-500' : 'border-gray-700 focus:border-blue-500'
                } outline-none`}
              />
              {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tiện nghi</label>
            <input
              value={form.amenities}
              onChange={(e) => setForm({ ...form, amenities: e.target.value })}
              placeholder="wifi, hồ bơi, gym, parking (cách nhau bằng dấu phẩy)"
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Images */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">Hình Ảnh</h3>
          
          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ảnh đại diện</label>
            <button
              type="button"
              onClick={() => document.getElementById("avatar-file")?.click()}
              disabled={uploadingFiles}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploadingFiles ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang tải lên...
                </>
              ) : (
                <>
                  <span>📸</span>
                  Chọn ảnh đại diện
                </>
              )}
            </button>
            
            <input
              id="avatar-file"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={uploadingFiles}
            />

            {avatarFile && (
              <div className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-700 rounded-lg mt-2">
                <img
                  src={URL.createObjectURL(avatarFile)}
                  alt="Avatar preview"
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{avatarFile.name}</p>
                  <p className="text-gray-400 text-xs">{(avatarFile.size / 1024 / 1024).toFixed(1)}MB</p>
                </div>
                <button
                  onClick={removeAvatar}
                  disabled={uploadingFiles}
                  className="text-red-400 hover:text-red-300 transition disabled:opacity-50"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Additional Images */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Hình ảnh bổ sung ({additionalFiles.length}/9)</label>
            <button
              type="button"
              onClick={() => document.getElementById("additional-files")?.click()}
              disabled={uploadingFiles}
              className="w-full py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploadingFiles ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang tải lên...
                </>
              ) : (
                <>
                  <span>📷</span>
                  Thêm hình ảnh
                </>
              )}
            </button>
            
            <input
              id="additional-files"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleAdditionalFilesChange}
              disabled={uploadingFiles}
            />

            {errors.files && (
              <p className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-500 mt-2">
                {errors.files}
              </p>
            )}

            {additionalFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {additionalFiles.map((file, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`preview-${i}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeAdditionalImage(i)}
                      disabled={uploadingFiles}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition disabled:opacity-50"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Owner Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">Thông Tin Liên Hệ</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tên chủ sở hữu *</label>
              <input
                value={form.owner_name}
                onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
                placeholder="Nhập tên đầy đủ..."
                className={`w-full p-3 bg-gray-900 border rounded-lg text-white placeholder-gray-500 transition-colors ${
                  errors.owner_name ? 'border-red-500' : 'border-gray-700 focus:border-blue-500'
                } outline-none`}
              />
              {errors.owner_name && <p className="text-red-400 text-xs mt-1">{errors.owner_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Số điện thoại *</label>
              <input
                value={form.phone}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  setForm({ ...form, phone: formatted });
                }}
                placeholder="+84xxxxxxxxx"
                className={`w-full p-3 bg-gray-900 border rounded-lg text-white placeholder-gray-500 transition-colors ${
                  errors.phone ? 'border-red-500' : 'border-gray-700 focus:border-blue-500'
                } outline-none`}
              />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="example@email.com"
              className={`w-full p-3 bg-gray-900 border rounded-lg text-white placeholder-gray-500 transition-colors ${
                errors.email ? 'border-red-500' : 'border-gray-700 focus:border-blue-500'
              } outline-none`}
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Facebook</label>
              <input
                value={form.facebook}
                onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                placeholder="https://facebook.com/..."
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Zalo</label>
              <input
                value={form.zalo}
                onChange={(e) => setForm({ ...form, zalo: e.target.value })}
                placeholder="Số điện thoại Zalo"
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">TikTok</label>
              <input
                value={form.tiktok}
                onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
                placeholder="@username"
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Instagram</label>
              <input
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                placeholder="@username"
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={loading || uploadingFiles}
            className="w-full py-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
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