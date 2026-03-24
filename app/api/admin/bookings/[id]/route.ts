import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

const ALLOWED_UPDATE_FIELDS = new Set([
  "status",
  "deposit_status",
  "deposit_paid_at",
  "payment_status",
  "payout_status",
  "payout_proof_url",
  "refund_status",
  "refund_amount",
  "refund_proof_url",
  "refund_processed_at",
  "notes",
]);

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

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, error: authError } = await ensureAdmin();
    if (authError) return authError;

    const { id } = await context.params;
    const { data, error } = await supabase.from("bookings").select("*").eq("id", id).maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Không tìm thấy booking" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, error: authError } = await ensureAdmin();
    if (authError) return authError;

    const { id } = await context.params;
    const payload = await req.json();

    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ error: "Payload không hợp lệ" }, { status: 400 });
    }

    const sanitized = Object.fromEntries(
      Object.entries(payload).filter(([key]) => ALLOWED_UPDATE_FIELDS.has(key))
    );

    if (Object.keys(sanitized).length === 0) {
      return NextResponse.json({ error: "Không có trường hợp lệ để cập nhật" }, { status: 400 });
    }

    const { error } = await supabase.from("bookings").update(sanitized).eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
