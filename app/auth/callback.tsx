"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/apiClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  // Retry nhẹ để chờ profile sync sau OAuth callback.
  const getMeWithRetry = async (retries = 5) => {
    for (let i = 0; i < retries; i++) {
      const response = await apiRequest<{
        data: { user: { id: string; email: string | null } | null; profile: { role?: string } | null };
      }>("/api/auth/me", {
        fallbackMessage: "Không thể lấy thông tin đăng nhập",
      });
      if (response.data.user) {
        return response.data;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    return null;
  };

  useEffect(() => {
    const handleRedirect = async () => {
      const me = await getMeWithRetry();
      if (!me?.user) {
        router.replace("/login");
        return;
      }

      if (me.profile?.role === "admin") {
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
