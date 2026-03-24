import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

type CreateBookingPayload = {
  serviceId?: string;
  dateFrom?: string | null;
  dateTo?: string | null;
  quantity?: number | null;
  fullName?: string;
  phone?: string;
  note?: string | null;
  totalPrice?: number | null;
  depositAmount?: number | null;
  depositPercentage?: number | null;
  paymentStatus?: string;
  paymentMethod?: string;
  depositStatus?: string;
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Bạn cần đăng nhập để đặt dịch vụ" }, { status: 401 });
    }

    const payload = (await req.json()) as CreateBookingPayload;

    if (!payload.serviceId || !payload.fullName || !payload.phone) {
      return NextResponse.json({ error: "Thiếu thông tin đặt dịch vụ" }, { status: 400 });
    }

    const { data: inserted, error: insertError } = await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        service_id: payload.serviceId,
        booking_code: `BK${Date.now().toString(36).toUpperCase()}${Math.random()
          .toString(36)
          .substring(2, 6)
          .toUpperCase()}`,
        date_from: payload.dateFrom ?? null,
        date_to: payload.dateTo ?? null,
        quantity: payload.quantity ?? null,
        full_name: payload.fullName,
        phone: payload.phone,
        additional_requests: payload.note ?? null,
        status: "pending",
        total_price: payload.totalPrice ?? null,
        deposit_amount: payload.depositAmount ?? null,
        deposit_percentage: payload.depositPercentage ?? 30,
        payment_status: payload.paymentStatus ?? "unpaid",
        payment_method: payload.paymentMethod ?? "bank_transfer",
        deposit_status: payload.depositStatus ?? "unpaid",
      })
      .select("id, booking_code, user_id")
      .single();

    if (insertError || !inserted) {
      return NextResponse.json(
        { error: insertError?.message || "Không thể tạo booking" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: inserted }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
