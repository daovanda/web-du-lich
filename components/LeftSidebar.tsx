"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function LeftSidebar({ width }: { width: number }) {
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
    { id: "", label: "Trang chủ" }, // thêm nút Trang chủ
    { id: "stay", label: "Chỗ ở" },
    { id: "car", label: "Xe di chuyển" },
    { id: "motorbike", label: "Thuê xe máy" },
    { id: "location", label: "Địa điểm du lịch" },
    { id: user ? "profile" : "login", label: "Trang cá nhân" },
    { id: "map", label: "Bản đồ Việt Nam" },
  ];

  return (
    <aside className="left-sidebar hidden sm:flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-extrabold mb-6">chagmihaydi</h1>
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
      <style jsx>{`
        .left-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: ${width}px;
          height: 100vh;
          border-right: 1px solid #2d3748;
          padding: 1rem;
          z-index: 1000;
        }
      `}</style>
    </aside>
  );
}
