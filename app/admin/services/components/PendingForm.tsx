"use client";

import { useState, useEffect } from "react";
import { 
  PENDING_SERVICE_TYPES, 
  SERVICE_SOURCES,
  type PendingFormData,
  type PendingFormProps 
} from "../types";
import { 
  validateFiles,
  formatPhoneNumber, 
  formatPrice, 
  parsePrice,
  validatePendingForm,
  createInitialPendingFormData,
  resetPendingForm
} from "../helpers";

export default function PendingForm({ onSubmit, loading }: PendingFormProps) {
  const [form, setForm] = useState<PendingFormData>(createInitialPendingFormData());
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string>("");

  // ✅ Cleanup preview URLs on unmount
  useEffect(() => {
    const urls: string[] = [];
    
    if (avatarFile) {
      urls.push(URL.createObjectURL(avatarFile));
    }
    
    additionalFiles.forEach(file => {
      urls.push(URL.createObjectURL(file));
    });
    
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [avatarFile, additionalFiles]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileError = validateFiles([file]);
    
    if (fileError) {
      setErrors({ ...errors, avatar: fileError });
      return;
    }
    
    setAvatarFile(file);
    setErrors({ ...errors, avatar: "", files: "" });
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

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parsePrice(value);
    const formattedValue = formatPrice(numericValue);
    setForm({ ...form, price: formattedValue });
  };

  const handleSubmit = async () => {
    // ✅ Prevent submit when loading
    if (loading) return;
    
    // ✅ Clear previous errors
    setServerError("");
    
    const validationErrors = validatePendingForm(form, avatarFile, additionalFiles);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // ✅ Scroll to first error
      const firstErrorElement = document.querySelector('[class*="border-red-500"]');
      firstErrorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    try {
      await onSubmit(form, avatarFile, additionalFiles);
      
      // ✅ CHỈ reset form khi parent KHÔNG throw error
      setForm(resetPendingForm());
      setAvatarFile(null);
      setAdditionalFiles([]);
      setErrors({});
      setServerError("");
      
      // ✅ Scroll to top để thấy success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Submit error:', error);
      
      // ✅ Show error to user
      setServerError(
        error instanceof Error 
          ? error.message 
          : "Có lỗi xảy ra khi tạo dịch vụ. Vui lòng thử lại sau."
      );
      
      // ✅ Scroll to error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    if (errors.avatar || errors.files) {
      setErrors({ ...errors, avatar: "", files: "" });
    }
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalFiles(additionalFiles.filter((_, i) => i !== index));
    if (errors.files) {
      setErrors({ ...errors, files: "" });
    }
  };

  // ✅ Disable state
  const isDisabled = loading;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-700/50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
              <span className="text-4xl">✨</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Thêm Dịch Vụ Mới</h2>
            <p className="text-white/90 text-sm">Điền thông tin để chờ admin duyệt</p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* ✅ Server Error Display */}
          {serverError && (
            <div className="bg-red-900/20 border-2 border-red-500/50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <p className="text-red-400 font-semibold mb-1">Có lỗi xảy ra</p>
                  <p className="text-red-300 text-sm">{serverError}</p>
                </div>
                <button
                  onClick={() => setServerError("")}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-xl">📝</span>
              </div>
              <h3 className="text-xl font-bold text-white">Thông Tin Cơ Bản</h3>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Tên dịch vụ <span className="text-red-400">*</span>
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Nhập tên dịch vụ..."
                maxLength={200}
                disabled={isDisabled}
                className={`w-full px-4 py-3 bg-gray-800/50 border-2 rounded-xl text-white placeholder-gray-500 transition-all focus:bg-gray-800 ${
                  errors.title ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-blue-500'
                } outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
              />
              <div className="flex justify-between mt-2">
                {errors.title && <p className="text-red-400 text-xs flex items-center gap-1">⚠️ {errors.title}</p>}
                <p className="text-gray-500 text-xs ml-auto">{form.title.length}/200</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Loại dịch vụ <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  disabled={isDisabled}
                  className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-xl text-white focus:border-blue-500 focus:bg-gray-800 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem'}}
                >
                  {PENDING_SERVICE_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Nguồn gửi</label>
                <select
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  disabled={isDisabled}
                  className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-xl text-white focus:border-blue-500 focus:bg-gray-800 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem'}}
                >
                  {SERVICE_SOURCES.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Mô tả dịch vụ <span className="text-red-400">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Mô tả chi tiết về dịch vụ..."
                maxLength={1000}
                disabled={isDisabled}
                className={`w-full px-4 py-3 bg-gray-800/50 border-2 rounded-xl text-white placeholder-gray-500 transition-all h-32 resize-none focus:bg-gray-800 ${
                  errors.description ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-blue-500'
                } outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
              />
              <div className="flex justify-between mt-2">
                {errors.description && <p className="text-red-400 text-xs flex items-center gap-1">⚠️ {errors.description}</p>}
                <p className="text-gray-500 text-xs ml-auto">{form.description.length}/1000</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Địa điểm <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Ví dụ: Hà Nội, TP.HCM..."
                  disabled={isDisabled}
                  className={`w-full px-4 py-3 bg-gray-800/50 border-2 rounded-xl text-white placeholder-gray-500 transition-all focus:bg-gray-800 ${
                    errors.location ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-blue-500'
                  } outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                {errors.location && <p className="text-red-400 text-xs mt-2 flex items-center gap-1">⚠️ {errors.location}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Giá dịch vụ <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    value={form.price}
                    onChange={handlePriceChange}
                    placeholder="500.000"
                    disabled={isDisabled}
                    className={`w-full px-4 py-3 bg-gray-800/50 border-2 rounded-xl text-white placeholder-gray-500 transition-all focus:bg-gray-800 ${
                      errors.price ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-blue-500'
                    } outline-none pr-16 disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">VND</span>
                </div>
                {errors.price && <p className="text-red-400 text-xs mt-2 flex items-center gap-1">⚠️ {errors.price}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Tiện nghi</label>
              <input
                value={form.amenities}
                onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                placeholder="wifi, hồ bơi, gym, parking (cách nhau bằng dấu phẩy)"
                disabled={isDisabled}
                className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:bg-gray-800 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <span className="text-xl">📸</span>
              </div>
              <h3 className="text-xl font-bold text-white">Hình Ảnh</h3>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Ảnh đại diện <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => document.getElementById("avatar-file")?.click()}
                disabled={isDisabled}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <span className="text-xl">📷</span>
                Chọn ảnh đại diện
              </button>
              
              <input
                id="avatar-file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={isDisabled}
              />

              {errors.avatar && (
                <p className="text-red-400 text-xs mt-2 flex items-center gap-1">⚠️ {errors.avatar}</p>
              )}

              {avatarFile && (
                <div className="flex items-center gap-3 p-4 bg-gray-800/50 border-2 border-gray-700 rounded-xl mt-3 hover:border-gray-600 transition-all">
                  <img
                    src={URL.createObjectURL(avatarFile)}
                    alt="Avatar preview"
                    className="w-16 h-16 object-cover rounded-lg shadow-md"
                  />
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold">{avatarFile.name}</p>
                    <p className="text-gray-400 text-xs mt-1">{(avatarFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    onClick={removeAvatar}
                    disabled={isDisabled}
                    className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Hình ảnh bổ sung <span className="text-gray-500">({additionalFiles.length}/50 ảnh)</span>
              </label>
              <button
                type="button"
                onClick={() => document.getElementById("additional-files")?.click()}
                disabled={isDisabled}
                className="w-full py-4 rounded-xl bg-gray-800/50 border-2 border-gray-700 hover:bg-gray-800 hover:border-gray-600 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span className="text-xl">🖼️</span>
                Thêm hình ảnh
              </button>
              
              <input
                id="additional-files"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleAdditionalFilesChange}
                disabled={isDisabled}
              />

              {errors.files && (
                <div className="flex items-start gap-2 text-red-400 text-sm bg-red-900/20 p-4 rounded-xl border-2 border-red-500/50 mt-3">
                  <span className="text-lg">⚠️</span>
                  <span>{errors.files}</span>
                </div>
              )}

              {additionalFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {additionalFiles.map((file, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`preview-${i}`}
                        className="w-full h-24 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-all"
                      />
                      <button
                        onClick={() => removeAdditionalImage(i)}
                        disabled={isDisabled}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-all disabled:opacity-50 shadow-lg"
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
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
              <h3 className="text-xl font-bold text-white">Thông Tin Liên Hệ</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Tên chủ sở hữu <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.owner_name}
                  onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
                  placeholder="Nhập tên đầy đủ..."
                  disabled={isDisabled}
                  className={`w-full px-4 py-3 bg-gray-800/50 border-2 rounded-xl text-white placeholder-gray-500 transition-all focus:bg-gray-800 ${
                    errors.owner_name ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-blue-500'
                  } outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                {errors.owner_name && <p className="text-red-400 text-xs mt-2 flex items-center gap-1">⚠️ {errors.owner_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Số điện thoại <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    setForm({ ...form, phone: formatted });
                  }}
                  placeholder="+84xxxxxxxxx"
                  disabled={isDisabled}
                  className={`w-full px-4 py-3 bg-gray-800/50 border-2 rounded-xl text-white placeholder-gray-500 transition-all focus:bg-gray-800 ${
                    errors.phone ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-blue-500'
                  } outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                {errors.phone && <p className="text-red-400 text-xs mt-2 flex items-center gap-1">⚠️ {errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="example@email.com"
                disabled={isDisabled}
                className={`w-full px-4 py-3 bg-gray-800/50 border-2 rounded-xl text-white placeholder-gray-500 transition-all focus:bg-gray-800 ${
                  errors.email ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-blue-500'
                } outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
              />
              {errors.email && <p className="text-red-400 text-xs mt-2 flex items-center gap-1">⚠️ {errors.email}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  <span className="inline-flex items-center gap-2">
                    <span className="text-blue-400">📘</span> Facebook
                  </span>
                </label>
                <input
                  value={form.facebook}
                  onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                  placeholder="https://facebook.com/..."
                  disabled={isDisabled}
                  className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:bg-gray-800 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  <span className="inline-flex items-center gap-2">
                    <span className="text-blue-500">💬</span> Zalo
                  </span>
                </label>
                <input
                  value={form.zalo}
                  onChange={(e) => setForm({ ...form, zalo: e.target.value })}
                  placeholder="Số điện thoại Zalo"
                  disabled={isDisabled}
                  className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:bg-gray-800 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  <span className="inline-flex items-center gap-2">
                    <span className="text-pink-400">🎵</span> TikTok
                  </span>
                </label>
                <input
                  value={form.tiktok}
                  onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
                  placeholder="@username"
                  disabled={isDisabled}
                  className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:bg-gray-800 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  <span className="inline-flex items-center gap-2">
                    <span className="text-pink-500">📷</span> Instagram
                  </span>
                </label>
                <input
                  value={form.instagram}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  placeholder="@username"
                  disabled={isDisabled}
                  className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:bg-gray-800 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6">
            <button
              onClick={handleSubmit}
              disabled={isDisabled}
              className="w-full py-5 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang gửi...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span className="text-2xl">🚀</span>
                  Gửi Dịch Vụ Chờ Duyệt
                </span>
              )}
            </button>
            
            <div className="text-center mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
              <p className="text-blue-300 text-sm flex items-center justify-center gap-2">
                <span className="text-lg">⏰</span>
                Dịch vụ sẽ được admin xem xét và duyệt trong vòng 24-48 giờ
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}