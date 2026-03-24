import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const searchParams = req.nextUrl.searchParams;

    const searchQuery = searchParams.get("searchQuery")?.trim() || "";
    const location = searchParams.get("location")?.trim() || "";
    const minGuests = searchParams.get("minGuests");
    const maxGuests = searchParams.get("maxGuests");
    const minRooms = searchParams.get("minRooms");
    const maxRooms = searchParams.get("maxRooms");
    const minBeds = searchParams.get("minBeds");
    const maxBeds = searchParams.get("maxBeds");
    const priceRange = searchParams.get("priceRange") || "all";
    const sortBy = searchParams.get("sortBy") || "default";
    const includeLocations = searchParams.get("includeLocations") === "true";

    let query = supabase.from("stays_view").select("*");

    if (searchQuery) {
      query = query.or(
        `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`
      );
    }
    if (location) query = query.eq("location", location);
    if (minGuests && minGuests !== "0") query = query.gte("max_guests", Number(minGuests));
    if (maxGuests) query = query.lte("max_guests", Number(maxGuests));
    if (minRooms && minRooms !== "0") query = query.gte("number_of_rooms", Number(minRooms));
    if (maxRooms) query = query.lte("number_of_rooms", Number(maxRooms));
    if (minBeds && minBeds !== "0") query = query.gte("number_of_beds", Number(minBeds));
    if (maxBeds) query = query.lte("number_of_beds", Number(maxBeds));

    if (priceRange !== "all") {
      if (priceRange === "under1m") query = query.lt("price", 1000000);
      if (priceRange === "1m-3m") {
        query = query.gte("price", 1000000).lte("price", 3000000);
      }
      if (priceRange === "over3m") query = query.gt("price", 3000000);
    }

    if (sortBy === "price-asc") query = query.order("price", { ascending: true });
    else if (sortBy === "price-desc") query = query.order("price", { ascending: false });

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const payload: { data: unknown[]; locations?: string[] } = { data: data || [] };

    if (includeLocations) {
      const uniqueLocations = [
        ...new Set(
          (data || [])
            .map((item) => (typeof item.location === "string" ? item.location : ""))
            .filter(Boolean)
        ),
      ] as string[];
      payload.locations = uniqueLocations.sort();
    }

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
