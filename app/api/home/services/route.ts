import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("services")
      .select(`
        id,
        title,
        description,
        image_url,
        price,
        type,
        location,
        average_rating,
        reviews_count,
        status,
        created_at
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
