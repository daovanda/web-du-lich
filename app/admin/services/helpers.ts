// helpers.ts
import { supabase } from "@/lib/supabase";
import type { PendingFormData } from "./types";

/** 
 * Upload danh sách ảnh lên Supabase Storage và trả về URL công khai 
 */
export async function uploadImagesToBucket(
  files: File[], 
  bucketName: string, 
  folderPath: string = ""
): Promise<string[]> {
  if (!files || files.length === 0) return [];

  const urls: string[] = [];

  for (const file of files) {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const safeName = file.name.replace(/\s+/g, '-'); // Loại bỏ khoảng trắng
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}-${safeName}`;
      
      // Thêm folderPath vào filePath
      const filePath = folderPath 
        ? `${folderPath}/${fileName}` 
        : fileName;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error(`Error uploading file ${file.name}:`, uploadError.message);
        continue; // Tiếp tục upload file khác thay vì throw error
      }

      // Get public URL
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        urls.push(data.publicUrl);
      }
    } catch (err) {
      console.error(`Upload exception for ${file.name}:`, err);
      // Không throw, tiếp tục với file tiếp theo
    }
  }

  console.log(`✅ Successfully uploaded ${urls.length}/${files.length} images to ${bucketName}${folderPath ? '/' + folderPath : ''}`);
  
  return urls;
}

/** 
 * Chuyển mảng amenities thành chuỗi hiển thị 
 */
export function formatAmenities(amenities: any[] | undefined | null): string {
  if (!amenities || amenities.length === 0) return "-";

  if (typeof amenities[0] === "string") return amenities.join(", ");
  if (typeof amenities[0] === "object" && amenities[0].name)
    return amenities.map((a) => a.name).join(", ");

  return "-";
}

/**
 * Kiểm tra số điện thoại hợp lệ (Việt Nam)
 */
export function validatePhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\s/g, '');
  const phoneRegex = /^(\+84|84|0)[0-9]{9,10}$/;
  return phoneRegex.test(cleanPhone);
}

/**
 * Kiểm tra email hợp lệ
 */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Kiểm tra files upload hợp lệ
 */
export function validateFiles(files: File[]): string | null {
  const maxFiles = 50;
  const maxSize = 20* 1024 * 1024; // 5MB per file
  
  if (files.length > maxFiles) {
    return `Tối đa ${maxFiles} hình ảnh`;
  }
  
  for (const file of files) {
    if (file.size > maxSize) {
      return `File "${file.name}" quá lớn (tối đa 20MB)`;
    }
    if (!file.type.startsWith('image/')) {
      return `File "${file.name}" không phải hình ảnh hợp lệ`;
    }
  }
  
  return null;
}

/**
 * Format số điện thoại thành định dạng +84
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('84')) {
    return '+' + cleaned;
  } else if (cleaned.startsWith('0')) {
    return '+84' + cleaned.slice(1);
  }
  return phone;
}

/**
 * Parse giá từ string có dấu phẩy thành string số thuần
 */
export function parsePrice(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Format giá thành dạng 500.000
 */
export function formatPrice(value: string): string {
  if (!value) return '';
  
  // Remove all non-digits
  const numericValue = value.replace(/\D/g, '');
  
  // Format with dots as thousand separators
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// ===== THÊM MỚI: Validation cho PendingForm =====

/**
 * Validate toàn bộ form data của PendingForm
 * @returns Object chứa các lỗi validation (nếu có)
 */
export function validatePendingForm(
  form: PendingFormData,
  avatarFile: File | null,
  additionalFiles: File[]
): Record<string, string> {
  const errors: Record<string, string> = {};

  // Validate title
  if (!form.title.trim()) {
    errors.title = "Tiêu đề dịch vụ là bắt buộc";
  } else if (form.title.trim().length < 3) {
    errors.title = "Tiêu đề phải có ít nhất 3 ký tự";
  } else if (form.title.trim().length > 200) {
    errors.title = "Tiêu đề không được quá 200 ký tự";
  }

  // Validate description
  if (!form.description.trim()) {
    errors.description = "Mô tả dịch vụ là bắt buộc";
  } else if (form.description.trim().length < 10) {
    errors.description = "Mô tả phải có ít nhất 10 ký tự";
  } else if (form.description.trim().length > 1000) {
    errors.description = "Mô tả không được quá 1000 ký tự";
  }

  // Validate location
  if (!form.location.trim()) {
    errors.location = "Địa điểm là bắt buộc";
  }

  // Validate price
  if (!form.price.trim()) {
    errors.price = "Giá dịch vụ là bắt buộc";
  }

  // Validate owner_name
  if (!form.owner_name.trim()) {
    errors.owner_name = "Tên chủ sở hữu là bắt buộc";
  } else if (form.owner_name.trim().length < 2) {
    errors.owner_name = "Tên chủ sở hữu phải có ít nhất 2 ký tự";
  }

  // Validate phone
  if (!form.phone.trim()) {
    errors.phone = "Số điện thoại là bắt buộc";
  } else if (!validatePhone(form.phone)) {
    errors.phone = "Số điện thoại không hợp lệ (ví dụ: +84123456789, 0123456789)";
  }

  // Validate email
  if (!form.email.trim()) {
    errors.email = "Email là bắt buộc";
  } else if (!validateEmail(form.email)) {
    errors.email = "Email không hợp lệ";
  }

  // Validate files
  const allFiles = [...(avatarFile ? [avatarFile] : []), ...additionalFiles];
  const fileError = validateFiles(allFiles);
  if (fileError) {
    errors.files = fileError;
  }

  return errors;
}

/**
 * Tạo initial state cho PendingForm
 */
export function createInitialPendingFormData(): PendingFormData {
  return {
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
  };
}

/**
 * Reset form về trạng thái ban đầu
 */
export function resetPendingForm(): PendingFormData {
  return createInitialPendingFormData();
}