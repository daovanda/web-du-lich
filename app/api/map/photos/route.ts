import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const visitedProvinceId = String(req.nextUrl.searchParams.get("visitedProvinceId") || "").trim();
    if (!visitedProvinceId) {
      return NextResponse.json({ error: "Thiếu visitedProvinceId" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("province_photos")
      .select("*")
      .eq("visited_province_id", visitedProvinceId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const visitedProvinceId = String(body?.visitedProvinceId || "").trim();
    const imageUrl = String(body?.imageUrl || "").trim();
    const title =
      typeof body?.title === "string" && body.title.trim().length > 0
        ? body.title.trim()
        : null;
    const note =
      typeof body?.note === "string" && body.note.trim().length > 0
        ? body.note.trim()
        : null;

    if (!visitedProvinceId || !imageUrl) {
      return NextResponse.json(
        { error: "Thiếu visitedProvinceId hoặc imageUrl" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("province_photos")
      .insert({
        visited_province_id: visitedProvinceId,
        user_id: user.id,
        image_url: imageUrl,
        title,
        note,
      })
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
