"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function LeftSidebar({
  width,
  overlay = false,
}: {
  width: number;
  overlay?: boolean;
}) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const categories = [
    { id: "", label: "Trang chủ" },
    { id: "stay", label: "Chỗ ở" },
    { id: "car", label: "Xe di chuyển" },
    { id: "motorbike", label: "Thuê xe máy" },
    { id: "tour", label: "Tour du lịch" },
    { id: user ? "profile" : "login", label: "Trang cá nhân" },
    { id: "map", label: "Bản đồ Việt Nam" },
  ];

  const responsiveClass = overlay ? "flex" : "hidden md:flex";
  const heightClass = overlay ? "h-full" : "h-screen sticky top-0";

  return (
    <aside
      className={`${responsiveClass} flex-col justify-between border-r border-gray-800 p-4 bg-black ${heightClass}`}
      style={overlay ? undefined : { width: `${width}px` }}
    >
      <div>
        {/* 🔹 Ẩn logo khi ở overlay (để không trùng với chữ ngoài) */}
        {!overlay && (
          <h1 className="text-2xl font-extrabold mb-6">chagmihaydi</h1>
        )}

        <nav className="space-y-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/${cat.id}`}
              className="block text-left w-full py-2 px-3 rounded-lg hover:bg-gray-900 transition"
            >
              {cat.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="space-y-2">
        <Link
          href="/more"
          className="block text-left py-2 px-3 rounded-lg hover:bg-gray-900"
        >
          Xem thêm
        </Link>
        <Link
          href="/about"
          className="block text-left py-2 px-3 rounded-lg hover:bg-gray-900"
        >
          Về chúng tôi
        </Link>
      </div>
    </aside>
  );
}
