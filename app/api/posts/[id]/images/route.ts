import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { urls } = await req.json();

    if (!Array.isArray(urls)) {
      return NextResponse.json({ error: "urls phải là mảng" }, { status: 400 });
    }

    if (urls.length === 0) {
      return NextResponse.json({ success: true });
    }

    const supabase = await createServerSupabase();
    const { error } = await supabase.from("post_images").insert(
      urls.map((url: string, index: number) => ({
        post_id: id,
        image_url: url,
        order_index: index,
      }))
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
