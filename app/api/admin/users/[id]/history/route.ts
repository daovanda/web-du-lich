import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { data: me, error: meError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (meError) {
      return NextResponse.json({ error: meError.message }, { status: 500 });
    }
    if (me?.role !== "admin") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const [servicesRes, bookingsRes, serviceReviewsRes, locationReviewsRes] = await Promise.all([
      supabase.from("services").select("id, title, type, created_at").eq("owner_id", id),
      supabase
        .from("bookings")
        .select("id, service_id, status, date_from, date_to, created_at")
        .eq("user_id", id),
      supabase
        .from("service_reviews")
        .select("id, rating, comment, created_at, service_id")
        .eq("user_id", id),
      supabase
        .from("reviews")
        .select("id, rating, comment, created_at, location_id")
        .eq("user_id", id),
    ]);

    const firstError =
      servicesRes.error ||
      bookingsRes.error ||
      serviceReviewsRes.error ||
      locationReviewsRes.error;

    if (firstError) {
      return NextResponse.json({ error: firstError.message }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        services: servicesRes.data ?? [],
        bookings: bookingsRes.data ?? [],
        service_reviews: serviceReviewsRes.data ?? [],
        location_reviews: locationReviewsRes.data ?? [],
      },
    });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
