"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import ChatWidget from "./ChatWidget";
import ChatAdminPanel from "./ChatAdminPanel";

export default function ChatSection() {
  const supabase = useSupabase();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setRole(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setRole(profile?.role || user.user_metadata?.role || "user");
    };

    fetchRole();
  }, [supabase]);

  if (role === "admin") return <ChatAdminPanel />;
  return <ChatWidget />;
}
