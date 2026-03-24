import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) return NextResponse.json({ data: [] });

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id, user_id, service_id, date_from, date_to, total_price, 
        payment_status, deposit_status, deposit_amount, deposit_proof_url,
        payment_proof_url, status, created_at, cancelled_at,
        deposit_paid_at, deposit_payment_method, payment_method,
        refund_status, refund_amount, refund_proof_url, 
        refund_requested_at, refund_processed_at, refund_reason,
        quantity, booking_code,
        services(title, type, image_url)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: data || [] });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
