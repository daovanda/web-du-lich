import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const searchParams = req.nextUrl.searchParams;

    const searchQuery = searchParams.get("searchQuery")?.trim() || "";
    const vehicleType = searchParams.get("vehicleType")?.trim() || "";
    const departureLocation = searchParams.get("departureLocation")?.trim() || "";
    const arrivalLocation = searchParams.get("arrivalLocation")?.trim() || "";

    let query = supabase.from("cars_view").select("*");

    if (searchQuery) {
      query = query.or(
        `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%,departure_location.ilike.%${searchQuery}%,arrival_location.ilike.%${searchQuery}%`
      );
    }

    if (vehicleType) query = query.eq("vehicle_type", vehicleType);
    if (departureLocation) query = query.eq("departure_location", departureLocation);
    if (arrivalLocation) query = query.eq("arrival_location", arrivalLocation);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
