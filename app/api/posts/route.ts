import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const { caption, service_id, custom_service_link } = await req.json();

    if (!caption?.trim() && !service_id && !custom_service_link) {
      return NextResponse.json({ error: "Dữ liệu bài đăng không hợp lệ" }, { status: 400 });
    }

    const supabase = await createServerSupabase();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) {
      return NextResponse.json({ error: "Bạn cần đăng nhập" }, { status: 401 });
    }

    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        caption: caption || "",
        status: "pending",
        author_id: user.id,
        service_id: service_id || null,
        custom_service_link: custom_service_link || null,
      })
      .select()
      .single();

    if (error || !post) {
      return NextResponse.json(
        { error: error?.message || "Không thể tạo bài đăng" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: post });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
