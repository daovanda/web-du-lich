import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const searchQuery = req.nextUrl.searchParams.get("searchQuery")?.trim() || "";

    let query = supabase.from("tour_with_reviews").select(`
        service_id,
        title,
        description,
        service_location,
        price,
        image_url,
        images,
        average_rating,
        reviews_count,
        tour_destination,
        duration_days,
        start_date,
        end_date,
        available_slots,
        guide_name
      `);

    if (searchQuery) {
      query = query.or(
        `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,tour_destination.ilike.%${searchQuery}%,service_location.ilike.%${searchQuery}%`
      );
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
