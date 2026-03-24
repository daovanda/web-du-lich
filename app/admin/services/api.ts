import { apiRequest } from "@/lib/apiClient";
import { PendingService, Service } from "./types";
import { uploadImagesToBucket } from "./helpers";
/* ----------------------------- FETCHERS ----------------------------- */

export async function fetchPendingServices(): Promise<PendingService[]> {
  try {
    const res = await apiRequest<{ data: PendingService[] }>(
      "/api/admin/services?mode=pending",
      { fallbackMessage: "Lỗi khi tải danh sách dịch vụ chờ duyệt" }
    );
    return (res.data || []) as PendingService[];
  } catch (error) {
    console.error("fetchPendingServices error:", error);
    return [];
  }
}

export async function fetchServices(
  search: string,
  typeFilter: string,
  statusFilter: string
): Promise<Service[]> {
  try {
    const params = new URLSearchParams({
      mode: "official",
      search,
      typeFilter,
      statusFilter,
    });
    const res = await apiRequest<{ data: Service[] }>(
      `/api/admin/services?${params.toString()}`,
      { fallbackMessage: "Lỗi khi tải danh sách dịch vụ" }
    );
    return (res.data || []) as Service[];
  } catch (error) {
    console.error("fetchServices error:", error);
    return [];
  }
}

export async function fetchStats() {
  try {
    return await apiRequest<{
      totalServices: number;
      totalPending: number;
      totalConfirmed: number;
      byType: Record<string, number>;
    }>("/api/admin/services/stats", { fallbackMessage: "Lỗi khi tải thống kê services" });
  } catch (error) {
    console.error("fetchStats error:", error);
    return { 
      totalServices: 0, 
      totalPending: 0, 
      totalConfirmed: 0, 
      byType: {},
    };
  }
}

/* ----------------------------- PENDING ACTIONS ----------------------------- */

export async function updatePendingStatus(id: string, newStatus?: string) {
  try {
    if (!newStatus) {
      throw new Error("Thiếu trạng thái mới");
    }
    await apiRequest(`/api/admin/services/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
      fallbackMessage: "Lỗi khi cập nhật trạng thái dịch vụ",
    });
  } catch (error) {
    console.error("updateServiceStatus error:", error);
    throw error;
  }
}



export async function addPendingService(
  serviceForm: any, 
  avatarFile: File | null, 
  additionalFiles: File[]
) {
  try {
    // 1️⃣ Xử lý amenities an toàn
    const amenitiesArray = serviceForm.amenities && serviceForm.amenities.trim()
      ? serviceForm.amenities
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
          .map((name: string) => ({ name }))
      : [];

    // 2️⃣ Chuẩn bị dữ liệu để insert (CHƯA CÓ ảnh)
    const insertData = {
      title: serviceForm.title.trim(),
      type: serviceForm.type,
      description: serviceForm.description?.trim() || null,
      location: serviceForm.location?.trim() || null,
      price: serviceForm.price?.trim() || null,
      image_url: null, // 🔹 Tạm thời null
      images: [],      // 🔹 Tạm thời empty array
      amenities: amenitiesArray,
      owner_name: serviceForm.owner_name?.trim() || null,
      phone: serviceForm.phone?.trim() || null,
      email: serviceForm.email?.trim() || null,
      facebook: serviceForm.facebook?.trim() || null,
      zalo: serviceForm.zalo?.trim() || null,
      tiktok: serviceForm.tiktok?.trim() || null,
      instagram: serviceForm.instagram?.trim() || null,
      
      // 🆕 Status mới: 'pending' thay vì 'new'
      status: "pending",
      
      // 🆕 Source tracking
      source: serviceForm.source || "form",
      
    };

    // 3️⃣ Validate required fields
    if (!insertData.title) throw new Error("Tiêu đề dịch vụ là bắt buộc");
    if (!insertData.description) throw new Error("Mô tả dịch vụ là bắt buộc");
    if (!insertData.location) throw new Error("Địa điểm là bắt buộc");
    if (!insertData.price) throw new Error("Giá dịch vụ là bắt buộc");
    if (!insertData.owner_name) throw new Error("Tên chủ sở hữu là bắt buộc");
    if (!insertData.phone) throw new Error("Số điện thoại là bắt buộc");
    if (!insertData.email) throw new Error("Email là bắt buộc");

    // 4️⃣ Insert record TRƯỚC để lấy ID
    const insertedRes = await apiRequest<{ data: PendingService[] }>("/api/admin/services", {
      method: "POST",
      body: JSON.stringify(insertData),
      fallbackMessage: "Lỗi khi thêm dịch vụ",
    });
    const insertedData = insertedRes.data?.[0];

    if (!insertedData) {
      throw new Error('Không thể lấy ID của dịch vụ vừa tạo');
    }

    const serviceId = insertedData.id;
    console.log('✅ Created service with ID:', serviceId, '| Status: pending');

    // 6️⃣ Upload ảnh vào folder theo ID
    // 🎯 Bucket vẫn giữ tên cũ hoặc đổi thành "services_images"
    const bucketName = "services_images"; // Hoặc "services_images"
    let imageUrl: string | null = null;
    let additionalImageUrls: string[] = [];

    // Upload ảnh đại diện vào folder services/[id]/
    if (avatarFile) {
      const avatarUrls = await uploadImagesToBucket(
        [avatarFile], 
        bucketName,
        serviceId // 🎯 Folder path = ID của service
      );
      imageUrl = avatarUrls[0] || null;
    }

    // Upload các ảnh bổ sung vào cùng folder
    if (additionalFiles && additionalFiles.length > 0) {
      additionalImageUrls = await uploadImagesToBucket(
        additionalFiles, 
        bucketName,
        serviceId // 🎯 Folder path = ID của service
      );
    }

    // 6️⃣ Update lại record với URLs của ảnh
    if (imageUrl || additionalImageUrls.length > 0) {
      await apiRequest(`/api/admin/services/${serviceId}`, {
        method: "PATCH",
        body: JSON.stringify({
          image_url: imageUrl,
          images: additionalImageUrls
        }),
        fallbackMessage: "Dịch vụ đã tạo nhưng không thể cập nhật ảnh",
      });
    }

    return insertedData;
  } catch (error) {
    console.error('addService error:', error);
    throw error;
  }
}

/* --------------------------------  PendingModal Avtions  ---------------------------------*/

/**
 * Validate danh sách file ảnh
 */
export const validateFiles = (files: File[], maxFiles = 10, maxSizeMB = 5) => {
  const maxSize = maxSizeMB * 1024 * 1024;
  if (files.length > maxFiles) return `Tối đa ${maxFiles} hình ảnh`;
  for (const f of files) {
    if (f.size > maxSize) return `File "${f.name}" quá lớn (tối đa ${maxSizeMB}MB)`;
    if (!f.type.startsWith("image/")) return `File "${f.name}" không phải hình ảnh hợp lệ`;
  }
  return null;
};

/**
 * Xử lý chọn ảnh đại diện
 */
export const handleAvatarChangeAPI = (
  e: React.ChangeEvent<HTMLInputElement>,
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  setAvatarFile: React.Dispatch<React.SetStateAction<File | null>>
) => {
  if (!e.target.files || e.target.files.length === 0) return;
  const f = e.target.files[0];
  const err = validateFiles([f]);
  if (err) return setErrors(prev => ({ ...prev, files: err }));
  setAvatarFile(f);
  setErrors(prev => ({ ...prev, files: "" }));
};

/**
 * Xử lý chọn ảnh phụ
 */
export const handleAdditionalFilesChangeAPI = (
  e: React.ChangeEvent<HTMLInputElement>,
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  setAdditionalFiles: React.Dispatch<React.SetStateAction<File[]>>
) => {
  if (!e.target.files) return;
  const arr = Array.from(e.target.files);
  const err = validateFiles(arr);
  if (err) return setErrors(prev => ({ ...prev, files: err }));
  setAdditionalFiles(arr);
  setErrors(prev => ({ ...prev, files: "" }));
};

/**
 * Xóa ảnh đại diện
 */
export const removeAvatarAPI = (
  setAvatarFile: React.Dispatch<React.SetStateAction<File | null>>,
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  avatarInputRef: React.RefObject<HTMLInputElement>
) => {
  setAvatarFile(null);
  setErrors(prev => ({ ...prev, files: "" }));
  if (avatarInputRef.current) avatarInputRef.current.value = "";
};

/**
 * Xóa ảnh phụ (bổ sung)
 */
export const removeAdditionalImageAPI = (
  index: number,
  setAdditionalFiles: React.Dispatch<React.SetStateAction<File[]>>,
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  additionalInputRef: React.RefObject<HTMLInputElement>,
  additionalFiles: File[]
) => {
  setAdditionalFiles(prev => prev.filter((_, i) => i !== index));
  setErrors(prev => ({ ...prev, files: "" }));
  if (additionalInputRef.current && additionalFiles.length - 1 === 0)
    additionalInputRef.current.value = "";
};

/**
 * Xóa ảnh đã có (từ DB)
 */
export const handleRemoveExistingImageAPI = (
  url: string,
  setForm: React.Dispatch<React.SetStateAction<any>>
) => {
  setForm((prev: any) => ({ ...prev, images: prev.images.filter((u: string) => u !== url) }));
};


/* ----------------------------- OFFICIAL ACTIONS ----------------------------- */

export async function toggleServiceStatus(svc: Service, targetStatus: string) {
  try {
    await apiRequest(`/api/admin/services/${svc.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: targetStatus }),
      fallbackMessage: "Lỗi khi cập nhật trạng thái dịch vụ",
    });
  } catch (error) {
    console.error('toggleServiceStatus error:', error);
    throw error;
  }
}
/* ----------------------------- APPROVE / REJECT ----------------------------- */

export async function approvePendingAsService(
  serviceId: string,
  approveForm: any,
  avatarFile: File | null,
  additionalFiles: File[]
) {
  try {
    // 1️⃣ Lấy thông tin service hiện tại
    const currentRes = await apiRequest<{ data: Service }>(`/api/admin/services/${serviceId}`, {
      fallbackMessage: "Không thể lấy thông tin service",
    });
    const currentService = currentRes.data;
    if (!currentService) {
      throw new Error("Không tìm thấy service");
    }

    // 2️⃣ Upload ảnh mới (nếu có) vào CÙNG folder
    const bucketName = "services_images"; // hoặc "services_images"
    let newImageUrl: string | null = null;
    let newAdditionalUrls: string[] = [];

    // Upload avatar mới
    if (avatarFile) {
      const avatarUrls = await uploadImagesToBucket(
        [avatarFile], 
        bucketName,
        serviceId // 🎯 Folder không đổi vì ID không đổi
      );
      newImageUrl = avatarUrls[0] || null;
    }

    // Upload ảnh phụ mới
    if (additionalFiles && additionalFiles.length > 0) {
      newAdditionalUrls = await uploadImagesToBucket(
        additionalFiles, 
        bucketName,
        serviceId
      );
    }

    // 3️⃣ Xử lý ảnh: Ưu tiên ảnh mới, không có thì giữ ảnh cũ
    const finalImageUrl = newImageUrl || currentService.image_url;
    
    // Gộp ảnh cũ + ảnh mới (loại bỏ ảnh đại diện khỏi danh sách phụ)
    const existingImages = (currentService.images || []).filter(
      (img: string) => img !== finalImageUrl
    );
    const combinedImages = [...existingImages, ...newAdditionalUrls];

    // 4️⃣ Chuẩn hóa amenities
    const amenitiesArray = approveForm.amenities && approveForm.amenities.trim()
      ? approveForm.amenities
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
          .map((name: string) => ({ name }))
      : currentService.amenities || [];

    // 5️⃣ UPDATE service: đổi status + cập nhật thông tin
    const updateData = {
      // Thông tin cơ bản
      title: approveForm.title.trim(),
      description: approveForm.description?.trim() || null,
      type: approveForm.type,
      location: approveForm.location?.trim() || null,
      price: approveForm.price?.trim() || null,
      
      // Ảnh
      image_url: finalImageUrl,
      images: combinedImages,
      
      // Tiện ích
      amenities: amenitiesArray,

      // Thông tin liên hệ (giữ nguyên từ service hiện tại)
      owner_name: currentService.owner_name,
      phone: currentService.phone,
      email: currentService.email,
      facebook: currentService.facebook,
      zalo: currentService.zalo,
      tiktok: currentService.tiktok,
      instagram: currentService.instagram,

      // 🎯 Đổi status thành approved (hoặc active)
      status: "active", // Hoặc "active" tùy workflow của bạn
      
      // Thông tin phê duyệt
      // Thông tin phê duyệt và timestamp set ở API status route
    };

    await apiRequest(`/api/admin/services/${serviceId}`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
      fallbackMessage: "Lỗi khi cập nhật thông tin service",
    });
    await apiRequest(`/api/admin/services/${serviceId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "active" }),
      fallbackMessage: "Lỗi khi phê duyệt service",
    });

    console.log(`✅ Approved service ${serviceId} - Status: approved - Images in ${bucketName}/${serviceId}/`);
  } catch (error) {
    console.error('approveServiceAsActive error:', error);
    throw error;
  }
}

export async function rejectPendingService(id: string, reason: string) {
  try {
    if (!reason || reason.trim() === "") {
      throw new Error("Lý do từ chối không được để trống");
    }

    await apiRequest(`/api/admin/services/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "rejected", reason: reason.trim() }),
      fallbackMessage: "Lỗi khi từ chối dịch vụ",
    });
  } catch (error) {
    console.error("rejectService error:", error);
    throw error;
  }
}



/* ----------------------------- UPDATE PENDING SERVICE ----------------------------- */
export async function updatePendingService(id: string, updatedData: Partial<PendingService>) {
  try {
    await apiRequest(`/api/admin/services/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updatedData),
      fallbackMessage: "Lỗi khi cập nhật dịch vụ chờ duyệt",
    });
  } catch (error) {
    console.error('updatePendingService error:', error);
    throw error;
  }
}

export async function removePendingImage(pendingId: string, imageUrl: string) {
  try {
    const currentRes = await apiRequest<{ data: { image_url: string | null; images: string[] | null } }>(
      `/api/admin/services/${pendingId}`,
      { fallbackMessage: "Lỗi khi lấy thông tin hình ảnh" }
    );
    const current = currentRes.data;

    // Kiểm tra xem ảnh cần xóa có phải là ảnh đại diện không
    if (current.image_url === imageUrl) {
      // Nếu là ảnh đại diện, xóa image_url và cập nhật images
      const updatedImages = (current.images || []).filter((img: string) => img !== imageUrl);
      const newImageUrl = updatedImages.length > 0 ? updatedImages[0] : null;
      const finalImages = updatedImages.slice(1); // Bỏ ảnh đầu tiên khỏi images

      await apiRequest(`/api/admin/services/${pendingId}`, {
        method: "PATCH",
        body: JSON.stringify({ 
          image_url: newImageUrl,
          images: finalImages 
        }),
        fallbackMessage: "Lỗi khi cập nhật hình ảnh",
      });
    } else {
      // Nếu là ảnh phụ, chỉ xóa khỏi images
      const updatedImages = (current.images || []).filter((img: string) => img !== imageUrl);

      await apiRequest(`/api/admin/services/${pendingId}`, {
        method: "PATCH",
        body: JSON.stringify({ images: updatedImages }),
        fallbackMessage: "Lỗi khi cập nhật hình ảnh",
      });
    }
  } catch (error) {
    console.error('removePendingImage error:', error);
    throw error;
  }
}

