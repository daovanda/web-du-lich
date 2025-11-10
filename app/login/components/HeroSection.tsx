"use client";

import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <motion.div 
      className="text-center space-y-3 mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* ✨ Gradient Logo Icon */}
      <motion.div
        className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 mb-4 shadow-[0_0_40px_rgba(168,85,247,0.5)]"
        initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ 
          delay: 0.2, 
          duration: 0.8,
          type: "spring",
          stiffness: 200
        }}
        whileHover={{ 
          scale: 1.05,
          rotate: 5,
          transition: { duration: 0.2 }
        }}
      >
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </motion.div>

      {/* 📝 Title */}
      <motion.h1
        className="text-3xl md:text-4xl font-bold text-white tracking-tight"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        Chào mừng trở lại
      </motion.h1>

      {/* 💬 Subtitle */}
      <motion.p
        className="text-sm md:text-base text-neutral-500 max-w-md mx-auto leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        Đăng nhập để kết nối, chia sẻ hành trình và khám phá những khoảnh khắc tuyệt vời
      </motion.p>

      {/* ✨ Decorative Line */}
      <motion.div
        className="flex items-center justify-center gap-2 pt-2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-pink-500 to-orange-500"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500"></div>
      </motion.div>
    </motion.div>
  );
}