import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

async function ensureAdmin() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { supabase, error: NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 }) };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return { supabase, error: NextResponse.json({ error: profileError.message }, { status: 500 }) };
  }

  if (profile?.role !== "admin") {
    return { supabase, error: NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 }) };
  }

  return { supabase, error: null as NextResponse<unknown> | null };
}

export async function GET(req: NextRequest) {
  try {
    const { supabase, error: authError } = await ensureAdmin();
    if (authError) return authError;

    const filterStatus = req.nextUrl.searchParams.get("status") || "all";
    const filterPayoutStatus = req.nextUrl.searchParams.get("payoutStatus") || "all";
    const search = req.nextUrl.searchParams.get("search")?.trim() || "";
    const startDate = req.nextUrl.searchParams.get("startDate");
    const endDate = req.nextUrl.searchParams.get("endDate");

    let query = supabase.from("bookings_view").select("*").order("created_at", { ascending: false });

    if (filterStatus !== "all") {
      query = query.eq("status", filterStatus);
    }

    if (filterPayoutStatus !== "all") {
      query = query.eq("payout_status", filterPayoutStatus);
    }

    if (search) {
      const q = search.replace(/,/g, " ");
      query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%,service_title.ilike.%${q}%`);
    }

    if (startDate) {
      query = query.gte("date_from", startDate);
    }
    if (endDate) {
      query = query.lte("date_from", endDate);
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
