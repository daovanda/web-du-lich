import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.from("services").select("id, type, status");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const totalServices = data?.length || 0;
    const totalPending =
      data?.filter(
        (s) =>
          s.status === "draft" ||
          s.status === "pending" ||
          s.status === "approved" ||
          s.status === "rejected"
      ).length || 0;
    const totalConfirmed =
      data?.filter(
        (s) => s.status === "active" || s.status === "inactive" || s.status === "archived"
      ).length || 0;

    const byType: Record<string, number> = {};
    data?.forEach((s) => {
      if (s.type) byType[s.type] = (byType[s.type] || 0) + 1;
    });

    return NextResponse.json({
      totalServices,
      totalPending,
      totalConfirmed,
      byType,
    });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
