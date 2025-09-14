import "./globals.css";
import ResizableLayout from "@/components/ResizableLayout";

export const metadata = {
  title: "chagmihaydi",
  description: "Nền tảng du lịch dành cho giới trẻ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <ResizableLayout>{children}</ResizableLayout>
      </body>
    </html>
  );
}