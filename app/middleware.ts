import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Nếu không có user → chuyển sang login
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Lấy role trong profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  // Nếu không phải admin → về trang chủ
  if (!profile || profile.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return res;
}

// Áp dụng middleware cho /admin/*
export const config = {
  matcher: ["/admin/:path*"],
};
