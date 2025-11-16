import { useState, useEffect, useRef } from "react";
import { PendingService, ApproveForm } from "../types";
import { updatePendingService } from "../api";
import { uploadImagesToBucket, validatePhone, validateEmail, validateFiles, formatPhoneNumber, formatPrice, parsePrice } from "../helpers";

export function useApproveModal(
  pending: PendingService | null,
  onApprove: (form: ApproveForm, avatarFile: File | null, additionalFiles: File[]) => Promise<void>,
  onReject: (reason: string) => Promise<void> | void,
  refresh: () => void,
  onClose: () => void
) {
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

  // Helper to convert amenities to string
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

  // Sync pending -> form when open
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

  // Validation
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
    else if (!validatePhone(form.phone.trim())) newErrors.phone = "Số điện thoại không hợp lệ";

    // Email
    if (!form.email.trim()) newErrors.email = "Email là bắt buộc";
    else if (!validateEmail(form.email.trim())) newErrors.email = "Email không hợp lệ";

    // Files
    const allFiles = [...(avatarFile ? [avatarFile] : []), ...additionalFiles];
    const fileError = validateFiles(allFiles);
    if (fileError) newErrors.files = fileError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // File handlers
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
    if (additionalInputRef.current && additionalFiles.length - 1 === 0) 
      additionalInputRef.current.value = "";
  };

  const handleRemoveExistingImage = (url: string) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((u) => u !== url) }));
  };

  // Price formatting
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parsePrice(value);
    const formattedValue = formatPrice(numericValue);
    setForm({ ...form, price: formattedValue });
  };

  // Save changes
 const handleSaveChanges = async () => {
  if (!pending?.id) return;
  if (!validateForm()) {
    alert("Vui lòng kiểm tra lại các trường bắt buộc");
    return;
  }

  setSaving(true);
  setUploadingFiles(true);

  try {
    const bucketName = "services_images";
    const folderPath = pending.id; // 🆕 Thêm folder path
    
    const uploaded: string[] = [];

    // Upload avatar vào folder của service
    if (avatarFile) {
      const aUrls = await uploadImagesToBucket(
        [avatarFile], 
        bucketName, 
        folderPath // 🆕 Truyền folderPath
      );
      uploaded.push(...aUrls);
    }

    // Upload ảnh phụ vào folder của service
    if (additionalFiles.length > 0) {
      const more = await uploadImagesToBucket(
        additionalFiles, 
        bucketName, 
        folderPath // 🆕 Truyền folderPath
      );
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

    console.log(`✅ Saved to: ${bucketName}/${folderPath}`); // 🆕 Log để debug
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
  // Approve
  const handleApprove = async () => {
    if (!validateForm()) {
      alert("Vui lòng kiểm tra lại các trường bắt buộc trước khi duyệt");
      return;
    }

    setApproving(true);
    try {
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

  // Reject
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

  return {
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
  };
}