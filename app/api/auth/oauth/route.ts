import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

type OAuthProvider = "google" | "facebook" | "apple";

const ALLOWED_PROVIDERS: OAuthProvider[] = ["google", "facebook", "apple"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const provider = String(body?.provider || "").trim() as OAuthProvider;
    const redirectTo = String(body?.redirectTo || "").trim();

    if (!ALLOWED_PROVIDERS.includes(provider)) {
      return NextResponse.json({ error: "Provider không hợp lệ" }, { status: 400 });
    }

    if (!redirectTo) {
      return NextResponse.json({ error: "Thiếu redirectTo" }, { status: 400 });
    }

    const supabase = await createServerSupabase();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error || !data?.url) {
      return NextResponse.json(
        { error: error?.message || "Không thể khởi tạo OAuth" },
        { status: 400 }
      );
    }

    return NextResponse.json({ data: { url: data.url } });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
