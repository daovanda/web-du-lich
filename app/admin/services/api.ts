// api.ts
import { supabase } from "@/lib/supabase";
import { PendingService, Service } from "./types";
import { uploadImagesToBucket } from "./helpers";

/* ----------------------------- FETCHERS ----------------------------- */

export async function fetchPendingServices(): Promise<PendingService[]> {
  const { data, error } = await supabase
    .from("pending_services")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchPendingServices error:", error);
    return [];
  }
  return (data || []) as PendingService[];
}

export async function fetchServices(
  search: string,
  typeFilter: string,
  statusFilter: string
): Promise<Service[]> {
  let query = supabase.from("services").select("*").order("created_at", { ascending: false });

  if (typeFilter !== "all") query = query.eq("type", typeFilter);
  if (statusFilter !== "all") query = query.eq("status", statusFilter);

  if (search.trim()) {
    const q = `%${search.trim()}%`;
    query = query.or(`title.ilike.${q},location.ilike.${q}`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("fetchServices error:", error);
    return [];
  }
  return (data || []) as Service[];
}

export async function fetchStats() {
  const { data: sData } = await supabase.from("services").select("id, type, status");
  const { data: pData } = await supabase.from("pending_services").select("id, status");

  const totalServices = sData?.length || 0;
  const totalPending =
    pData?.filter((p: any) => p.status === "new" || p.status === "pending").length || 0;
  const totalConfirmed =
    sData?.filter((s: any) => s.status === "active" || s.type).length || 0;

  const byType: Record<string, number> = {};
  sData?.forEach((s: any) => {
    byType[s.type] = (byType[s.type] || 0) + 1;
  });

  return { totalServices, totalPending, totalConfirmed, byType };
}

/* ----------------------------- PENDING ACTIONS ----------------------------- */

export async function updatePendingStatus(id: string, status: string) {
  const { error } = await supabase.from("pending_services").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function addPendingService(pendingForm: any, files: File[]) {
  const urls = await uploadImagesToBucket(files, "pending_services_images");
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id ?? null;

  const amenitiesArray = pendingForm.amenities
    ? pendingForm.amenities
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean)
        .map((name: string) => ({ name }))
    : [];

  const { error } = await supabase.from("pending_services").insert([
    {
      ...pendingForm,
      amenities: amenitiesArray,
      status: "new", // ✅ luôn là new khi tạo
      images: urls,
      admin_id: userId,
    },
  ]);

  if (error) throw new Error(error.message);
}


/* ----------------------------- OFFICIAL ACTIONS ----------------------------- */

export async function addOfficialService(officialForm: any, files: File[]) {
  const urls = await uploadImagesToBucket(files, "services_images");
  const amenitiesArray = officialForm.amenities
    .split(",")
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 0)
    .map((name: string) => ({ name }));

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id ?? null;

  const { error } = await supabase.from("services").insert([
    {
      title: officialForm.title,
      description: officialForm.description,
      type: officialForm.type,
      location: officialForm.location,
      price: officialForm.price,
      images: urls,
      amenities: amenitiesArray,
      owner_id: userId,
      status: "active",
      approved_by: userId,
      approved_at: new Date().toISOString(),
    },
  ]);

  if (error) throw new Error(error.message);
}

/* ----------------------------- APPROVE / REJECT ----------------------------- */

export async function approvePendingAsService(
  selectedPending: PendingService,
  approveForm: any,
  files: File[]
) {
  // 1️⃣ Upload ảnh mới được chọn thêm khi duyệt (không bao gồm ảnh đã có trong form.images)
  const uploaded = files.length > 0 ? await uploadImagesToBucket(files, "services_images") : [];

  // 2️⃣ Gộp tất cả ảnh (ảnh đã lưu trong pending + ảnh mới upload khi approve)
  const combinedImages = [...(approveForm.images || []), ...uploaded];

  // 3️⃣ Chuẩn hóa tiện ích thành dạng JSON
  const amenitiesArray = approveForm.amenities
    ? approveForm.amenities
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean)
        .map((name: string) => ({ name }))
    : [];

  // 4️⃣ Lấy thông tin người phê duyệt
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id ?? null;

  // 5️⃣ Insert vào bảng services
  const { error: insertErr } = await supabase.from("services").insert([
    {
      title: approveForm.title,
      description: approveForm.description,
      type: approveForm.type,
      location: approveForm.location,
      price: approveForm.price,
      images: combinedImages,
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
    },
  ]);

  if (insertErr) throw new Error(`Insert service failed: ${insertErr.message}`);

  // 6️⃣ Xóa khỏi pending sau khi chuyển
  const { error: deleteErr } = await supabase
    .from("pending_services")
    .delete()
    .eq("id", selectedPending.id);

  if (deleteErr) throw new Error(`Delete pending failed: ${deleteErr.message}`);
}


export async function rejectPendingService(selectedPending: PendingService, reason: string) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id ?? null;

  const { error } = await supabase
    .from("pending_services")
    .update({
      status: "new",
      rejected_reason: reason,
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", selectedPending.id);

  if (error) throw new Error(error.message);
}

export async function toggleServiceStatus(svc: Service, targetStatus: string) {
  const { error } = await supabase
    .from("services")
    .update({ status: targetStatus })
    .eq("id", svc.id);

  if (error) throw new Error(error.message);
}

/* ----------------------------- UPDATE PENDING SERVICE ----------------------------- */
export async function updatePendingService(id: string, updatedData: Partial<PendingService>) {
  const { error } = await supabase
    .from("pending_services")
    .update(updatedData)
    .eq("id", id);

  if (error) throw new Error(`Failed to update pending service: ${error.message}`);
}


export async function removePendingImage(pendingId: string, imageUrl: string) {
  const { data: current, error: getErr } = await supabase
    .from("pending_services")
    .select("images")
    .eq("id", pendingId)
    .single();

  if (getErr) throw new Error(getErr.message);

  const updatedImages = (current.images || []).filter((img: string) => img !== imageUrl);

  const { error: updateErr } = await supabase
    .from("pending_services")
    .update({ images: updatedImages })
    .eq("id", pendingId);

  if (updateErr) throw new Error(updateErr.message);
}

export async function fetchDetailedStats() {
  const { data: servicesData, error: sErr } = await supabase
    .from("services")
    .select("type, status");

  const { data: pendingData, error: pErr } = await supabase
    .from("pending_services")
    .select("type, status");

  if (sErr || pErr) throw new Error("Failed to fetch detailed stats");

  const byType: Record<string, any> = {};
  const byStatus: Record<string, number> = {};

  [...(servicesData || []), ...(pendingData || [])].forEach((s: any) => {
    byType[s.type] = byType[s.type] || { total: 0, active: 0, inactive: 0, pending: 0 };
    byType[s.type].total++;
    byType[s.type][s.status] = (byType[s.type][s.status] || 0) + 1;

    byStatus[s.status] = (byStatus[s.status] || 0) + 1;
  });

  return { byType, byStatus };
}

