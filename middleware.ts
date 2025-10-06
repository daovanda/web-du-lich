// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  console.log("🟢 [Middleware] Triggered at:", req.nextUrl.pathname);

  // Tạo response mặc định
  const res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Tạo Supabase client tương thích với API mới
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll().map(({ name, value }) => ({ name, value }));
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // ✅ Kiểm tra session hiện tại
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("❌ [Supabase getUser error]:", error.message);
  }

  // Nếu chưa đăng nhập và đang vào /admin → chuyển sang login
  if (!user && req.nextUrl.pathname.startsWith("/admin")) {
    console.warn("⚠️ [Middleware] No user → redirect to /login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Nếu có user → kiểm tra role
  if (user) {
    const { data: profile, error: roleError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (roleError) {
      console.error("❌ [Middleware] Profile fetch error:", roleError.message);
    }

    const role = profile?.role || "user";
    console.log("👤 Role:", role);

    if (role !== "admin" && req.nextUrl.pathname.startsWith("/admin")) {
      console.warn("🚫 [Middleware] User not admin → redirect home");
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
