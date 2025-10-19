import { supabase } from "@/lib/supabase";
import { PendingService, Service } from "./types";

// Helper function để upload ảnh
async function uploadImagesToBucket(files: File[], bucketName: string): Promise<string[]> {
  try {
    const uploadPromises = files.map(async (file, index) => {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${index}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        throw new Error(`Lỗi khi upload file ${file.name}: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error(`Không thể lấy URL công khai cho file ${file.name}`);
      }

      return urlData.publicUrl;
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    console.log(`Successfully uploaded ${uploadedUrls.length} images to bucket ${bucketName}`);
    
    return uploadedUrls;
  } catch (error) {
    console.error('uploadImagesToBucket error:', error);
    throw error;
  }
}

/* ----------------------------- FETCHERS ----------------------------- */

export async function fetchPendingServices(): Promise<PendingService[]> {
  try {
    const { data, error } = await supabase
      .from("pending_services")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("fetchPendingServices error:", error);
      throw new Error(`Lỗi khi tải danh sách dịch vụ chờ duyệt: ${error.message}`);
    }
    return (data || []) as PendingService[];
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
    let query = supabase.from("services").select("*").order("created_at", { ascending: false });

    if (typeFilter !== "all") query = query.eq("type", typeFilter);
    if (statusFilter !== "all") query = query.eq("status", statusFilter);

    if (search.trim()) {
      const q = `%${search.trim()}%`;
      query = query.or(`title.ilike.${q},location.ilike.${q},description.ilike.${q}`);
    }

    const { data, error } = await query;
    if (error) {
      console.error("fetchServices error:", error);
      throw new Error(`Lỗi khi tải danh sách dịch vụ: ${error.message}`);
    }
    return (data || []) as Service[];
  } catch (error) {
    console.error("fetchServices error:", error);
    return [];
  }
}

export async function fetchStats() {
  try {
    const { data: sData, error: sError } = await supabase.from("services").select("id, type, status");
    const { data: pData, error: pError } = await supabase.from("pending_services").select("id, status");

    if (sError) throw new Error(`Lỗi khi tải thống kê services: ${sError.message}`);
    if (pError) throw new Error(`Lỗi khi tải thống kê pending: ${pError.message}`);

    const totalServices = sData?.length || 0;
    const totalPending = pData?.filter((p: any) => p.status === "new" || p.status === "pending").length || 0;
    const totalConfirmed = sData?.filter((s: any) => s.status === "active").length || 0;

    const byType: Record<string, number> = {};
    sData?.forEach((s: any) => {
      byType[s.type] = (byType[s.type] || 0) + 1;
    });

    return { totalServices, totalPending, totalConfirmed, byType };
  } catch (error) {
    console.error("fetchStats error:", error);
    return { totalServices: 0, totalPending: 0, totalConfirmed: 0, byType: {} };
  }
}

/* ----------------------------- PENDING ACTIONS ----------------------------- */

export async function updatePendingStatus(id: string, status: string) {
  try {
    const { error } = await supabase
      .from("pending_services")
      .update({ status })
      .eq("id", id);

    if (error) throw new Error(`Lỗi khi cập nhật trạng thái: ${error.message}`);
  } catch (error) {
    console.error("updatePendingStatus error:", error);
    throw error;
  }
}

export async function addPendingService(
  pendingForm: any, 
  avatarFile: File | null, 
  additionalFiles: File[]
) {
  try {
    // Upload ảnh đại diện và ảnh phụ
    let imageUrl: string | null = null; // Ảnh đại diện
    let additionalImageUrls: string[] = []; // Chỉ các ảnh phụ

    // Upload avatar trước (sẽ làm ảnh đại diện)
    if (avatarFile) {
      const avatarUrls = await uploadImagesToBucket([avatarFile], "pending_services_images");
      imageUrl = avatarUrls[0] || null; // Lưu ảnh đầu tiên làm ảnh đại diện
    }

    // Upload các ảnh bổ sung
    if (additionalFiles && additionalFiles.length > 0) {
      const additionalUrls = await uploadImagesToBucket(additionalFiles, "pending_services_images");
      additionalImageUrls = [...additionalImageUrls, ...additionalUrls];
    }

    // Lấy thông tin user hiện tại
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError) throw new Error(`Lỗi xác thực: ${authError.message}`);
    
    const userId = userData?.user?.id ?? null;

    // Xử lý amenities an toàn
    const amenitiesArray = pendingForm.amenities && pendingForm.amenities.trim()
      ? pendingForm.amenities
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
          .map((name: string) => ({ name }))
      : [];

    // Chuẩn bị dữ liệu để insert
    const insertData = {
      title: pendingForm.title.trim(),
      type: pendingForm.type,
      description: pendingForm.description?.trim() || null,
      location: pendingForm.location?.trim() || null,
      price: pendingForm.price?.trim() || null,
      image_url: imageUrl, // Ảnh đại diện (chỉ 1 URL)
      images: additionalImageUrls, // Chỉ các ảnh phụ (không bao gồm ảnh đại diện)
      amenities: amenitiesArray,
      owner_name: pendingForm.owner_name?.trim() || null,
      phone: pendingForm.phone?.trim() || null,
      email: pendingForm.email?.trim() || null,
      facebook: pendingForm.facebook?.trim() || null,
      zalo: pendingForm.zalo?.trim() || null,
      tiktok: pendingForm.tiktok?.trim() || null,
      instagram: pendingForm.instagram?.trim() || null,
      status: "new",
      source: pendingForm.source || "form",
      admin_id: userId,
    };

    // Validate required fields
    if (!insertData.title) throw new Error("Tiêu đề dịch vụ là bắt buộc");
    if (!insertData.description) throw new Error("Mô tả dịch vụ là bắt buộc");
    if (!insertData.location) throw new Error("Địa điểm là bắt buộc");
    if (!insertData.price) throw new Error("Giá dịch vụ là bắt buộc");
    if (!insertData.owner_name) throw new Error("Tên chủ sở hữu là bắt buộc");
    if (!insertData.phone) throw new Error("Số điện thoại là bắt buộc");
    if (!insertData.email) throw new Error("Email là bắt buộc");

    const { error } = await supabase.from("pending_services").insert([insertData]);

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error(`Lỗi khi thêm dịch vụ: ${error.message}`);
    }
  } catch (error) {
    console.error('addPendingService error:', error);
    throw error;
  }
}

/* ----------------------------- OFFICIAL ACTIONS ----------------------------- */

export async function addOfficialService(
  officialForm: any, 
  avatarFile: File | null, 
  additionalFiles: File[]
) {
  try {
    // Upload ảnh đại diện và ảnh phụ
    let imageUrl: string | null = null;
    let additionalUrls: string[] = [];

    // Upload avatar trước (sẽ làm ảnh đại diện)
    if (avatarFile) {
      const avatarUrls = await uploadImagesToBucket([avatarFile], "services_images");
      imageUrl = avatarUrls[0] || null;
    }

    // Upload các ảnh bổ sung
    if (additionalFiles && additionalFiles.length > 0) {
      additionalUrls = await uploadImagesToBucket(additionalFiles, "services_images");
    }

    const amenitiesArray = officialForm.amenities && officialForm.amenities.trim()
      ? officialForm.amenities
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
          .map((name: string) => ({ name }))
      : [];

    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError) throw new Error(`Lỗi xác thực: ${authError.message}`);
    
    const userId = userData?.user?.id ?? null;

    const insertData = {
      title: officialForm.title.trim(),
      description: officialForm.description?.trim() || null,
      type: officialForm.type,
      location: officialForm.location?.trim() || null,
      price: officialForm.price?.trim() || null,
      image_url: imageUrl, // Ảnh đại diện
      images: additionalUrls, // Các ảnh phụ
      amenities: amenitiesArray,
      owner_id: userId,
      status: "active",
      approved_by: userId,
      approved_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("services").insert([insertData]);

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error(`Lỗi khi thêm dịch vụ chính thức: ${error.message}`);
    }
  } catch (error) {
    console.error('addOfficialService error:', error);
    throw error;
  }
}

/* ----------------------------- APPROVE / REJECT ----------------------------- */

export async function approvePendingAsService(
  selectedPending: PendingService,
  approveForm: any,
  avatarFile: File | null,
  additionalFiles: File[]
) {
  try {
    // 1️⃣ Upload ảnh mới được chọn thêm khi duyệt
    let newImageUrl: string | null = null;
    let newAdditionalUrls: string[] = [];

    // Upload avatar mới
    if (avatarFile) {
      const avatarUrls = await uploadImagesToBucket([avatarFile], "services_images");
      newImageUrl = avatarUrls[0] || null;
    }

    // Upload các ảnh bổ sung mới
    if (additionalFiles && additionalFiles.length > 0) {
      newAdditionalUrls = await uploadImagesToBucket(additionalFiles, "services_images");
    }

    // 2️⃣ Xử lý ảnh từ pending_services
    const pendingImageUrl = selectedPending.image_url; // Ảnh đại diện từ pending
    const pendingImages = selectedPending.images || []; // Các ảnh phụ từ pending
    
    // Ảnh đại diện: ưu tiên ảnh mới upload, nếu không có thì lấy từ pending
    const finalImageUrl = newImageUrl || pendingImageUrl;
    
    // Các ảnh phụ: gộp ảnh từ pending + ảnh mới upload
    const combinedImages = [...pendingImages, ...newAdditionalUrls];

    // 3️⃣ Chuẩn hóa tiện ích thành dạng JSON
    const amenitiesArray = approveForm.amenities && approveForm.amenities.trim()
      ? approveForm.amenities
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
          .map((name: string) => ({ name }))
      : [];

    // 4️⃣ Lấy thông tin người phê duyệt
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError) throw new Error(`Lỗi xác thực: ${authError.message}`);
    
    const userId = userData?.user?.id ?? null;

    // 5️⃣ Insert vào bảng services
    const insertData = {
      title: approveForm.title.trim(),
      description: approveForm.description?.trim() || null,
      type: approveForm.type,
      location: approveForm.location?.trim() || null,
      price: approveForm.price?.trim() || null,
      image_url: finalImageUrl, // Ảnh đại diện (chỉ 1 URL)
      images: combinedImages, // Các ảnh phụ (không bao gồm ảnh đại diện)
      amenities: amenitiesArray,

      // 🧑‍💻 Liên hệ & chủ dịch vụ
      owner_name: selectedPending.owner_name || null,
      phone: selectedPending.phone || null,
      email: selectedPending.email || null,
      facebook: selectedPending.facebook || null,
      zalo: selectedPending.zalo || null,
      tiktok: selectedPending.tiktok || null,
      instagram: selectedPending.instagram || null,

      // 👤 Ai phê duyệt và ai là chủ
      owner_id: selectedPending.admin_id ?? userId,
      approved_by: userId,
      approved_at: new Date().toISOString(),

      // 📡 Trạng thái
      status: "active",
    };

    const { error: insertErr } = await supabase.from("services").insert([insertData]);

    if (insertErr) {
      console.error('Insert service error:', insertErr);
      throw new Error(`Lỗi khi tạo dịch vụ: ${insertErr.message}`);
    }

    // 6️⃣ Xóa khỏi pending sau khi chuyển thành công
    const { error: deleteErr } = await supabase
      .from("pending_services")
      .delete()
      .eq("id", selectedPending.id);

    if (deleteErr) {
      console.error('Delete pending error:', deleteErr);
      throw new Error(`Lỗi khi xóa dịch vụ chờ duyệt: ${deleteErr.message}`);
    }
  } catch (error) {
    console.error('approvePendingAsService error:', error);
    throw error;
  }
}

export async function rejectPendingService(selectedPending: PendingService, reason: string) {
  try {
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError) throw new Error(`Lỗi xác thực: ${authError.message}`);
    
    const userId = userData?.user?.id ?? null;

    if (!reason.trim()) {
      throw new Error("Lý do từ chối không được để trống");
    }

    const { error } = await supabase
      .from("pending_services")
      .update({
        status: "new",
        rejected_reason: reason.trim(),
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", selectedPending.id);

    if (error) {
      console.error('Reject pending error:', error);
      throw new Error(`Lỗi khi từ chối dịch vụ: ${error.message}`);
    }
  } catch (error) {
    console.error('rejectPendingService error:', error);
    throw error;
  }
}

export async function toggleServiceStatus(svc: Service, targetStatus: string) {
  try {
    const { error } = await supabase
      .from("services")
      .update({ status: targetStatus })
      .eq("id", svc.id);

    if (error) {
      console.error('Toggle service status error:', error);
      throw new Error(`Lỗi khi cập nhật trạng thái dịch vụ: ${error.message}`);
    }
  } catch (error) {
    console.error('toggleServiceStatus error:', error);
    throw error;
  }
}

/* ----------------------------- UPDATE PENDING SERVICE ----------------------------- */
export async function updatePendingService(id: string, updatedData: Partial<PendingService>) {
  try {
    const { error } = await supabase
      .from("pending_services")
      .update(updatedData)
      .eq("id", id);

    if (error) {
      console.error('Update pending service error:', error);
      throw new Error(`Lỗi khi cập nhật dịch vụ chờ duyệt: ${error.message}`);
    }
  } catch (error) {
    console.error('updatePendingService error:', error);
    throw error;
  }
}

export async function removePendingImage(pendingId: string, imageUrl: string) {
  try {
    const { data: current, error: getErr } = await supabase
      .from("pending_services")
      .select("image_url, images")
      .eq("id", pendingId)
      .single();

    if (getErr) {
      console.error('Get pending images error:', getErr);
      throw new Error(`Lỗi khi lấy thông tin hình ảnh: ${getErr.message}`);
    }

    // Kiểm tra xem ảnh cần xóa có phải là ảnh đại diện không
    if (current.image_url === imageUrl) {
      // Nếu là ảnh đại diện, xóa image_url và cập nhật images
      const updatedImages = (current.images || []).filter((img: string) => img !== imageUrl);
      const newImageUrl = updatedImages.length > 0 ? updatedImages[0] : null;
      const finalImages = updatedImages.slice(1); // Bỏ ảnh đầu tiên khỏi images

      const { error: updateErr } = await supabase
        .from("pending_services")
        .update({ 
          image_url: newImageUrl,
          images: finalImages 
        })
        .eq("id", pendingId);

      if (updateErr) {
        console.error('Update pending images error:', updateErr);
        throw new Error(`Lỗi khi cập nhật hình ảnh: ${updateErr.message}`);
      }
    } else {
      // Nếu là ảnh phụ, chỉ xóa khỏi images
      const updatedImages = (current.images || []).filter((img: string) => img !== imageUrl);

      const { error: updateErr } = await supabase
        .from("pending_services")
        .update({ images: updatedImages })
        .eq("id", pendingId);

      if (updateErr) {
        console.error('Update pending images error:', updateErr);
        throw new Error(`Lỗi khi cập nhật hình ảnh: ${updateErr.message}`);
      }
    }
  } catch (error) {
    console.error('removePendingImage error:', error);
    throw error;
  }
}

export async function fetchDetailedStats() {
  try {
    const { data: servicesData, error: sErr } = await supabase
      .from("services")
      .select("type, status");

    const { data: pendingData, error: pErr } = await supabase
      .from("pending_services")
      .select("type, status");

    if (sErr) throw new Error(`Lỗi khi tải thống kê services: ${sErr.message}`);
    if (pErr) throw new Error(`Lỗi khi tải thống kê pending: ${pErr.message}`);

    const byType: Record<string, any> = {};
    const byStatus: Record<string, number> = {};

    [...(servicesData || []), ...(pendingData || [])].forEach((s: any) => {
      byType[s.type] = byType[s.type] || { total: 0, active: 0, inactive: 0, pending: 0 };
      byType[s.type].total++;
      byType[s.type][s.status] = (byType[s.type][s.status] || 0) + 1;

      byStatus[s.status] = (byStatus[s.status] || 0) + 1;
    });

    return { byType, byStatus };
  } catch (error) {
    console.error('fetchDetailedStats error:', error);
    throw error;
  }
}

/* ----------------------------- HELPER FUNCTIONS ----------------------------- */

// Helper function để validate phone number
export function validatePhoneNumber(phone: string): boolean {
  const cleanPhone = phone.replace(/\s/g, '');
  const phoneRegex = /^(\+84|84|0)[0-9]{9,10}$/;
  return phoneRegex.test(cleanPhone);
}

// Helper function để format phone number
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('84')) {
    return '+' + cleaned;
  } else if (cleaned.startsWith('0')) {
    return '+84' + cleaned.slice(1);
  }
  return phone;
}

// Helper function để validate email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function để sanitize string input
export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}