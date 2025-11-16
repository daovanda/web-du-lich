// helpers.ts
import { supabase } from "@/lib/supabase";

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