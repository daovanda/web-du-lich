"use client";

import { useEffect, useState, useRef } from "react";
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
  const [isLoading, setIsLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // ✅ Prevent duplicate fetches
  const isFetchingRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  const fetchProfile = async (userId: string) => {
    // ✅ Debounce: Skip if already fetching same user
    if (isFetchingRef.current || lastUserIdRef.current === userId) {
      return;
    }

    isFetchingRef.current = true;
    lastUserIdRef.current = userId;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, username, avatar_url")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Lỗi khi lấy profile:", error.message);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setProfile(null);
    } finally {
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    let mounted = true; // ✅ Prevent state updates after unmount

    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        const {
          data: { session },
        } = await supabase.auth.getSession();
        
        if (!mounted) return; // ✅ Component unmounted, skip

        const currentUser = session?.user || null;
        setUser(currentUser);

        if (currentUser) {
          await fetchProfile(currentUser.id);
        } else {
          setProfile(null);
          lastUserIdRef.current = null;
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        if (mounted) {
          setIsLoading(false);
          // Trigger suggestions animation
          setTimeout(() => {
            if (mounted) setShowSuggestions(true);
          }, 100);
        }
      }
    };

    initializeAuth();

    // ✅ Auth listener with safeguards
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth event:", event); // Debug

      const currentUser = session?.user || null;
      const previousUserId = lastUserIdRef.current;

      // ✅ Only update if user actually changed
      if (currentUser?.id !== previousUserId) {
        setUser(currentUser);

        if (currentUser) {
          await fetchProfile(currentUser.id);
        } else {
          setProfile(null);
          lastUserIdRef.current = null;
          isFetchingRef.current = false;
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      isFetchingRef.current = false;
    };
  }, []); // ✅ Run only once

  return (
    <aside className="right-sidebar hidden lg:flex flex-col space-y-6 border-l border-gray-800 p-4 bg-black h-screen sticky top-0 overflow-y-auto">
      <div className="p-2">
        {isLoading ? (
          // Loading skeleton
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse flex-shrink-0" />
            <div className="min-w-0 max-w-[160px] space-y-2">
              <div className="h-4 bg-gray-700 rounded animate-pulse w-24" />
              <div className="h-3 bg-gray-700 rounded animate-pulse w-16" />
            </div>
          </div>
        ) : user ? (
          <div className="flex items-center space-x-3">
            {/* Avatar */}
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

            {/* User info */}
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

      {/* Suggestions with fade-in animation */}
      <div
        className={`transition-opacity duration-500 ${
          showSuggestions ? "opacity-100" : "opacity-0"
        }`}
      >
        <Suggestions />
      </div>

      <div className="p-4 text-xs text-gray-500 space-y-1">
        <p>© 2025 chagmihaydi</p>
        <p>Thông tin • Liên hệ • Chính sách</p>
      </div>
    </aside>
  );
}