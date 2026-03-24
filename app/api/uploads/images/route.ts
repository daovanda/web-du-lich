import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const bucketName = String(formData.get("bucketName") || "").trim();
    const folderPath = String(formData.get("folderPath") || "").trim();
    const files = formData.getAll("files").filter((item) => item instanceof File) as File[];

    if (!bucketName) {
      return NextResponse.json({ error: "Thiếu bucketName" }, { status: 400 });
    }

    const supabase = await createServerSupabase();
    const urls: string[] = [];

    for (const file of files) {
      const safeName = file.name.replace(/\s+/g, "-");
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;
      const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;

      const buffer = Buffer.from(await file.arrayBuffer());
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, buffer, {
          contentType: file.type || "application/octet-stream",
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) continue;

      const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      if (data?.publicUrl) urls.push(data.publicUrl);
    }

    return NextResponse.json({ data: urls });
  } catch {
    return NextResponse.json({ error: "Lỗi upload ảnh" }, { status: 500 });
  }
}
