import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const mode = req.nextUrl.searchParams.get("mode") || "official";
    const search = req.nextUrl.searchParams.get("search")?.trim() || "";
    const typeFilter = req.nextUrl.searchParams.get("typeFilter") || "all";
    const statusFilter = req.nextUrl.searchParams.get("statusFilter") || "all";

    const supabase = await createServerSupabase();
    let query = supabase.from("services").select("*").order("created_at", { ascending: false });

    if (mode === "pending") {
      query = query.in("status", ["draft", "pending", "approved", "rejected"]);
    } else {
      query = query.in("status", ["active", "inactive", "archived"]);
      if (typeFilter !== "all") query = query.eq("type", typeFilter);
      if (statusFilter !== "all") query = query.eq("status", statusFilter);
      if (search) {
        const q = `%${search}%`;
        query = query.or(`title.ilike.${q},location.ilike.${q},description.ilike.${q}`);
      }
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

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const supabase = await createServerSupabase();
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id ?? null;

    const insertData = {
      ...payload,
      owner_id: payload.owner_id ?? userId,
    };

    const { data, error } = await supabase
      .from("services")
      .insert([insertData])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
