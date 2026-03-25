// components/chat/ChatSection.tsx
"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/apiClient";
import ChatWidget from "./ChatWidget";
import ChatAdminPanel from "./ChatAdminPanel";

export default function ChatSection() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest<{
          data: {
            user: { id: string; email: string | null } | null;
            profile: { role?: string | null } | null;
          };
        }>("/api/auth/me");
        setRole(res.data.user ? (res.data.profile?.role || "user") : null);
      } catch {
        setRole(null);
      }
    })();
  }, []);

  // Chưa resolve → không render gì để tránh layout shift
  if (role === null) return null;

  if (role === "admin") return <ChatAdminPanel />;
  return <ChatWidget />;
}