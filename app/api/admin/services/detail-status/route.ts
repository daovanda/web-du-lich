import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

const TABLE_BY_TYPE: Record<string, string> = {
  stay: "stays",
  car: "cars",
  motorbike: "motorbikes",
  tour: "tours",
};

export async function POST(req: NextRequest) {
  try {
    const { services } = await req.json();

    if (!Array.isArray(services)) {
      return NextResponse.json({ error: "services phải là mảng" }, { status: 400 });
    }

    const grouped: Record<string, string[]> = {
      stay: [],
      car: [],
      motorbike: [],
      tour: [],
    };

    services.forEach((svc: { id?: string; type?: string }) => {
      if (svc?.id && svc?.type && grouped[svc.type]) grouped[svc.type].push(svc.id);
    });

    const supabase = await createServerSupabase();
    const result: Record<string, boolean> = {};

    for (const [type, ids] of Object.entries(grouped)) {
      if (ids.length === 0) continue;
      const tableName = TABLE_BY_TYPE[type];
      const { data, error } = await supabase.from(tableName).select("id").in("id", ids);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      ids.forEach((id) => {
        result[id] = data?.some((row) => row.id === id) || false;
      });
    }

    return NextResponse.json({ data: result });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
