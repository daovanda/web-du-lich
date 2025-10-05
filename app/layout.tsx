import "./globals.css";
import { Metadata } from "next";
import SupabaseProvider from "@/components/SupabaseProvider";
import ClientChat from "@/components/ClientChat"; // ✅ thêm vào

export const metadata: Metadata = {
  title: "chagmihaydi",
  description: "Nền tảng du lịch dành cho giới trẻ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <SupabaseProvider>
          {children}
          <ClientChat /> {/* ✅ Chat hiển thị cho user */}
        </SupabaseProvider>
      </body>
    </html>
  );
}
