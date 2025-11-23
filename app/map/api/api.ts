// app/map/api/api.ts
import { supabase } from '@/lib/supabase';
import type { VisitedProvince, ProvincePhoto, ToggleProvinceResult } from '../types/types';

// ==========================================
// VISITED PROVINCES OPERATIONS
// ==========================================

/**
 * Lấy tất cả tỉnh đã ghé của user
 */
export async function getUserVisitedProvinces(userId: string) {
  try {
    const { data, error } = await supabase
      .from('visited_provinces')
      .select(`
        *,
        photos:province_photos(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching visited provinces:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in getUserVisitedProvinces:', error);
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
    // Check nếu đã tồn tại
    const { data: existing, error: checkError } = await supabase
      .from('visited_provinces')
      .select('id')
      .eq('user_id', userId)
      .eq('province_id', provinceId)
      .maybeSingle(); // ✅ Use maybeSingle() instead of single()

    if (checkError) {
      console.error('Error checking province:', checkError);
      return { success: false, action: 'removed', error: checkError };
    }

    if (existing) {
      // Xóa nếu đã tồn tại (cascade sẽ xóa photos)
      const { error } = await supabase
        .from('visited_provinces')
        .delete()
        .eq('id', existing.id);

      if (error) {
        console.error('Error removing province:', error);
        return { success: false, action: 'removed', error };
      }

      return { success: true, action: 'removed', id: existing.id };
    } else {
      // Thêm mới
      const { data, error } = await supabase
        .from('visited_provinces')
        .insert({
          user_id: userId,
          province_id: provinceId,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding province:', error);
        return { success: false, action: 'added', error };
      }

      return { success: true, action: 'added', data };
    }
  } catch (error) {
    console.error('Unexpected error in toggleProvince:', error);
    return { 
      success: false, 
      action: 'removed', 
      error: error as any 
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
    const { data, error } = await supabase
      .from('visited_provinces')
      .update({ notes })
      .eq('id', visitedProvinceId)
      .select()
      .single();

    if (error) {
      console.error('Error updating province notes:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in updateProvinceNotes:', error);
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
    const { data, error } = await supabase
      .from('province_photos')
      .select('*')
      .eq('visited_province_id', visitedProvinceId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching photos:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in getProvincePhotos:', error);
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
    // ✅ Validate inputs
    if (!file || !userId || !provinceId) {
      console.error('Missing required parameters');
      return null;
    }

    // ✅ Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type:', file.type);
      return null;
    }

    // ✅ Validate file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      console.error('File too large:', file.size);
      return null;
    }

    // ✅ Get file extension
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    
    // ✅ Allowed extensions
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (!allowedExtensions.includes(fileExt)) {
      console.error('Invalid file extension:', fileExt);
      return null;
    }

    // ✅ Generate unique filename với timestamp và random string
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}_${randomStr}.${fileExt}`;

    // ✅ Construct file path: userid/province_id/filename.ext
    const filePath = `${userId}/${provinceId}/${fileName}`;

    console.log('📤 Uploading to path:', filePath);

    // ✅ Upload file to province_photos bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('province_photos') // ✅ Bucket name với underscore
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false, // Don't overwrite existing files
      });

    if (uploadError) {
      console.error('❌ Error uploading photo:', uploadError);
      return null;
    }

    console.log('✅ Upload successful:', uploadData);

    // ✅ Get public URL
    const { data: urlData } = supabase.storage
      .from('province_photos')
      .getPublicUrl(filePath);

    if (!urlData || !urlData.publicUrl) {
      console.error('❌ Failed to get public URL');
      return null;
    }

    console.log('✅ Public URL:', urlData.publicUrl);
    return urlData.publicUrl;
    
  } catch (error) {
    console.error('❌ Upload error:', error);
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
    const { data, error } = await supabase
      .from('province_photos')
      .insert({
        visited_province_id: visitedProvinceId,
        user_id: userId,
        image_url: imageUrl,
        title,
        note,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding photo:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in addProvincePhoto:', error);
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
    // ✅ Clean up updates - convert empty strings to null
    const cleanUpdates: any = {};
    
    if ('title' in updates) {
      cleanUpdates.title = updates.title?.trim() || null;
    }
    
    if ('note' in updates) {
      cleanUpdates.note = updates.note?.trim() || null;
    }

    const { data, error } = await supabase
      .from('province_photos')
      .update(cleanUpdates)
      .eq('id', photoId)
      .select()
      .single();

    if (error) {
      console.error('Error updating photo:', error);
      return null;
    }

    console.log('✅ Photo updated successfully');
    return data;
  } catch (error) {
    console.error('Unexpected error in updatePhoto:', error);
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
    // ✅ Extract file path from URL - hỗ trợ cả hai format
    let filePath: string | null = null;
    
    // Try province_photos first (new format)
    let urlParts = imageUrl.split('/province_photos/');
    if (urlParts.length === 2) {
      filePath = urlParts[1];
    } else {
      // Fallback to province-photos (old format)
      urlParts = imageUrl.split('/province-photos/');
      if (urlParts.length === 2) {
        filePath = urlParts[1];
      }
    }

    if (!filePath) {
      console.error('❌ Invalid image URL format:', imageUrl);
      return false;
    }

    console.log('🗑️ Deleting file at path:', filePath);

    // ✅ Try to delete from new bucket first
    let storageError = null;
    const { error: error1 } = await supabase.storage
      .from('province_photos')
      .remove([filePath]);

    if (error1) {
      // If failed, try old bucket
      const { error: error2 } = await supabase.storage
        .from('province-photos')
        .remove([filePath]);
      
      storageError = error2;
    }

    if (storageError) {
      console.error('⚠️ Error deleting from storage:', storageError);
      // Continue to delete from database even if storage delete fails
    } else {
      console.log('✅ Deleted from storage');
    }

    // ✅ Delete from database
    const { error: dbError } = await supabase
      .from('province_photos')
      .delete()
      .eq('id', photoId);

    if (dbError) {
      console.error('❌ Error deleting photo record:', dbError);
      return false;
    }

    console.log('✅ Deleted from database');
    return true;
    
  } catch (error) {
    console.error('❌ Delete photo error:', error);
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
    const folderPath = `${userId}/${provinceId}`;
    
    const { data, error } = await supabase.storage
      .from('province_photos')
      .list(folderPath);

    if (error) {
      console.error('Error listing photos:', error);
      return [];
    }

    return data?.map(file => `${folderPath}/${file.name}`) || [];
    
  } catch (error) {
    console.error('List error:', error);
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
      // Optional: Compress before upload
      // const compressedFile = await compressImage(files[i]);
      // const imageUrl = await uploadProvincePhoto(compressedFile, userId, provinceId);
      
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