// KHÔNG thêm "use client" ở đầu file
import ClientToaster from "@/components/ClientToaster";
export const metadata = {
  title: "Admin Dashboard",
  description: "Khu vực quản trị hệ thống",
};

import ResizableLayout from "@/components/ResizableLayout";
import AdminLeftSidebar from "./AdminLeftSidebar";
import AdminRightSidebar from "./AdminRightSidebar";
import SupabaseProvider from "@/components/SupabaseProvider";
import ChatSection from "./components/ChatSection"; // ✅ Import file client riêng
import ChatWidget from "./components/ChatWidget";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      <ResizableLayout
        LeftSidebar={<AdminLeftSidebar width={240} overlay={true} />}
        RightSidebar={<AdminRightSidebar width={260} />}
      >
        {children}
        <ClientToaster />
        <ChatWidget /> {/* ✅ Tự động chọn ChatAdminPanel hoặc ChatWidget */}
      </ResizableLayout>
    </SupabaseProvider>
  );
}
