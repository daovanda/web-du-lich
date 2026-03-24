import { NextResponse } from "next/server";
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

export async function GET() {
  try {
    const { supabase, error: authError } = await ensureAdmin();
    if (authError) return authError;

    const [
      { count: total, error: totalError },
      { count: pending, error: pendingError },
      { count: confirmed, error: confirmedError },
      { count: cancelled, error: cancelledError },
      { count: partnerPending, error: partnerPendingError },
      { count: partnerPaid, error: partnerPaidError },
      { count: partnerFailed, error: partnerFailedError },
    ] = await Promise.all([
      supabase.from("bookings_view").select("*", { count: "exact", head: true }),
      supabase.from("bookings_view").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("bookings_view").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
      supabase.from("bookings_view").select("*", { count: "exact", head: true }).eq("status", "cancelled"),
      supabase.from("bookings_view").select("*", { count: "exact", head: true }).eq("payout_status", "pending"),
      supabase.from("bookings_view").select("*", { count: "exact", head: true }).eq("payout_status", "paid"),
      supabase.from("bookings_view").select("*", { count: "exact", head: true }).eq("payout_status", "failed"),
    ]);

    const firstError =
      totalError ||
      pendingError ||
      confirmedError ||
      cancelledError ||
      partnerPendingError ||
      partnerPaidError ||
      partnerFailedError;

    if (firstError) {
      return NextResponse.json({ error: firstError.message }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        total: total ?? 0,
        pending: pending ?? 0,
        confirmed: confirmed ?? 0,
        cancelled: cancelled ?? 0,
        partner_pending: partnerPending ?? 0,
        partner_paid: partnerPaid ?? 0,
        partner_failed: partnerFailed ?? 0,
      },
    });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
