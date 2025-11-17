"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";
import Suggestions from "@/components/Suggestions";
import Footer from "@/components/Footer";

export default function RightSidebar({ width }: { width: number }) {
  const { user, profile, isLoading } = useAuth(); // ✅ Dùng global auth state
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      // Trigger suggestions animation khi load xong
      const timer = setTimeout(() => setShowSuggestions(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

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

      {/* Footer Component */}
      <Footer />
    </aside>
  );
}