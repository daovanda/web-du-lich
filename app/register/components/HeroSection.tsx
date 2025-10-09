"use client";

import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center text-center text-white py-8 sm:py-10">
      <motion.h1
        className="text-4xl sm:text-5xl font-extrabold mb-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Tạo tài khoản mới ✨
      </motion.h1>

      <motion.p
        className="text-gray-400 text-sm sm:text-base max-w-md"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Gia nhập cộng đồng Việt Nam Travel — nơi bạn có thể chia sẻ hành trình,
        lưu giữ khoảnh khắc và khám phá thế giới cùng bạn bè bốn phương.
      </motion.p>
    </section>
  );
}
