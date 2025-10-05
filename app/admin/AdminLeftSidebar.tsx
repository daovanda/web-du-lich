"use client";

import Link from "next/link";

export default function AdminLeftSidebar({ width }: { width: number }) {
  const menus = [
    { href: "/admin", label: "Tổng quan" },
    { href: "/admin/guide", label: "Hướng dẫn" },
    { href: "/admin/services", label: "Quản lý dịch vụ" },
    { href: "/admin/users", label: "Quản lý người dùng" },
    { href: "/admin/bookings", label: "Quản lý đơn đặt" },
    { href: "/admin/settings", label: "Cài đặt hệ thống" },
  ];

  return (
    <aside className="admin-left-sidebar hidden lg:flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-extrabold mb-6">chagmihaydi</h1>
        <nav className="space-y-2">
          {menus.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="block text-left w-full py-2 px-3 rounded-lg hover:bg-gray-900 transition"
            >
              {m.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="space-y-2 text-sm text-gray-400">
        <p>© 2025 Admin System</p>
        <p>Hỗ trợ • Chính sách • Liên hệ</p>
      </div>
      <style jsx>{`
        .admin-left-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: ${width}px;
          height: 100vh;
          padding: 1rem;
          z-index: 1000;
        }
      `}</style>
    </aside>
  );
}
