import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createServerSupabase();

    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("id, type")
      .eq("id", id)
      .single();

    if (serviceError || !service) {
      return NextResponse.json({ error: "Không tìm thấy dịch vụ" }, { status: 404 });
    }

    let tourDurationDays: number | null = null;
    if (service.type?.toLowerCase() === "tour") {
      const { data: tourData } = await supabase
        .from("tours")
        .select("duration_days")
        .eq("id", id)
        .single();
      tourDurationDays = tourData?.duration_days ?? null;
    }

    return NextResponse.json({
      data: {
        serviceType: service.type?.toLowerCase() ?? null,
        tourDurationDays,
      },
    });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
