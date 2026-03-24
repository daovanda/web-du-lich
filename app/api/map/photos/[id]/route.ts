import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

function extractStoragePath(imageUrl: string): string | null {
  const newFormat = imageUrl.split("/province_photos/");
  if (newFormat.length === 2) return newFormat[1];

  const oldFormat = imageUrl.split("/province-photos/");
  if (oldFormat.length === 2) return oldFormat[1];

  return null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const updates: { title?: string | null; note?: string | null } = {};

    if ("title" in body) {
      updates.title =
        typeof body.title === "string" && body.title.trim().length > 0
          ? body.title.trim()
          : null;
    }

    if ("note" in body) {
      updates.note =
        typeof body.note === "string" && body.note.trim().length > 0
          ? body.note.trim()
          : null;
    }

    const { data, error } = await supabase
      .from("province_photos")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const imageUrl = String(req.nextUrl.searchParams.get("imageUrl") || "").trim();
    if (!imageUrl) {
      return NextResponse.json({ error: "Thiếu imageUrl" }, { status: 400 });
    }

    const filePath = extractStoragePath(imageUrl);
    if (!filePath) {
      return NextResponse.json({ error: "URL ảnh không hợp lệ" }, { status: 400 });
    }

    const { error: removeNewError } = await supabase.storage
      .from("province_photos")
      .remove([filePath]);

    if (removeNewError) {
      await supabase.storage.from("province-photos").remove([filePath]);
    }

    const { error: deleteError } = await supabase
      .from("province_photos")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
