"use client";

import { useEffect, useRef, useState } from "react";
import { PendingService } from "../types";
import { SERVICE_TYPES } from "../types";
import { updatePendingService } from "../api";
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
  onApprove: (form: ApproveForm, avatarFile: File | null, additionalFiles: File[]) => Promise<void>;
  onReject: (reason: string) => Promise<void> | void;
  refresh: () => void;
};

export default function ApproveModal({ open, pending, onClose, onApprove, onReject, refresh }: Props) {
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

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const additionalInputRef = useRef<HTMLInputElement | null>(null);

  /* ---------- Helpers ---------- */
  const validatePhone = (phone: string) => {
    const clean = phone.replace(/\s/g, "");
    const phoneRegex = /^(\+84|84|0)[0-9]{9,10}$/;
    return phoneRegex.test(clean);
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("84")) return "+" + cleaned;
    if (cleaned.startsWith("0")) return "+84" + cleaned.slice(1);
    return phone;
  };

  const validateFiles = (files: File[]) => {
    const maxFiles = 10;
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (files.length > maxFiles) return `Tối đa ${maxFiles} hình ảnh`;
    for (const f of files) {
      if (f.size > maxSize) return `File "${f.name}" quá lớn (tối đa 5MB)`;
      if (!f.type.startsWith("image/")) return `File "${f.name}" không phải hình ảnh hợp lệ`;
    }
    return null;
  };

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

  /* ---------- Sync pending -> form when open ---------- */
  useEffect(() => {
    if (!pending) return;
    setForm({
      title: pending.title || "",
      description: pending.description || "",
      type: pending.type || "stay",
      location: pending.location || "",
      price: pending.price || "",
      images: Array.isArray(pending.images) ? pending.images : [],
      amenities: amenitiesToString((pending as any).amenities),
      owner_name: pending.owner_name || "",
      phone: pending.phone || "",
      email: pending.email || "",
      facebook: pending.facebook || "",
      zalo: pending.zalo || "",
      tiktok: pending.tiktok || "",
      instagram: pending.instagram || "",
    });
    setAvatarFile(null);
    setAdditionalFiles([]);
    setErrors({});
  }, [pending]);

  /* ---------- Validation ---------- */
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Title
    if (!form.title.trim()) newErrors.title = "Tiêu đề dịch vụ là bắt buộc";
    else if (form.title.trim().length < 3) newErrors.title = "Tiêu đề phải có ít nhất 3 ký tự";
    else if (form.title.trim().length > 200) newErrors.title = "Tiêu đề không được quá 200 ký tự";

    // Description
    if (!form.description.trim()) newErrors.description = "Mô tả dịch vụ là bắt buộc";
    else if (form.description.trim().length < 10) newErrors.description = "Mô tả phải có ít nhất 10 ký tự";
    else if (form.description.trim().length > 1000) newErrors.description = "Mô tả không được quá 1000 ký tự";

    // Location & Price
    if (!form.location.trim()) newErrors.location = "Địa điểm là bắt buộc";
    if (!form.price.trim()) newErrors.price = "Giá dịch vụ là bắt buộc";

    // Owner
    if (!form.owner_name.trim()) newErrors.owner_name = "Tên chủ sở hữu là bắt buộc";
    else if (form.owner_name.trim().length < 2) newErrors.owner_name = "Tên chủ sở hữu phải có ít nhất 2 ký tự";

    // Phone
    if (!form.phone.trim()) newErrors.phone = "Số điện thoại là bắt buộc";
    else if (!validatePhone(form.phone.trim())) newErrors.phone = "Số điện thoại không hợp lệ (ví dụ: +84123456789, 0123456789)";

    // Email
    if (!form.email.trim()) newErrors.email = "Email là bắt buộc";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) newErrors.email = "Email không hợp lệ";

    // Files
    const allFiles = [...(avatarFile ? [avatarFile] : []), ...additionalFiles];
    const fileError = validateFiles(allFiles);
    if (fileError) newErrors.files = fileError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------- File input handlers ---------- */
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const f = e.target.files[0];
    const err = validateFiles([f]);
    if (err) {
      setErrors((prev) => ({ ...prev, files: err }));
      return;
    }
    setAvatarFile(f);
    setErrors((prev) => ({ ...prev, files: "" }));
  };

  const handleAdditionalFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const arr = Array.from(e.target.files);
    const err = validateFiles(arr);
    if (err) {
      setErrors((prev) => ({ ...prev, files: err }));
      return;
    }
    setAdditionalFiles(arr);
    setErrors((prev) => ({ ...prev, files: "" }));
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setErrors((prev) => ({ ...prev, files: "" }));
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalFiles((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => ({ ...prev, files: "" }));
    if (additionalInputRef.current && additionalFiles.length - 1 === 0) additionalInputRef.current.value = "";
  };

  const handleRemoveExistingImage = (url: string) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((u) => u !== url) }));
  };

  /* ---------- Save changes (update pending) ---------- */
  const handleSaveChanges = async () => {
    if (!pending?.id) return;
    if (!validateForm()) {
      alert("Vui lòng kiểm tra lại các trường bắt buộc");
      return;
    }

    setSaving(true);
    setUploadingFiles(true);

    try {
      // Upload avatar + additional in one go (if any)
      const uploaded: string[] = [];

      if (avatarFile) {
        const aUrls = await uploadImagesToBucket([avatarFile], "pending_services_images");
        uploaded.push(...aUrls);
      }

      if (additionalFiles.length > 0) {
        const more = await uploadImagesToBucket(additionalFiles, "pending_services_images");
        uploaded.push(...more);
      }

      const allImages = [...form.images, ...uploaded];
      const avatarUrl = avatarFile ? uploaded[0] : (pending as any).image_url || "";

      await updatePendingService(pending.id, {
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        location: form.location.trim(),
        price: form.price.trim(),
        image_url: avatarUrl,
        images: allImages,
        amenities: form.amenities.trim(),
        owner_name: form.owner_name.trim(),
        phone: formatPhoneNumber(form.phone.trim()),
        email: form.email.trim(),
        facebook: form.facebook.trim(),
        zalo: form.zalo.trim(),
        tiktok: form.tiktok.trim(),
        instagram: form.instagram.trim(),
      } as any);

      alert("✅ Đã lưu thay đổi thành công!");
      refresh();
      setAvatarFile(null);
      setAdditionalFiles([]);
      setErrors({});
    } catch (err: any) {
      console.error("Save changes error:", err);
      alert("❌ Lỗi khi lưu: " + (err?.message ?? err));
    } finally {
      setSaving(false);
      setUploadingFiles(false);
    }
  };

  /* ---------- Approve ---------- */
  const handleApprove = async () => {
    if (!validateForm()) {
      alert("Vui lòng kiểm tra lại các trường bắt buộc trước khi duyệt");
      return;
    }

    setApproving(true);
    try {
      // Ensure phone formatted before calling onApprove
      const formToSend: ApproveForm = {
        ...form,
        phone: formatPhoneNumber(form.phone.trim()),
      };
      await onApprove(formToSend, avatarFile, additionalFiles);
      alert("✅ Đã duyệt và chuyển sang dịch vụ!");
      refresh();
      onClose();
    } catch (err: any) {
      console.error("Approve error:", err);
      alert("❌ Lỗi khi duyệt: " + (err?.message ?? err));
    } finally {
      setApproving(false);
    }
  };

  /* ---------- Reject ---------- */
  const handleReject = async () => {
    const reason = prompt("Lý do từ chối:");
    if (!reason || !reason.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }
    setRejecting(true);
    try {
      await onReject(reason.trim());
      alert("✅ Đã từ chối dịch vụ!");
      refresh();
      onClose();
    } catch (err: any) {
      console.error("Reject error:", err);
      alert("❌ Lỗi khi từ chối: " + (err?.message ?? err));
    } finally {
      setRejecting(false);
    }
  };

  if (!open || !pending) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-8">
      <div className="bg-black border border-gray-800 rounded-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-black border-b border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Duyệt Dịch Vụ</h3>
              <p className="text-gray-400 text-sm">
                ID: {pending.id.slice(0, 8)}... | {pending.status} |{" "}
                {pending.created_at ? new Date(pending.created_at).toLocaleDateString("vi-VN") : ""}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={saving || approving || rejecting || uploadingFiles}
              className="text-gray-400 hover:text-white text-xl transition-colors disabled:opacity-50"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Service Info */}
          <div className="space-y-3">
            <h4 className="text-md font-semibold text-white border-b border-gray-800 pb-2">Thông Tin Dịch Vụ</h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">Tên dịch vụ *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  maxLength={200}
                  className={`w-full p-2 bg-gray-900 border rounded-lg text-white text-sm ${
                    errors.title ? "border-red-500" : "border-gray-700 focus:border-blue-500"
                  } outline-none`}
                />
                <div className="flex justify-between mt-1">
                  {errors.title && <p className="text-red-400 text-xs">{errors.title}</p>}
                  <p className="text-gray-500 text-xs ml-auto">{form.title.length}/200</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Loại dịch vụ *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 outline-none"
                >
                  {SERVICE_TYPES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nguồn gửi</label>
                <input
                  value={(pending as any).source || "form"}
                  disabled
                  className="w-full p-2 bg-gray-800 rounded-lg text-gray-300 text-sm border border-gray-700"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">Mô tả *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  maxLength={1000}
                  className={`w-full p-2 bg-gray-900 border rounded-lg text-white text-sm h-20 resize-none ${
                    errors.description ? "border-red-500" : "border-gray-700 focus:border-blue-500"
                  } outline-none`}
                />
                <div className="flex justify-between mt-1">
                  {errors.description && <p className="text-red-400 text-xs">{errors.description}</p>}
                  <p className="text-gray-500 text-xs ml-auto">{form.description.length}/1000</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Địa điểm *</label>
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className={`w-full p-2 bg-gray-900 border rounded-lg text-white text-sm ${
                    errors.location ? "border-red-500" : "border-gray-700 focus:border-blue-500"
                  } outline-none`}
                />
                {errors.location && <p className="text-red-400 text-xs mt-1">{errors.location}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Giá *</label>
                <input
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className={`w-full p-2 bg-gray-900 border rounded-lg text-white text-sm ${
                    errors.price ? "border-red-500" : "border-gray-700 focus:border-blue-500"
                  } outline-none`}
                />
                {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">Tiện nghi</label>
                <input
                  value={form.amenities}
                  onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                  placeholder="wifi, pool, gym, parking (cách nhau bằng dấu phẩy)"
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-3">
            <h4 className="text-md font-semibold text-white border-b border-gray-800 pb-2">Hình Ảnh</h4>

            {/* Current avatar from pending */}
            {((pending as any).image_url || "").length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Ảnh đại diện hiện tại</label>
                <div className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-700 rounded-lg">
                  <img src={(pending as any).image_url} alt="Current avatar" className="w-16 h-16 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">Ảnh đại diện</p>
                    <p className="text-gray-400 text-xs">Từ dữ liệu gốc</p>
                  </div>
                </div>
              </div>
            )}

            {/* New Avatar */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Ảnh đại diện mới</label>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingFiles}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploadingFiles ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang tải lên...
                  </>
                ) : (
                  <>
                    <span>📸</span>
                    Chọn ảnh đại diện mới
                  </>
                )}
              </button>

              <input
                ref={avatarInputRef}
                id="avatar-file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={uploadingFiles}
              />

              {avatarFile && (
                <div className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-700 rounded-lg mt-2">
                  <img src={URL.createObjectURL(avatarFile)} alt="Avatar preview" className="w-12 h-12 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{avatarFile.name}</p>
                    <p className="text-gray-400 text-xs">{(avatarFile.size / 1024 / 1024).toFixed(1)}MB</p>
                  </div>
                  <button onClick={removeAvatar} disabled={uploadingFiles} className="text-red-400 hover:text-red-300 transition disabled:opacity-50">
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Additional Files */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Thêm ảnh bổ sung ({additionalFiles.length}/9)</label>
              <button
                type="button"
                onClick={() => additionalInputRef.current?.click()}
                disabled={uploadingFiles}
                className="w-full py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploadingFiles ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                ref={additionalInputRef}
                id="additional-files"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleAdditionalFilesChange}
                disabled={uploadingFiles}
              />

              {errors.files && (
                <p className="text-red-400 text-sm bg-red-900/20 p-2 rounded-lg border border-red-500 mt-2">{errors.files}</p>
              )}

              {additionalFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {additionalFiles.map((file, i) => (
                    <div key={i} className="relative group">
                      <img src={URL.createObjectURL(file)} alt={`new-${i}`} className="w-full h-16 object-cover rounded-lg" />
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

            {/* Existing Images */}
            {form.images.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Ảnh hiện tại ({form.images.length})</label>
                <div className="grid grid-cols-4 gap-2">
                  {form.images.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} alt={`existing-${i}`} className="w-full h-16 object-cover rounded-lg" />
                      <button
                        onClick={() => handleRemoveExistingImage(url)}
                        disabled={saving || approving || rejecting}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition opacity-0 group-hover:opacity-100 disabled:opacity-50"
                      >
                        ×
                      </button>
                      {i === 0 && <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">Đại diện</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-md font-semibold text-white border-b border-gray-800 pb-2">Thông Tin Liên Hệ</h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Tên chủ sở hữu *</label>
                <input
                  value={form.owner_name}
                  onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
                  className={`w-full p-2 bg-gray-900 border rounded-lg text-white text-sm ${
                    errors.owner_name ? "border-red-500" : "border-gray-700 focus:border-blue-500"
                  } outline-none`}
                />
                {errors.owner_name && <p className="text-red-400 text-xs mt-1">{errors.owner_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Số điện thoại *</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: formatPhoneNumber(e.target.value) })}
                  className={`w-full p-2 bg-gray-900 border rounded-lg text-white text-sm ${
                    errors.phone ? "border-red-500" : "border-gray-700 focus:border-blue-500"
                  } outline-none`}
                />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full p-2 bg-gray-900 border rounded-lg text-white text-sm ${
                    errors.email ? "border-red-500" : "border-gray-700 focus:border-blue-500"
                  } outline-none`}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Facebook</label>
                <input value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Zalo</label>
                <input value={form.zalo} onChange={(e) => setForm({ ...form, zalo: e.target.value })} className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">TikTok</label>
                <input value={form.tiktok} onChange={(e) => setForm({ ...form, tiktok: e.target.value })} className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Instagram</label>
                <input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 outline-none" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <button onClick={handleSaveChanges} disabled={saving || approving || rejecting || uploadingFiles} className="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang lưu...
                </span>
              ) : (
                "💾 Lưu Thay Đổi"
              )}
            </button>

            <button onClick={handleApprove} disabled={saving || approving || rejecting || uploadingFiles} className="flex-1 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed">
              {approving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang duyệt...
                </span>
              ) : (
                "✅ Duyệt Dịch Vụ"
              )}
            </button>

            <button onClick={handleReject} disabled={saving || approving || rejecting || uploadingFiles} className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed">
              {rejecting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang từ chối...
                </span>
              ) : (
                "❌ Từ Chối"
              )}
            </button>

            <button onClick={onClose} disabled={saving || approving || rejecting || uploadingFiles} className="flex-1 px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed">
              🔒 Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
