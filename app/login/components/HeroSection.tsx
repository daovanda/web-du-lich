"use client";

import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center text-center text-white px-6 py-8 md:py-12">
      <motion.h1
        className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Chào mừng trở lại 👋
      </motion.h1>

      <motion.p
        className="text-gray-400 text-sm sm:text-base max-w-md"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        Đăng nhập để kết nối, chia sẻ hành trình và khám phá thế giới qua những
        khoảnh khắc tuyệt vời cùng cộng đồng Việt Nam Travel.
      </motion.p>
    </section>
  );
}
