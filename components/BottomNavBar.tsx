"use client";

import { useAuth } from "@/components/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNavBar() {
  const { user, profile } = useAuth(); // ✅ Dùng global auth state
  const pathname = usePathname();

  const navItems = [
    { 
      id: "", 
      label: "Trang chủ",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      id: "stay", 
      label: "Chỗ ở",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    { 
      id: "tour", 
      label: "Tour",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      id: "map", 
      label: "Bản đồ",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      )
    },
    { 
      id: "posts", 
      label: "Tạo bài",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      )
    },
    { 
      id: user ? "profile" : "login", 
      label: user ? (profile?.username || profile?.full_name || user.email?.split('@')[0] || "Cá nhân") : "Đăng nhập",
      icon: user && profile?.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt="Avatar"
          className="w-6 h-6 rounded-full object-cover"
        />
      ) : user ? (
        <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-semibold text-white">
          {(profile?.username?.[0] || profile?.full_name?.[0] || user.email?.[0] || "U").toUpperCase()}
        </div>
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
      )
    },
  ];

  const isActive = (id: string) => {
    if (id === "") return pathname === "/";
    return pathname.startsWith(`/${id}`);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const active = isActive(item.id);
          return (
            <Link
              key={item.id}
              href={`/${item.id}`}
              className="flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-0 flex-1"
            >
              <span
                className={`transition-colors ${
                  active ? "text-white" : "text-gray-500"
                }`}
              >
                {item.icon}
              </span>
              <span
                className={`text-[10px] transition-colors truncate w-full text-center ${
                  active ? "text-white font-semibold" : "text-gray-500 font-normal"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}