"use client";

import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <div className="text-center space-y-4">
      {/* 🗺️ Map Icon */}
      <motion.div
        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
        initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.05, rotate: 5 }}
      >
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      </motion.div>

      {/* 📝 Title */}
      <motion.h1
        className="text-3xl md:text-4xl font-bold text-white tracking-tight"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Hành Trình Việt Nam
      </motion.h1>

      {/* 💬 Subtitle */}
      <motion.p
        className="text-sm md:text-base text-neutral-500 max-w-2xl mx-auto leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        Khám phá bản đồ Việt Nam — đánh dấu nơi bạn đã đi và theo dõi hành trình khám phá đất nước
      </motion.p>

      {/* 🎯 CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <a
          href="#vn-map-root"
          className="inline-flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-neutral-200 transition-all duration-200 active:scale-[0.98] group"
        >
          <span>Khám phá ngay</span>
          <svg 
            className="w-4 h-4 transition-transform group-hover:translate-x-0.5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </motion.div>

      {/* ✨ Decorative Line */}
      <motion.div
        className="flex items-center justify-center gap-2 pt-2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"></div>
      </motion.div>
    </div>
  );
}