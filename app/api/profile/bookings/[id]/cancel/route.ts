import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const payload = await req.json();
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const updates: Record<string, unknown> = {
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    };

    if (payload?.withRefund) {
      updates.refund_status = "requested";
      updates.refund_amount = payload.refundAmount;
      updates.refund_requested_at = new Date().toISOString();
      updates.refund_reason = payload.reason || null;
    }

    const { error } = await supabase
      .from("bookings")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: { success: true, updates } });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
