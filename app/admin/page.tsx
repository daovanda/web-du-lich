"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        <h1 className="text-3xl font-extrabold">Trang Admin</h1>
        <p className="text-gray-400">
          Xin chào {user?.email}, bạn đang đăng nhập với quyền{" "}
          <span className="text-emerald-400 font-medium">admin</span>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:shadow-lg transition">
            <h2 className="font-semibold text-lg mb-2">Quản lý người dùng</h2>
            <p className="text-sm text-gray-400">
              Xem và quản lý thông tin tài khoản người dùng.
            </p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:shadow-lg transition">
            <h2 className="font-semibold text-lg mb-2">Dịch vụ & Đặt chỗ</h2>
            <p className="text-sm text-gray-400">
              Quản lý các dịch vụ, đơn đặt chỗ và lịch sử giao dịch.
            </p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:shadow-lg transition">
            <h2 className="font-semibold text-lg mb-2">Báo cáo</h2>
            <p className="text-sm text-gray-400">
              Theo dõi số liệu, thống kê và hiệu quả của nền tảng.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
