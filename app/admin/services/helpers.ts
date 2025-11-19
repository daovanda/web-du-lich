// helpers.ts - Improved version
import { supabase } from "@/lib/supabase";
import type { PendingFormData } from "./types";

// ===== IMAGE OPTIMIZATION =====

/**
 * Nén và tối ưu ảnh trước khi upload
 */
export async function optimizeImage(file: File, maxWidth: number = 1920): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      // Tính toán kích thước mới giữ nguyên tỷ lệ
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Vẽ ảnh đã resize
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Convert sang blob với quality 0.85
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const optimizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(optimizedFile);
          } else {
            reject(new Error('Failed to optimize image'));
          }
        },
        'image/jpeg',
        0.85
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Validate file type bằng magic bytes (an toàn hơn MIME type)
 */
export async function validateFileType(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const arr = new Uint8Array(e.target?.result as ArrayBuffer).subarray(0, 4);
      let header = '';
      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16);
      }
      
      // Check magic bytes for common image formats
      const validHeaders = [
        'ffd8ffe0', // JPEG
        'ffd8ffe1', // JPEG
        'ffd8ffe2', // JPEG
        '89504e47', // PNG
        '47494638', // GIF
        '52494646', // WEBP (starts with RIFF)
      ];
      
      resolve(validHeaders.some(h => header.startsWith(h)));
    };
    
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file.slice(0, 4));
  });
}

// ===== UPLOAD WITH RETRY & PROGRESS =====

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

/**
 * Upload file với retry mechanism và progress tracking
 */
export async function uploadFileWithRetry(
  file: File,
  bucketName: string,
  folderPath: string = "",
  onProgress?: (progress: number) => void,
  maxRetries: number = 3
): Promise<string> {
  // Optimize image trước khi upload
  let fileToUpload = file;
  if (file.type.startsWith('image/')) {
    try {
      fileToUpload = await optimizeImage(file);
      console.log(`✅ Optimized ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`);
    } catch (err) {
      console.warn('Failed to optimize image, using original', err);
    }
  }
  
  // Generate secure filename
  const fileExt = fileToUpload.name.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 10);
  const fileName = `${timestamp}-${randomStr}.${fileExt}`;
  const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;
  
  // Retry logic
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      onProgress?.(0);
      
      // Upload to Supabase
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false,
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL');
      }
      
      onProgress?.(100);
      return urlData.publicUrl;
      
    } catch (error: any) {
      console.error(`Upload attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw new Error(`Failed to upload ${file.name} after ${maxRetries} attempts: ${error.message}`);
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  throw new Error('Upload failed');
}

/**
 * Upload nhiều ảnh với progress tracking chi tiết
 */
export async function uploadImagesWithProgress(
  files: File[],
  bucketName: string,
  folderPath: string = "",
  onProgress?: (progresses: UploadProgress[]) => void
): Promise<{ urls: string[]; errors: string[] }> {
  if (!files || files.length === 0) {
    return { urls: [], errors: [] };
  }
  
  const progresses: UploadProgress[] = files.map(f => ({
    fileName: f.name,
    progress: 0,
    status: 'pending'
  }));
  
  const updateProgress = () => {
    onProgress?.(progresses);
  };
  
  updateProgress();
  
  const results = await Promise.allSettled(
    files.map(async (file, index) => {
      progresses[index].status = 'uploading';
      updateProgress();
      
      try {
        const url = await uploadFileWithRetry(
          file,
          bucketName,
          folderPath,
          (progress) => {
            progresses[index].progress = progress;
            updateProgress();
          }
        );
        
        progresses[index].status = 'success';
        progresses[index].progress = 100;
        updateProgress();
        
        return url;
      } catch (error: any) {
        progresses[index].status = 'error';
        progresses[index].error = error.message;
        updateProgress();
        throw error;
      }
    })
  );
  
  const urls: string[] = [];
  const errors: string[] = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      urls.push(result.value);
    } else {
      errors.push(`${files[index].name}: ${result.reason.message}`);
    }
  });
  
  return { urls, errors };
}

// ===== LEGACY FUNCTION (for backward compatibility) =====

/**
 * @deprecated Use uploadImagesWithProgress instead
 */
export async function uploadImagesToBucket(
  files: File[], 
  bucketName: string, 
  folderPath: string = ""
): Promise<string[]> {
  const { urls } = await uploadImagesWithProgress(files, bucketName, folderPath);
  return urls;
}

// ===== VALIDATION =====

/**
 * Kiểm tra files upload hợp lệ với security checks
 */
export async function validateFiles(files: File[]): Promise<string | null> {
  const maxFiles = 50;
  const maxSize = 20 * 1024 * 1024; // 20MB
  
  if (files.length > maxFiles) {
    return `Tối đa ${maxFiles} hình ảnh`;
  }
  
  for (const file of files) {
    // Check file size
    if (file.size > maxSize) {
      return `File "${file.name}" quá lớn (tối đa 20MB)`;
    }
    
    // Check MIME type
    if (!file.type.startsWith('image/')) {
      return `File "${file.name}" không phải hình ảnh hợp lệ`;
    }
    
    // Validate file extension
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !validExtensions.includes(ext)) {
      return `File "${file.name}" có định dạng không hợp lệ. Chỉ chấp nhận: ${validExtensions.join(', ')}`;
    }
    
    // Validate magic bytes (async)
    const isValidType = await validateFileType(file);
    if (!isValidType) {
      return `File "${file.name}" không phải là hình ảnh thực sự`;
    }
  }
  
  return null;
}

/**
 * Validate từng field riêng lẻ (cho real-time validation)
 */
export function validateField(field: keyof PendingFormData, value: any): string | null {
  switch (field) {
    case 'title':
      if (!value?.trim()) return "Tiêu đề dịch vụ là bắt buộc";
      if (value.trim().length < 3) return "Tiêu đề phải có ít nhất 3 ký tự";
      if (value.trim().length > 200) return "Tiêu đề không được quá 200 ký tự";
      break;
      
    case 'description':
      if (!value?.trim()) return "Mô tả dịch vụ là bắt buộc";
      if (value.trim().length < 10) return "Mô tả phải có ít nhất 10 ký tự";
      if (value.trim().length > 1000) return "Mô tả không được quá 1000 ký tự";
      break;
      
    case 'location':
      if (!value?.trim()) return "Địa điểm là bắt buộc";
      break;
      
    case 'price':
      if (!value?.trim()) return "Giá dịch vụ là bắt buộc";
      const numPrice = parseFloat(value.replace(/\D/g, ''));
      if (numPrice <= 0) return "Giá phải lớn hơn 0";
      break;
      
    case 'owner_name':
      if (!value?.trim()) return "Tên chủ sở hữu là bắt buộc";
      if (value.trim().length < 2) return "Tên chủ sở hữu phải có ít nhất 2 ký tự";
      break;
      
    case 'phone':
      if (!value?.trim()) return "Số điện thoại là bắt buộc";
      if (!validatePhone(value)) return "Số điện thoại không hợp lệ (ví dụ: +84123456789)";
      break;
      
    case 'email':
      if (!value?.trim()) return "Email là bắt buộc";
      if (!validateEmail(value)) return "Email không hợp lệ";
      break;
  }
  
  return null;
}

/**
 * Validate toàn bộ form
 */
export function validatePendingForm(
  form: PendingFormData,
  avatarFile: File | null,
  additionalFiles: File[]
): Record<string, string> {
  const errors: Record<string, string> = {};
  
  // Validate các field bắt buộc
  const requiredFields: (keyof PendingFormData)[] = [
    'title', 'description', 'location', 'price', 
    'owner_name', 'phone', 'email'
  ];
  
  requiredFields.forEach(field => {
    const error = validateField(field, form[field]);
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
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

// ===== FORMATTING =====

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
  const numericValue = value.replace(/\D/g, '');
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
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

// ===== FORM STATE =====

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

// ===== LOCAL STORAGE =====

const FORM_DRAFT_KEY = 'pending-service-draft';
const FORM_IMAGES_KEY = 'pending-service-images';

/**
 * Lưu draft form vào localStorage
 */
export function saveDraft(form: PendingFormData): void {
  try {
    localStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(form));
  } catch (err) {
    console.error('Failed to save draft:', err);
  }
}

/**
 * Load draft form từ localStorage
 */
export function loadDraft(): PendingFormData | null {
  try {
    const saved = localStorage.getItem(FORM_DRAFT_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (err) {
    console.error('Failed to load draft:', err);
    return null;
  }
}

/**
 * Xóa draft form
 */
export function clearDraft(): void {
  try {
    localStorage.removeItem(FORM_DRAFT_KEY);
    localStorage.removeItem(FORM_IMAGES_KEY);
  } catch (err) {
    console.error('Failed to clear draft:', err);
  }
}