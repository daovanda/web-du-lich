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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      </motion.div>

      {/* 📝 Title */}
      <motion.h1
        className="text-3xl md:text-4xl font-bold text-white tracking-tight"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        Tạo tài khoản mới
      </motion.h1>

      {/* 💬 Subtitle */}
      <motion.p
        className="text-sm md:text-base text-neutral-500 max-w-md mx-auto leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        Gia nhập cộng đồng Việt Nam Travel — nơi bạn chia sẻ hành trình và khám phá thế giới
      </motion.p>

      {/* ✨ Decorative Elements */}
      <motion.div
        className="flex items-center justify-center gap-2 pt-2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
      </motion.div>

      {/* 📊 Stats (Optional) */}
      <motion.div
        className="flex items-center justify-center gap-6 pt-4 text-xs text-neutral-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Miễn phí 100%</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-neutral-700"></div>
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>Bảo mật cao</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-neutral-700"></div>
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          <span>10K+ thành viên</span>
        </div>
      </motion.div>
    </motion.div>
  );
}