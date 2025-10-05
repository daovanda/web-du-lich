import ResizableLayout from "@/components/ResizableLayout";
import AdminLeftSidebar from "./AdminLeftSidebar";
import AdminRightSidebar from "./AdminRightSidebar";
import ChatWidget from "./components/ChatWidget";
import SupabaseProvider from "@/components/SupabaseProvider";

export const metadata = {
  title: "Admin Dashboard",
  description: "Khu vực quản trị hệ thống",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      <ResizableLayout
        LeftSidebar={<AdminLeftSidebar width={240} />}
        RightSidebar={<AdminRightSidebar width={260} />}
      >
        {children}
        <ChatWidget />
      </ResizableLayout>
    </SupabaseProvider>
  );
}
