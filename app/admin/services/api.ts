import { supabase } from "@/lib/supabase";
import { PendingService, Service } from "./types";
import { uploadImagesToBucket } from "./helpers";
/* ----------------------------- FETCHERS ----------------------------- */

export async function fetchPendingServices(): Promise<PendingService[]> {
  try {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .in("status", ["draft", "pending", "approved", "rejected"])
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
    let query = supabase
    .from("services")
    .select("*")
    .in("status", ["active", "inactive", "archived"])
    .order("created_at", { ascending: false });

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
    // 🔥 Chỉ query 1 bảng services
    const { data: sData, error: sError } = await supabase
      .from("services")
      .select("id, type, status");

    if (sError) {
      throw new Error(`Lỗi khi tải thống kê services: ${sError.message}`);
    }

    // 📊 Tổng số services (tất cả status)
    const totalServices = sData?.length || 0;

    // 📋 totalPending: draft + pending + rejected + approved
    const totalPending = sData?.filter((s: any) => 
      s.status === "draft" || 
      s.status === "pending" || 
      s.status === "approved" ||
      s.status === "rejected"
    ).length || 0;

    const totalConfirmed = sData?.filter((s: any) => 
      s.status === "active" || 
      s.status === "inactive" || 
      s.status === "archived"
    ).length || 0;

    // 📈 Thống kê theo type (stay, car, motorbike, tour)
    const byType: Record<string, number> = {};
    sData?.forEach((s: any) => {
      if (s.type) {
        byType[s.type] = (byType[s.type] || 0) + 1;
      }
    });


    console.log('📊 Stats:', {
      totalServices,
      totalPending,
      totalConfirmed,
      byType
    });

    return { 
      totalServices, 
      totalPending, 
      totalConfirmed, 
      byType
    };
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
    // 1️⃣ Lấy thông tin hiện tại
    const { data: currentData, error: fetchError } = await supabase
      .from("services") // 🔄 Đổi từ "pending_services" → "services"
      .select("status, rejected_reason, rejected_by, approved_by")
      .eq("id", id)
      .single();

    if (fetchError) {
      throw new Error(`Không thể lấy trạng thái hiện tại: ${fetchError.message}`);
    }
    if (!currentData) {
      throw new Error("Không tìm thấy dịch vụ cần cập nhật.");
    }

    // 2️⃣ Xác định status tiếp theo
    let nextStatus = newStatus;
    if (!newStatus) {
      // 🔄 Xoay vòng: draft → pending → approved → rejected → draft
      const order = ["draft", "pending", "approved", "rejected"];
      const currentIndex = order.indexOf(currentData.status);
      nextStatus = order[(currentIndex + 1) % order.length];
    }

    // 3️⃣ Chuẩn bị dữ liệu update
    const updates: any = { 
      status: nextStatus,
      updated_at: new Date().toISOString()
    };

    // 4️⃣ Logic xử lý theo status mới
    const userId = (await supabase.auth.getUser()).data.user?.id;

    if (nextStatus === "approved") {
      // ✅ Approve: set approved_by và approved_at
      updates.approved_by = userId;
      updates.approved_at = new Date().toISOString();
      
      // Reset rejection info nếu có
      if (currentData.rejected_by) {
        updates.rejected_by = null;
        updates.rejected_at = null;
        updates.rejected_reason = null;
      }
    } 
    else if (nextStatus === "rejected") {
      // ❌ Reject: giữ nguyên rejected_reason (sẽ set ở hàm rejectService)
      // Chỉ set rejected_by và rejected_at nếu chưa có
      if (!currentData.rejected_by) {
        updates.rejected_by = userId;
        updates.rejected_at = new Date().toISOString();
      }
    }
    else if (currentData.status === "rejected" && nextStatus !== "rejected") {
      // 🔄 Chuyển từ rejected sang status khác → reset rejection info
      updates.rejected_reason = null;
      updates.rejected_by = null;
      updates.rejected_at = null;
    }

    // 5️⃣ Update database
    const { error: updateError } = await supabase
      .from("services") // 🔄 Đổi từ "pending_services" → "services"
      .update(updates)
      .eq("id", id);

    if (updateError) {
      throw new Error(`Lỗi khi cập nhật trạng thái: ${updateError.message}`);
    }

    console.log(`✅ Updated service ${id}: ${currentData.status} → ${nextStatus}`);
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
    // 1️⃣ Lấy thông tin user hiện tại
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError) throw new Error(`Lỗi xác thực: ${authError.message}`);
    
    const userId = userData?.user?.id ?? null;

    // 2️⃣ Xử lý amenities an toàn
    const amenitiesArray = serviceForm.amenities && serviceForm.amenities.trim()
      ? serviceForm.amenities
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
          .map((name: string) => ({ name }))
      : [];

    // 3️⃣ Chuẩn bị dữ liệu để insert (CHƯA CÓ ảnh)
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
      
      // 🆕 owner_id thay vì admin_id
      owner_id: userId,
    };

    // 4️⃣ Validate required fields
    if (!insertData.title) throw new Error("Tiêu đề dịch vụ là bắt buộc");
    if (!insertData.description) throw new Error("Mô tả dịch vụ là bắt buộc");
    if (!insertData.location) throw new Error("Địa điểm là bắt buộc");
    if (!insertData.price) throw new Error("Giá dịch vụ là bắt buộc");
    if (!insertData.owner_name) throw new Error("Tên chủ sở hữu là bắt buộc");
    if (!insertData.phone) throw new Error("Số điện thoại là bắt buộc");
    if (!insertData.email) throw new Error("Email là bắt buộc");

    // 5️⃣ Insert record TRƯỚC để lấy ID
    const { data: insertedData, error: insertError } = await supabase
      .from("services") // 🔄 Đổi từ "pending_services" → "services"
      .insert([insertData])
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      throw new Error(`Lỗi khi thêm dịch vụ: ${insertError.message}`);
    }

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

    // 7️⃣ Update lại record với URLs của ảnh
    if (imageUrl || additionalImageUrls.length > 0) {
      const { error: updateError } = await supabase
        .from("services") // 🔄 Đổi từ "pending_services" → "services"
        .update({
          image_url: imageUrl,
          images: additionalImageUrls
        })
        .eq("id", serviceId);

      if (updateError) {
        console.error('Update images error:', updateError);
        // Không throw error ở đây vì record đã được tạo
        console.warn('⚠️ Dịch vụ đã được tạo nhưng không thể cập nhật ảnh');
      } else {
        console.log('✅ Updated images for service:', serviceId);
      }
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
/* ----------------------------- APPROVE / REJECT ----------------------------- */

export async function approvePendingAsService(
  serviceId: string,
  approveForm: any,
  avatarFile: File | null,
  additionalFiles: File[]
) {
  try {
    // 1️⃣ Lấy thông tin service hiện tại
    const { data: currentService, error: fetchError } = await supabase
      .from("services")
      .select("*")
      .eq("id", serviceId)
      .single();

    if (fetchError) {
      throw new Error(`Không thể lấy thông tin service: ${fetchError.message}`);
    }
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

    // 5️⃣ Lấy thông tin người phê duyệt
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError) {
      throw new Error(`Lỗi xác thực: ${authError.message}`);
    }
    const userId = userData?.user?.id ?? null;

    // 6️⃣ UPDATE service: đổi status + cập nhật thông tin
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
      approved_by: userId,
      approved_at: new Date().toISOString(),
      
      // Reset rejection info nếu có
      rejected_by: null,
      rejected_at: null,
      rejected_reason: null,
      
      // Timestamp
      updated_at: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from("services")
      .update(updateData)
      .eq("id", serviceId);

    if (updateError) {
      console.error('Update service error:', updateError);
      throw new Error(`Lỗi khi phê duyệt service: ${updateError.message}`);
    }

    console.log(`✅ Approved service ${serviceId} - Status: approved - Images in ${bucketName}/${serviceId}/`);
  } catch (error) {
    console.error('approveServiceAsActive error:', error);
    throw error;
  }
}

export async function rejectPendingService(id: string, reason: string) {
  try {
    // 1️⃣ Lấy thông tin user hiện tại
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError) throw new Error(`Lỗi xác thực: ${authError.message}`);
    
    const userId = userData?.user?.id;
    if (!userId) throw new Error("Not authenticated");

    // 2️⃣ Kiểm tra lý do từ chối
    if (!reason || reason.trim() === "") {
      throw new Error("Lý do từ chối không được để trống");
    }

    // 3️⃣ Update service với rejected status
    const { error } = await supabase
      .from("services") // 🔄 Đổi từ "pending_services" → "services"
      .update({
        status: "rejected",
        rejected_by: userId,
        rejected_at: new Date().toISOString(),
        rejected_reason: reason.trim(),
        // Reset approval info nếu có
        approved_by: null,
        approved_at: null,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      console.error("Reject service error:", error);
      throw new Error(`Lỗi khi từ chối dịch vụ: ${error.message}`);
    }

    console.log(`❌ Rejected service ${id}: ${reason}`);
  } catch (error) {
    console.error("rejectService error:", error);
    throw error;
  }
}



/* ----------------------------- UPDATE PENDING SERVICE ----------------------------- */
export async function updatePendingService(id: string, updatedData: Partial<PendingService>) {
  try {
    const { error } = await supabase
      .from("services")
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
      .from("services")
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
        .from("services")
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
        .from("services")
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

