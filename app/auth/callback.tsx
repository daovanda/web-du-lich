"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  // Hàm lấy profile có retry (đợi trigger insert xong)
  const getProfileWithRetry = async (userId: string, retries = 5) => {
    for (let i = 0; i < retries; i++) {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (profile) return profile;
      // chờ 0.5s rồi thử lại
      await new Promise((r) => setTimeout(r, 500));
    }
    return null;
  };

  useEffect(() => {
    const handleRedirect = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      // Lấy profile (có retry)
      const profile = await getProfileWithRetry(user.id);

      if (profile?.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    };

    handleRedirect();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <p className="text-gray-400">Đang xử lý đăng nhập...</p>
    </div>
  );
}
