// helpers.ts
import { supabase } from "@/lib/supabase";

/** 
 * Upload danh sách ảnh lên Supabase Storage và trả về URL công khai 
 */
export async function uploadImagesToBucket(
  files: File[],
  bucket: string
): Promise<string[]> {
  if (!files || files.length === 0) return [];

  const urls: string[] = [];

  for (const file of files) {
    try {
      const fileExt = file.name.split(".").pop();
      const safeName = file.name.replace(/\s+/g, "-");
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError.message);
        continue;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
      if (data?.publicUrl) urls.push(data.publicUrl);
    } catch (err) {
      console.error("Upload exception:", err);
    }
  }

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
