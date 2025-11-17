import "./globals.css";
import { Metadata } from "next";
import SupabaseProvider from "@/components/SupabaseProvider";
import { AuthProvider } from "@/components/AuthContext";
import ClientChat from "@/components/ClientChat";

export const metadata: Metadata = {
  title: "chagmihaydi",
  description: "Nền tảng du lịch dành cho giới trẻ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <SupabaseProvider>
          <AuthProvider>
            {children}
            <ClientChat />
          </AuthProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}