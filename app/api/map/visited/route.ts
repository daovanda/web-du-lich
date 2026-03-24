import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("visited_provinces")
      .select("*, photos:province_photos(*)")
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
    const provinceId = String(body?.provinceId || "").trim();
    if (!provinceId) {
      return NextResponse.json({ error: "Thiếu provinceId" }, { status: 400 });
    }

    const { data: existing, error: checkError } = await supabase
      .from("visited_provinces")
      .select("id")
      .eq("user_id", user.id)
      .eq("province_id", provinceId)
      .maybeSingle();

    if (checkError) {
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (existing) {
      const { error: deleteError } = await supabase
        .from("visited_provinces")
        .delete()
        .eq("id", existing.id);

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }

      return NextResponse.json({
        data: { success: true, action: "removed", id: existing.id },
      });
    }

    const { data: inserted, error: insertError } = await supabase
      .from("visited_provinces")
      .insert({
        user_id: user.id,
        province_id: provinceId,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      data: { success: true, action: "added", data: inserted },
    });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
