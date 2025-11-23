"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { exportMapImage, getAchievementBadge } from "../lib/exportMapImage";

type ShareMapButtonProps = {
  visitedCount: number;
  total: number;
  visitedProvinces: string[];
};

export default function ShareMapButton({
  visitedCount,
  total,
  visitedProvinces,
}: ShareMapButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userName, setUserName] = useState<string>("Du khách");
  const [userAvatar, setUserAvatar] = useState<string | undefined>(undefined);

  const achievement = getAchievementBadge(visitedCount, total);
  const percent = ((visitedCount / total) * 100).toFixed(1);

  // ✅ Load user info
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Try to get profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            if (profile.full_name) {
              setUserName(profile.full_name);
            } else if (session.user.user_metadata?.full_name) {
              setUserName(session.user.user_metadata.full_name);
            } else if (session.user.email) {
              setUserName(session.user.email.split('@')[0]);
            }

            if (profile.avatar_url) {
              setUserAvatar(profile.avatar_url);
            } else if (session.user.user_metadata?.avatar_url) {
              setUserAvatar(session.user.user_metadata.avatar_url);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load user info:", err);
      }
    };

    loadUserInfo();
  }, []);

  const handleExport = async () => {
    if (visitedCount === 0) {
      setError("Hãy đánh dấu ít nhất 1 tỉnh trước khi chia sẻ!");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      await exportMapImage({
        visitedCount,
        total,
        visitedProvinces,
        userName,
        userAvatar,
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Export failed:", err);
      setError("Không thể xuất ảnh. Vui lòng thử lại!");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      {/* Success Toast */}
      {showSuccess && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 whitespace-nowrap">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">Đã tải xuống ảnh!</span>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 max-w-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Share Button */}
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="group relative w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-neutral-700 disabled:to-neutral-700 text-white rounded-xl px-6 py-4 transition-all duration-300 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-500/25 disabled:shadow-none"
      >
        <div className="flex items-center justify-between">
          {/* Left: Icon + Text */}
          <div className="flex items-center gap-3">
            {isExporting ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            )}
            
            <div className="text-left">
              <div className="text-base font-semibold">
                {isExporting ? "Đang tạo ảnh..." : "Chia sẻ hành trình"}
              </div>
              <div className="text-xs text-emerald-100 font-medium">
                {achievement.emoji} {achievement.title} • {percent}% hoàn thành
              </div>
            </div>
          </div>

          {/* Right: Arrow */}
          <svg 
            className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>

      {/* Info Text */}
      <p className="text-xs text-neutral-500 mt-2 text-center">
        Xuất ảnh 9:16 • {visitedCount} tỉnh/đảo • Perfect cho Stories
      </p>

      {/* Styles */}
      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translate(-50%, -10px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}