"use client";

import { PendingService, SERVICE_TYPES, ApproveForm } from "../types";
import { useApproveModal } from "../hooks/useApproveModal";

type Props = {
  open: boolean;
  pending: PendingService | null;
  onClose: () => void;
  onApprove: (form: ApproveForm, avatarFile: File | null, additionalFiles: File[]) => Promise<void>;
  onReject: (reason: string) => Promise<void> | void;
  refresh: () => void;
};

export default function ApproveModal({ open, pending, onClose, onApprove, onReject, refresh }: Props) {
  const {
    form,
    setForm,
    avatarFile,
    additionalFiles,
    saving,
    approving,
    rejecting,
    uploadingFiles,
    errors,
    avatarInputRef,
    additionalInputRef,
    handleAvatarChange,
    handleAdditionalFilesChange,
    removeAvatar,
    removeAdditionalImage,
    handleRemoveExistingImage,
    handlePriceChange,
    handleSaveChanges,
    handleApprove,
    handleReject,
  } = useApproveModal(pending, onApprove, onReject, refresh, onClose);

  if (!open || !pending) return null;

  const isLoading = saving || approving || rejecting || uploadingFiles;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4 py-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden shadow-2xl my-4">
        {/* Header - Sticky */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-900/90 via-purple-900/90 to-pink-900/90 backdrop-blur-sm border-b border-gray-700 px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <span className="text-xl">✨</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Duyệt Dịch Vụ</h3>
                <p className="text-white/70 text-[10px]">
                  ID: {pending.id.slice(0, 8)}... • {pending.status}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-50 flex items-center justify-center text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto max-h-[calc(92vh-120px)] px-3 py-3">
          <div className="space-y-3">
            {/* Service Info */}
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-base">📝</span>
                <h4 className="text-xs font-bold text-white">Thông Tin Dịch Vụ</h4>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <label className="block text-[10px] font-semibold text-gray-300 mb-1">Tên dịch vụ *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    maxLength={200}
                    className={`w-full px-2 py-1.5 bg-gray-900/50 border rounded-lg text-white text-xs ${
                      errors.title ? "border-red-500" : "border-gray-700 focus:border-blue-500"
                    } outline-none transition-all`}
                  />
                  <div className="flex justify-between mt-0.5">
                    {errors.title && <p className="text-red-400 text-[10px] flex items-center gap-0.5">⚠️ {errors.title}</p>}
                    <p className="text-gray-500 text-[10px] ml-auto">{form.title.length}/200</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-300 mb-1">Loại dịch vụ *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-2 py-1.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-xs focus:border-blue-500 outline-none transition-all"
                  >
                    {SERVICE_TYPES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-300 mb-1">Nguồn gửi</label>
                  <input
                    value={(pending as any).source || "form"}
                    disabled
                    className="w-full px-2 py-1.5 bg-gray-800/50 rounded-lg text-gray-400 text-xs border border-gray-700/50"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-semibold text-gray-300 mb-1">Mô tả *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    maxLength={1000}
                    className={`w-full px-2 py-1.5 bg-gray-900/50 border rounded-lg text-white text-xs h-16 resize-none ${
                      errors.description ? "border-red-500" : "border-gray-700 focus:border-blue-500"
                    } outline-none transition-all`}
                  />
                  <div className="flex justify-between mt-0.5">
                    {errors.description && <p className="text-red-400 text-[10px] flex items-center gap-0.5">⚠️ {errors.description}</p>}
                    <p className="text-gray-500 text-[10px] ml-auto">{form.description.length}/1000</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-300 mb-1">Địa điểm *</label>
                  <input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className={`w-full px-2 py-1.5 bg-gray-900/50 border rounded-lg text-white text-xs ${
                      errors.location ? "border-red-500" : "border-gray-700 focus:border-blue-500"
                    } outline-none transition-all`}
                  />
                  {errors.location && <p className="text-red-400 text-[10px] mt-0.5 flex items-center gap-0.5">⚠️ {errors.location}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-300 mb-1">Giá *</label>
                  <div className="relative">
                    <input
                      value={form.price}
                      onChange={handlePriceChange}
                      placeholder="500.000"
                      className={`w-full px-2 py-1.5 bg-gray-900/50 border rounded-lg text-white text-xs ${
                        errors.price ? "border-red-500" : "border-gray-700 focus:border-blue-500"
                      } outline-none transition-all pr-10`}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-medium">VND</span>
                  </div>
                  {errors.price && <p className="text-red-400 text-[10px] mt-0.5 flex items-center gap-0.5">⚠️ {errors.price}</p>}
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-semibold text-gray-300 mb-1">Tiện nghi</label>
                  <input
                    value={form.amenities}
                    onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                    placeholder="wifi, pool, gym, parking"
                    className="w-full px-2 py-1.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-xs focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-base">📸</span>
                <h4 className="text-xs font-bold text-white">Hình Ảnh</h4>
              </div>

              {/* Current + New Avatar */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                {((pending as any).image_url || "").length > 0 && (
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-300 mb-1">Ảnh hiện tại</label>
                    <div className="relative group">
                      <img src={(pending as any).image_url} alt="Current" className="w-full h-16 object-cover rounded-lg border border-gray-700" />
                      <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-[10px]">Ảnh gốc</span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-semibold text-gray-300 mb-1">Ảnh đại diện mới</label>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingFiles}
                    className="w-full h-16 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-dashed border-purple-500/30 hover:border-purple-500/50 text-purple-400 font-semibold text-[10px] transition-all disabled:opacity-50 flex flex-col items-center justify-center gap-0.5"
                  >
                    {uploadingFiles ? (
                      <>
                        <div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                        <span>Đang tải...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg">📷</span>
                        <span>Chọn ảnh</span>
                      </>
                    )}
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={uploadingFiles}
                  />
                </div>
              </div>

              {avatarFile && (
                <div className="flex items-center gap-2 p-1.5 bg-gray-900/50 border border-gray-700 rounded-lg mb-2">
                  <img src={URL.createObjectURL(avatarFile)} alt="New" className="w-10 h-10 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-[10px] font-semibold truncate">{avatarFile.name}</p>
                    <p className="text-gray-400 text-[10px]">{(avatarFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button onClick={removeAvatar} disabled={uploadingFiles} className="w-5 h-5 rounded bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center text-xs">
                    ✕
                  </button>
                </div>
              )}

              {/* Additional Files */}
              <div>
                <label className="block text-[10px] font-semibold text-gray-300 mb-1">Thêm ảnh ({additionalFiles.length}/9)</label>
                <button
                  type="button"
                  onClick={() => additionalInputRef.current?.click()}
                  disabled={uploadingFiles}
                  className="w-full py-1.5 rounded-lg bg-gray-700/50 hover:bg-gray-700 border border-gray-600 text-gray-300 font-semibold text-[10px] transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {uploadingFiles ? (
                    <>
                      <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <span>🖼️</span>
                      Thêm ảnh
                    </>
                  )}
                </button>
                <input
                  ref={additionalInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleAdditionalFilesChange}
                  disabled={uploadingFiles}
                />

                {errors.files && (
                  <p className="text-red-400 text-[10px] bg-red-900/20 p-1.5 rounded-lg border border-red-500/30 mt-1.5 flex items-center gap-0.5">
                    ⚠️ {errors.files}
                  </p>
                )}

                {additionalFiles.length > 0 && (
                  <div className="grid grid-cols-5 gap-1.5 mt-1.5">
                    {additionalFiles.map((file, i) => (
                      <div key={i} className="relative group">
                        <img src={URL.createObjectURL(file)} alt={`new-${i}`} className="w-full h-12 object-cover rounded-lg" />
                        <button
                          onClick={() => removeAdditionalImage(i)}
                          disabled={uploadingFiles}
                          className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] hover:bg-red-600 transition-all disabled:opacity-50"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Existing Images */}
              {form.images.length > 0 && (
                <div className="mt-2">
                  <label className="block text-[10px] font-semibold text-gray-300 mb-1">Ảnh hiện tại ({form.images.length})</label>
                  <div className="grid grid-cols-6 gap-1.5">
                    {form.images.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt={`existing-${i}`} className="w-full h-10 object-cover rounded border border-gray-700" />
                        <button
                          onClick={() => handleRemoveExistingImage(url)}
                          disabled={isLoading}
                          className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                        >
                          ×
                        </button>
                        {i === 0 && <div className="absolute bottom-0 left-0 right-0 bg-blue-500/80 text-white text-[9px] px-0.5 py-0.5 rounded-b text-center">Đại diện</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-base">👤</span>
                <h4 className="text-xs font-bold text-white">Thông Tin Liên Hệ</h4>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-300 mb-1">Tên chủ sở hữu *</label>
                  <input
                    value={form.owner_name}
                    onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
                    className={`w-full px-2 py-1.5 bg-gray-900/50 border rounded-lg text-white text-xs ${
                      errors.owner_name ? "border-red-500" : "border-gray-700 focus:border-blue-500"
                    } outline-none transition-all`}
                  />
                  {errors.owner_name && <p className="text-red-400 text-[10px] mt-0.5 flex items-center gap-0.5">⚠️ {errors.owner_name}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-300 mb-1">Số điện thoại *</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={`w-full px-2 py-1.5 bg-gray-900/50 border rounded-lg text-white text-xs ${
                      errors.phone ? "border-red-500" : "border-gray-700 focus:border-blue-500"
                    } outline-none transition-all`}
                  />
                  {errors.phone && <p className="text-red-400 text-[10px] mt-0.5 flex items-center gap-0.5">⚠️ {errors.phone}</p>}
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-semibold text-gray-300 mb-1">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={`w-full px-2 py-1.5 bg-gray-900/50 border rounded-lg text-white text-xs ${
                      errors.email ? "border-red-500" : "border-gray-700 focus:border-blue-500"
                    } outline-none transition-all`}
                  />
                  {errors.email && <p className="text-red-400 text-[10px] mt-0.5 flex items-center gap-0.5">⚠️ {errors.email}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-300 mb-1 flex items-center gap-0.5">
                    <span className="text-blue-400">📘</span> Facebook
                  </label>
                  <input value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} className="w-full px-2 py-1.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-xs focus:border-blue-500 outline-none transition-all" />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-300 mb-1 flex items-center gap-0.5">
                    <span className="text-blue-500">💬</span> Zalo
                  </label>
                  <input value={form.zalo} onChange={(e) => setForm({ ...form, zalo: e.target.value })} className="w-full px-2 py-1.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-xs focus:border-blue-500 outline-none transition-all" />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-300 mb-1 flex items-center gap-0.5">
                    <span className="text-pink-400">🎵</span> TikTok
                  </label>
                  <input value={form.tiktok} onChange={(e) => setForm({ ...form, tiktok: e.target.value })} className="w-full px-2 py-1.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-xs focus:border-blue-500 outline-none transition-all" />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-300 mb-1 flex items-center gap-0.5">
                    <span className="text-pink-500">📷</span> Instagram
                  </label>
                  <input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} className="w-full px-2 py-1.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-xs focus:border-blue-500 outline-none transition-all" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions - Sticky Footer */}
        <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 p-2">
          <div className="grid grid-cols-4 gap-1.5">
            <button 
              onClick={handleSaveChanges} 
              disabled={isLoading} 
              className="px-2 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 font-semibold text-[10px] transition-all disabled:opacity-50 flex items-center justify-center gap-0.5"
            >
              {saving ? <div className="w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : "💾"}
              <span className="hidden sm:inline">Lưu</span>
            </button>

            <button 
              onClick={handleApprove} 
              disabled={isLoading} 
              className="px-2 py-1.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold text-[10px] transition-all disabled:opacity-50 flex items-center justify-center gap-0.5 shadow-lg"
            >
              {approving ? <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "✅"}
              <span className="hidden sm:inline">Duyệt</span>
            </button>

            <button 
              onClick={handleReject} 
              disabled={isLoading} 
              className="px-2 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-semibold text-[10px] transition-all disabled:opacity-50 flex items-center justify-center gap-0.5"
            >
              {rejecting ? <div className="w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : "❌"}
              <span className="hidden sm:inline">Từ chối</span>
            </button>

            <button 
              onClick={onClose} 
              disabled={isLoading} 
              className="px-2 py-1.5 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-gray-300 border border-gray-600 font-semibold text-[10px] transition-all disabled:opacity-50 flex items-center justify-center gap-0.5"
            >
              🚪 <span className="hidden sm:inline">Đóng</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}