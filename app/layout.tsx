import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Travel Việt Nam",
  description: "Đặt phòng, thuê xe, khám phá dễ dàng",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
        {children}
      </body>
    </html>
  );
}
