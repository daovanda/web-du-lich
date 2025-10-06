"use client";

export default function AdminRightSidebar({ width }: { width: number }) {
  return (
    <aside className="admin-right-sidebar hidden lg:flex flex-col space-y-6">
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">Thông tin hệ thống</h2>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>Người dùng: 120</li>
          <li>Dịch vụ: 45</li>
          <li>Đơn đặt: 230</li>
        </ul>
      </div>

      <style jsx>{`
        .admin-right-sidebar {
          width: ${width}px;
          border-left: 1px solid #2d3748;
          padding: 1rem;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden; /* ❌ Ngăn cuộn riêng */
          flex-shrink: 0;
        }

        @media (max-width: 1024px) {
          .admin-right-sidebar {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
}
