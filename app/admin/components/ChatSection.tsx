"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/apiClient";
import ChatWidget from "./ChatWidget";
import ChatAdminPanel from "./ChatAdminPanel";

export default function ChatSection() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await apiRequest<{
          data: { user: { id: string; email: string | null } | null; profile: { role?: string | null } | null };
        }>("/api/auth/me");
        if (!response.data.user) {
          setRole(null);
          return;
        }
        setRole(response.data.profile?.role || "user");
      } catch {
        setRole(null);
      }
    };

    void fetchRole();
  }, []);

  if (role === "admin") return <ChatAdminPanel />;
  return <ChatWidget />;
}
