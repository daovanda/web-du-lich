import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const status = typeof body?.status === "string" ? body.status : null;
    const reason = typeof body?.reason === "string" ? body.reason : null;

    if (!status) {
      return NextResponse.json({ error: "Thiếu trạng thái mới" }, { status: 400 });
    }

    const supabase = await createServerSupabase();
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id || null;

    const updates: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === "approved" || status === "active") {
      updates.approved_by = userId;
      updates.approved_at = new Date().toISOString();
      updates.rejected_by = null;
      updates.rejected_at = null;
      updates.rejected_reason = null;
    }

    if (status === "rejected") {
      if (!reason?.trim()) {
        return NextResponse.json({ error: "Lý do từ chối là bắt buộc" }, { status: 400 });
      }
      updates.rejected_by = userId;
      updates.rejected_at = new Date().toISOString();
      updates.rejected_reason = reason.trim();
      updates.approved_by = null;
      updates.approved_at = null;
    }

    if (status !== "rejected" && reason) {
      updates.rejected_reason = null;
      updates.rejected_by = null;
      updates.rejected_at = null;
    }

    const { error } = await supabase.from("services").update(updates).eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
