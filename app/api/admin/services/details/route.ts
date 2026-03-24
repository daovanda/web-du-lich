import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

const TABLE_BY_TYPE: Record<string, string> = {
  stay: "stays",
  car: "cars",
  motorbike: "motorbikes",
  tour: "tours",
};

const UPDATABLE_FIELDS: Record<string, string[]> = {
  stay: ["accommodation_type", "max_guests", "number_of_rooms", "number_of_beds", "price_per_night"],
  car: [
    "route",
    "departure_location",
    "arrival_location",
    "seats",
    "vehicle_type",
    "departure_time",
    "arrival_time",
    "duration_hours",
  ],
  motorbike: ["brand", "model", "engine_size", "bike_type", "year"],
  tour: ["destination", "duration_days", "start_date", "end_date", "available_slots", "guide_name", "itinerary"],
};

export async function GET(req: NextRequest) {
  try {
    const serviceId = req.nextUrl.searchParams.get("serviceId");
    const type = req.nextUrl.searchParams.get("type");

    if (!serviceId || !type || !TABLE_BY_TYPE[type]) {
      return NextResponse.json({ error: "Thiếu hoặc sai tham số" }, { status: 400 });
    }

    const tableName = TABLE_BY_TYPE[type];
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .eq("id", serviceId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { serviceId, type, payload } = await req.json();

    if (!serviceId || !type || !TABLE_BY_TYPE[type]) {
      return NextResponse.json({ error: "Thiếu hoặc sai tham số" }, { status: 400 });
    }

    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ error: "Payload không hợp lệ" }, { status: 400 });
    }

    const tableName = TABLE_BY_TYPE[type];
    const allowed = new Set(UPDATABLE_FIELDS[type] || []);
    const sanitizedPayload = Object.fromEntries(
      Object.entries(payload).filter(([key]) => allowed.has(key))
    );

    if (Object.keys(sanitizedPayload).length === 0) {
      return NextResponse.json({ error: "Không có trường hợp lệ để cập nhật" }, { status: 400 });
    }

    const supabase = await createServerSupabase();

    const { data: existing, error: checkError } = await supabase
      .from(tableName)
      .select("id")
      .eq("id", serviceId)
      .maybeSingle();

    if (checkError) {
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (existing) {
      const { error } = await supabase
        .from(tableName)
        .update(sanitizedPayload)
        .eq("id", serviceId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      const { error } = await supabase.from(tableName).insert({ id: serviceId, ...sanitizedPayload });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
