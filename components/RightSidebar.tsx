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
    <aside className="hidden lg:flex flex-col space-y-6 border-l border-gray-800 p-4 bg-black h-screen sticky top-0 overflow-y-auto">
      <div className="px-3 py-2">
        {isLoading ? (
          // Loading skeleton
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-800 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-800 rounded animate-pulse w-28" />
              <div className="h-3 bg-gray-800 rounded animate-pulse w-20" />
            </div>
          </div>
        ) : user ? (
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden flex-shrink-0">
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
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base text-white truncate">
                {profile?.username || user.email || "Người dùng"}
              </p>
              <Link
                href="/profile"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Xem hồ sơ
              </Link>
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-4 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-900 hover:text-white transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span className="text-base font-normal">Đăng nhập</span>
          </Link>
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

      <div className="px-3 py-2 text-xs text-gray-500 space-y-1">
        <p>© 2025 chagmihaydi</p>
        <p>Thông tin • Liên hệ • Chính sách</p>
      </div>
    </aside>
  );
}