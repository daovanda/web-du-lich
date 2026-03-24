import { apiFormRequest, apiRequest } from "@/lib/apiClient";
import type { VisitedProvince, ProvincePhoto, ToggleProvinceResult } from "../types/types";

// ==========================================
// VISITED PROVINCES OPERATIONS
// ==========================================

/**
 * Lấy tất cả tỉnh đã ghé của user
 */
export async function getUserVisitedProvinces(userId: string) {
  try {
    void userId;
    const response = await apiRequest<{ data: (VisitedProvince & { photos: ProvincePhoto[] })[] }>(
      "/api/map/visited",
      { fallbackMessage: "Không thể tải danh sách tỉnh đã ghé" }
    );
    return response.data;
  } catch (error) {
    console.error("Unexpected error in getUserVisitedProvinces:", error);
    return null;
  }
}

/**
 * Toggle tỉnh: thêm nếu chưa có, xóa nếu đã có
 */
export async function toggleProvince(
  userId: string,
  provinceId: string
): Promise<ToggleProvinceResult> {
  try {
    void userId;
    const response = await apiRequest<{
      data:
        | { success: true; action: "added"; data: VisitedProvince }
        | { success: true; action: "removed"; id: string };
    }>("/api/map/visited", {
      method: "POST",
      body: JSON.stringify({ provinceId }),
      fallbackMessage: "Không thể cập nhật tỉnh đã ghé",
    });
    return response.data;
  } catch (error) {
    console.error("Unexpected error in toggleProvince:", error);
    return {
      success: false,
      action: "removed",
      error: error as any,
    };
  }
}

/**
 * Cập nhật ghi chú cho tỉnh
 */
export async function updateProvinceNotes(
  visitedProvinceId: string,
  notes: string
): Promise<VisitedProvince | null> {
  try {
    const response = await apiRequest<{ data: VisitedProvince }>(
      `/api/map/visited/${visitedProvinceId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ notes }),
        fallbackMessage: "Không thể cập nhật ghi chú",
      }
    );
    return response.data;
  } catch (error) {
    console.error("Unexpected error in updateProvinceNotes:", error);
    return null;
  }
}

export async function getVisitedProvince(
  visitedProvinceId: string
): Promise<VisitedProvince | null> {
  try {
    const response = await apiRequest<{ data: VisitedProvince }>(
      `/api/map/visited/${visitedProvinceId}`,
      {
        fallbackMessage: "Không thể tải dữ liệu tỉnh đã ghé",
      }
    );
    return response.data;
  } catch (error) {
    console.error("Unexpected error in getVisitedProvince:", error);
    return null;
  }
}

// ==========================================
// PHOTOS OPERATIONS
// ==========================================

/**
 * Lấy tất cả ảnh của một tỉnh
 */
export async function getProvincePhotos(
  visitedProvinceId: string
): Promise<ProvincePhoto[] | null> {
  try {
    const response = await apiRequest<{ data: ProvincePhoto[] }>(
      `/api/map/photos?visitedProvinceId=${encodeURIComponent(visitedProvinceId)}`,
      { fallbackMessage: "Không thể tải ảnh tỉnh thành" }
    );
    return response.data;
  } catch (error) {
    console.error("Unexpected error in getProvincePhotos:", error);
    return null;
  }
}

/**
 * Upload ảnh lên Supabase Storage
 * ✅ FIXED: Đúng cấu trúc thư mục province_photos/userid/province_id/
 */
export async function uploadProvincePhoto(
  file: File,
  userId: string,
  provinceId: string
): Promise<string | null> {
  try {
    if (!file || !userId || !provinceId) {
      console.error("Missing required parameters");
      return null;
    }

    if (!file.type.startsWith("image/")) {
      console.error("Invalid file type:", file.type);
      return null;
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      console.error("File too large:", file.size);
      return null;
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const allowedExtensions = ["jpg", "jpeg", "png", "webp", "gif"];
    if (!allowedExtensions.includes(fileExt)) {
      console.error("Invalid file extension:", fileExt);
      return null;
    }

    const formData = new FormData();
    formData.append("bucketName", "province_photos");
    formData.append("folderPath", `${userId}/${provinceId}`);
    formData.append("files", file);

    const payload = await apiFormRequest<{ data: string[] }>("/api/uploads/images", {
      method: "POST",
      formData,
      fallbackMessage: "Không thể upload ảnh tỉnh thành",
    }).catch((error) => {
      console.error("Upload failed:", error);
      return null;
    });
    if (!payload?.data?.[0]) {
      return null;
    }
    return payload.data[0] as string;
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
}

/**
 * Thêm photo record vào database
 */
export async function addProvincePhoto(
  visitedProvinceId: string,
  userId: string,
  imageUrl: string,
  title?: string,
  note?: string
): Promise<ProvincePhoto | null> {
  try {
    void userId;
    const response = await apiRequest<{ data: ProvincePhoto }>("/api/map/photos", {
      method: "POST",
      body: JSON.stringify({
        visitedProvinceId,
        imageUrl,
        title,
        note,
      }),
      fallbackMessage: "Không thể lưu ảnh",
    });
    return response.data;
  } catch (error) {
    console.error("Unexpected error in addProvincePhoto:", error);
    return null;
  }
}

/**
 * Cập nhật thông tin ảnh (title và note)
 */
export async function updatePhoto(
  photoId: string,
  updates: { title?: string | null; note?: string | null }
): Promise<ProvincePhoto | null> {
  try {
    const cleanUpdates: any = {};

    if ("title" in updates) {
      cleanUpdates.title = updates.title?.trim() || null;
    }

    if ("note" in updates) {
      cleanUpdates.note = updates.note?.trim() || null;
    }

    const response = await apiRequest<{ data: ProvincePhoto }>(`/api/map/photos/${photoId}`, {
      method: "PATCH",
      body: JSON.stringify(cleanUpdates),
      fallbackMessage: "Không thể cập nhật ảnh",
    });
    return response.data;
  } catch (error) {
    console.error("Unexpected error in updatePhoto:", error);
    return null;
  }
}

/**
 * Xóa ảnh (cả storage và database)
 * ✅ FIXED: Hỗ trợ cả province-photos và province_photos bucket names
 */
export async function deletePhoto(
  photoId: string,
  imageUrl: string
): Promise<boolean> {
  try {
    await apiRequest<{ success: boolean }>(
      `/api/map/photos/${photoId}?imageUrl=${encodeURIComponent(imageUrl)}`,
      {
        method: "DELETE",
        fallbackMessage: "Không thể xóa ảnh",
      }
    );
    return true;
  } catch (error) {
    console.error("Delete photo error:", error);
    return false;
  }
}

// ==========================================
// ADDITIONAL HELPER FUNCTIONS
// ==========================================

/**
 * List tất cả ảnh của user trong một tỉnh (từ storage)
 */
export async function listProvincePhotosFromStorage(
  userId: string,
  provinceId: string
): Promise<string[]> {
  try {
    void userId;
    void provinceId;
    return [];
  } catch (error) {
    console.error("List error:", error);
    return [];
  }
}

/**
 * Compress image trước khi upload (optional helper)
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
}

/**
 * Batch upload multiple photos
 */
export async function uploadMultiplePhotos(
  files: File[],
  userId: string,
  provinceId: string,
  visitedProvinceId: string,
  onProgress?: (current: number, total: number) => void
): Promise<{ success: number; failed: number; urls: string[] }> {
  const results = {
    success: 0,
    failed: 0,
    urls: [] as string[],
  };

  for (let i = 0; i < files.length; i++) {
    try {
      const imageUrl = await uploadProvincePhoto(files[i], userId, provinceId);

      if (imageUrl) {
        const photo = await addProvincePhoto(visitedProvinceId, userId, imageUrl);
        if (photo) {
          results.success++;
          results.urls.push(imageUrl);
        } else {
          results.failed++;
        }
      } else {
        results.failed++;
      }

      if (onProgress) {
        onProgress(i + 1, files.length);
      }
    } catch (error) {
      console.error(`Error uploading file ${i}:`, error);
      results.failed++;
    }
  }

  return results;
}