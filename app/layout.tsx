import "./globals.css";
import { Metadata } from "next";
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
        <AuthProvider>
          {children}
          <ClientChat />
        </AuthProvider>
      </body>
    </html>
  );
}