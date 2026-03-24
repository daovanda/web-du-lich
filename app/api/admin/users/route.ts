import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function GET() {
  try {
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

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    const userIds = (profiles || []).map((u) => u.id);
    if (userIds.length === 0) {
      return NextResponse.json({
        users: [],
        stats: {},
      });
    }

    const [services, bookings, serviceReviews, locationReviews] = await Promise.all([
      supabase.from("services").select("owner_id").in("owner_id", userIds),
      supabase.from("bookings").select("user_id").in("user_id", userIds),
      supabase.from("service_reviews").select("user_id").in("user_id", userIds),
      supabase.from("reviews").select("user_id").in("user_id", userIds),
    ]);

    const hasError =
      services.error || bookings.error || serviceReviews.error || locationReviews.error;
    if (hasError) {
      return NextResponse.json(
        {
          error:
            services.error?.message ||
            bookings.error?.message ||
            serviceReviews.error?.message ||
            locationReviews.error?.message ||
            "Không thể tải thống kê người dùng",
        },
        { status: 500 }
      );
    }

    const stats: Record<
      string,
      {
        services_count: number;
        bookings_count: number;
        service_reviews_count: number;
        location_reviews_count: number;
      }
    > = {};

    const init = (id: string) => {
      if (!stats[id]) {
        stats[id] = {
          services_count: 0,
          bookings_count: 0,
          service_reviews_count: 0,
          location_reviews_count: 0,
        };
      }
    };

    services.data?.forEach((row) => {
      init(row.owner_id);
      stats[row.owner_id].services_count += 1;
    });
    bookings.data?.forEach((row) => {
      init(row.user_id);
      stats[row.user_id].bookings_count += 1;
    });
    serviceReviews.data?.forEach((row) => {
      init(row.user_id);
      stats[row.user_id].service_reviews_count += 1;
    });
    locationReviews.data?.forEach((row) => {
      init(row.user_id);
      stats[row.user_id].location_reviews_count += 1;
    });

    return NextResponse.json({
      users: profiles || [],
      stats,
    });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
