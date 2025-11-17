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
}

/**
 * Toggle tỉnh: thêm nếu chưa có, xóa nếu đã có
 */
export async function toggleProvince(
  userId: string,
  provinceId: string
): Promise<ToggleProvinceResult> {
  // Check nếu đã tồn tại
  const { data: existing } = await supabase
    .from('visited_provinces')
    .select('id')
    .eq('user_id', userId)
    .eq('province_id', provinceId)
    .single();

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
}

/**
 * Cập nhật ghi chú cho tỉnh
 */
export async function updateProvinceNotes(
  visitedProvinceId: string,
  notes: string
): Promise<VisitedProvince | null> {
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
}

/**
 * Upload ảnh lên Supabase Storage
 */
export async function uploadProvincePhoto(
  file: File,
  userId: string,
  provinceId: string
): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${provinceId}/${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('province-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading photo:', uploadError);
      return null;
    }

    // Lấy public URL
    const { data: urlData } = supabase.storage
      .from('province-photos')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
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
}

/**
 * Cập nhật thông tin ảnh
 */
export async function updatePhoto(
  photoId: string,
  updates: { title?: string; note?: string }
): Promise<ProvincePhoto | null> {
  const { data, error } = await supabase
    .from('province_photos')
    .update(updates)
    .eq('id', photoId)
    .select()
    .single();

  if (error) {
    console.error('Error updating photo:', error);
    return null;
  }

  return data;
}

/**
 * Xóa ảnh (cả storage và database)
 */
export async function deletePhoto(
  photoId: string,
  imageUrl: string
): Promise<boolean> {
  try {
    // Extract file path from URL
    const urlParts = imageUrl.split('/province-photos/');
    if (urlParts.length < 2) {
      console.error('Invalid image URL format');
      return false;
    }
    const filePath = urlParts[1];

    // Xóa từ storage
    const { error: storageError } = await supabase.storage
      .from('province-photos')
      .remove([filePath]);

    if (storageError) {
      console.error('Error deleting from storage:', storageError);
    }

    // Xóa từ database
    const { error: dbError } = await supabase
      .from('province_photos')
      .delete()
      .eq('id', photoId);

    if (dbError) {
      console.error('Error deleting photo record:', dbError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete photo error:', error);
    return false;
  }
}