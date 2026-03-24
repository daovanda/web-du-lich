import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const authorId = req.nextUrl.searchParams.get("authorId");
    if (!authorId) {
      return NextResponse.json({ error: "Thiếu authorId" }, { status: 400 });
    }

    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }
    if (authorId !== user.id) {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("posts")
      .select(`
        id,
        caption,
        created_at,
        status,
        author_id,
        custom_service_link,
        service:services(id, title, type),
        images:post_images(image_url)
      `)
      .eq("author_id", authorId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
