import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const searchParams = req.nextUrl.searchParams;

    const searchQuery = searchParams.get("searchQuery")?.trim() || "";
    const bikeType = searchParams.get("bikeType")?.trim() || "";
    const location = searchParams.get("location")?.trim() || "";
    const minEngineSize = searchParams.get("minEngineSize");
    const maxEngineSize = searchParams.get("maxEngineSize");
    const minYear = searchParams.get("minYear");
    const maxYear = searchParams.get("maxYear");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const includeLocations = searchParams.get("includeLocations") === "true";
    const sortBy = searchParams.get("sortBy") || "default";

    let query = supabase.from("motorbikes_view").select("*");

    if (searchQuery) {
      query = query.or(
        `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%`
      );
    }

    if (bikeType) query = query.eq("bike_type", bikeType);
    if (location) query = query.eq("location", location);
    if (minEngineSize && minEngineSize !== "0") query = query.gte("engine_size", Number(minEngineSize));
    if (maxEngineSize) query = query.lte("engine_size", Number(maxEngineSize));
    if (minYear && minYear !== "2000") query = query.gte("year", Number(minYear));
    if (maxYear) query = query.lte("year", Number(maxYear));
    if (minPrice) query = query.gte("price", Number(minPrice));
    if (maxPrice && maxPrice !== "500000") query = query.lte("price", Number(maxPrice));

    if (sortBy === "price-asc") query = query.order("price", { ascending: true });
    else if (sortBy === "price-desc") query = query.order("price", { ascending: false });
    else query = query.order("id", { ascending: true });

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const payload: { data: unknown[]; locations?: string[]; topLocations?: string[] } = {
      data: data || [],
    };

    if (includeLocations) {
      const locationCount: Record<string, number> = {};
      (data || []).forEach((service) => {
        const location = typeof service.location === "string" ? service.location : "";
        if (location) {
          locationCount[location] = (locationCount[location] || 0) + 1;
        }
      });
      payload.locations = Object.keys(locationCount).sort();
      payload.topLocations = Object.entries(locationCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([location]) => location);
    }

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
