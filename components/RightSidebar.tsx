"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Suggestions from "@/components/Suggestions";

type Profile = {
  full_name?: string;
  username?: string;
  avatar_url?: string;
};

export default function RightSidebar({ width }: { width: number }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const fetchProfile = async (currentUser: any) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, username, avatar_url")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (error) {
      console.error("Lỗi khi lấy profile:", error.message);
      setProfile(null);
    } else {
      setProfile(data);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);
      fetchProfile(currentUser);
    };
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      fetchProfile(currentUser);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <aside className="right-sidebar hidden lg:flex flex-col space-y-6 border-l border-gray-800 p-4 bg-black h-screen sticky top-0 overflow-y-auto">
      <div className="p-2">
        {user ? (
          <div className="flex items-center space-x-3">
            {/* Ảnh đại diện */}
            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg font-semibold">
                  {profile?.username?.[0]?.toUpperCase() ||
                    user.email?.[0]?.toUpperCase() ||
                    "U"}
                </div>
              )}
            </div>

            {/* Tên hiển thị */}
            <div className="min-w-0 max-w-[160px]">
              <p className="font-semibold break-words whitespace-normal">
                {profile?.username || user.email || "Người dùng"}
              </p>
              <Link
                href="/profile"
                className="text-sm text-gray-400 hover:underline"
              >
                Xem hồ sơ
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <Link
              href="/login"
              className="text-xl font-semibold text-white block text-left w-full py-2 px-3 rounded-lg hover:bg-gray-900 transition mt-2"
            >
              Đăng nhập
            </Link>
          </div>
        )}
      </div>

      <Suggestions />

      <div className="p-4 text-xs text-gray-500 space-y-1">
        <p>© 2025 chagmihaydi</p>
        <p>Thông tin • Liên hệ • Chính sách</p>
      </div>
    </aside>
  );
}
