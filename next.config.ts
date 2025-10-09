import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
    domains: [
      "gaxmdralfrjhxvczvuvv.supabase.co", // 👈 thêm domain Supabase của bạn
      "lh3.googleusercontent.com",         // (tuỳ, nếu bạn dùng avatar đăng nhập Google)
      "avatars.githubusercontent.com",     // (tuỳ, nếu bạn có GitHub)
    ],
  },
  /* config options here */
};
module.exports = nextConfig;





