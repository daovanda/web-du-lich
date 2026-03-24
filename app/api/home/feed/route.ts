import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const searchParams = req.nextUrl.searchParams;
    const limit = Number(searchParams.get("limit") || "5");
    const cursor = searchParams.get("cursor");
    const search = (searchParams.get("search") || "").trim();

    let query = supabase
      .from("posts")
      .select(`
        id,
        caption,
        created_at,
        custom_service_link,
        author:profiles(id, username, avatar_url),
        service:services(id, title, type),
        images:post_images(id, image_url)
      `)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (cursor) query = query.lt("created_at", cursor);
    if (search) query = query.ilike("caption", `%${search}%`);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: sessionData } = await supabase.auth.getSession();
    return NextResponse.json({
      posts: data || [],
      user: sessionData.session?.user || null,
    });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
