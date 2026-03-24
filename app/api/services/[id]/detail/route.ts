import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const type = req.nextUrl.searchParams.get("type") || "";
    const supabase = await createServerSupabase();

    let service: any = null;
    if (type === "tour") {
      const { data, error } = await supabase
        .from("tour_with_reviews")
        .select("*")
        .eq("service_id", id)
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      service = data;
    } else {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("id", id)
        .eq("type", type)
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      service = data;
    }

    const region =
      type === "tour"
        ? service?.service_location || service?.tour_destination || ""
        : service?.location || "";

    let nearby: any[] = [];
    if (region) {
      const { data: locs } = await supabase
        .from("locations")
        .select("*")
        .ilike("region", `%${region}%`)
        .limit(6);
      nearby = locs || [];
    }

    const serviceId = type === "tour" ? service?.service_id : service?.id;
    const { data: reviewsRaw } = await supabase
      .from("service_reviews")
      .select(`
        id,
        rating,
        comment,
        user:profiles(full_name, username)
      `)
      .eq("service_id", serviceId)
      .order("created_at", { ascending: false })
      .limit(4);

    const reviews = (reviewsRaw || []).map((r: any) => ({
      ...r,
      user: Array.isArray(r.user) ? r.user[0] : r.user,
    }));

    return NextResponse.json({
      service,
      nearby,
      reviews,
    });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
