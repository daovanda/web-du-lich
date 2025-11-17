"use client";

import { useEffect, useState } from "react";
import ResizableLayout from "@/components/ResizableLayout";
import Footer from "@/components/Footer";

// HeroSection Component
function HeroSection() {
  return (
    <div className="text-center space-y-3 mb-12">
      {/* ✨ Gradient Logo Icon */}
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 mb-4 shadow-[0_0_40px_rgba(139,92,246,0.5)] hover:scale-105 hover:rotate-3 transition-all duration-300">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>

      {/* 🔹 Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
        Xem thêm
      </h1>

      {/* 💬 Subtitle */}
      <p className="text-sm md:text-base text-neutral-500 max-w-md mx-auto leading-relaxed">
        Khám phá thêm nhiều nội dung, tính năng và định hướng phát triển của chúng tôi
      </p>

      {/* ✨ Decorative Line */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500"></div>
      </div>
    </div>
  );
}

export default function MorePage() {

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
  }, []);

  const topics = [
    {
      emoji: "📰",
      title: "Tin tức & Cập nhật",
      description: "Theo dõi những cập nhật mới nhất về tính năng, giao diện và các sự kiện sắp tới.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      emoji: "📚",
      title: "Hướng dẫn sử dụng",
      description: "Tìm hiểu cách sử dụng nền tảng hiệu quả nhất để quản lý hành trình và dịch vụ.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      emoji: "👥",
      title: "Cộng đồng",
      description: "Kết nối với cộng đồng người dùng, chia sẻ trải nghiệm và truyền cảm hứng du lịch.",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      emoji: "🚀",
      title: "Định hướng tương lai",
      description: "Khám phá tầm nhìn và những tính năng mới chúng tôi sẽ mang đến trong thời gian tới.",
      gradient: "from-orange-500 to-amber-500"
    }
  ];

  const features = [
    {
      icon: "🎯",
      title: "Lập kế hoạch thông minh",
      description: "AI hỗ trợ tạo lộ trình phù hợp với sở thích"
    },
    {
      icon: "💳",
      title: "Thanh toán linh hoạt",
      description: "Đa dạng phương thức, bảo mật tuyệt đối"
    },
    {
      icon: "🎁",
      title: "Ưu đãi độc quyền",
      description: "Deals đặc biệt dành riêng cho thành viên"
    },
    {
      icon: "🌟",
      title: "Trải nghiệm VIP",
      description: "Dịch vụ cao cấp với đội ngũ 24/7"
    }
  ];

  return (
    <ResizableLayout>
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        
        {/* Hero Section */}
        <div 
          className={`transition-all duration-1000 ease-out ${
            isInitialLoad 
              ? 'opacity-0 translate-y-8' 
              : 'opacity-100 translate-y-0'
          }`}
        >
          <HeroSection />
        </div>

        {/* Intro Message */}
        <section 
          className={`text-center space-y-4 border-b border-neutral-800 pb-12 transition-all duration-700 ease-out delay-300 ${
            isInitialLoad 
              ? 'opacity-0 translate-y-6' 
              : 'opacity-100 translate-y-0'
          }`}
        >
          <div className="max-w-2xl mx-auto">
            <p className="text-neutral-400 leading-relaxed">
              Chúng tôi không ngừng{" "}
              <span className="text-white font-medium">đổi mới</span> và{" "}
              <span className="text-white font-medium">phát triển</span> để mang đến
              trải nghiệm tốt nhất cho bạn. Cùng khám phá những điều thú vị đang chờ đợi phía trước.
            </p>
          </div>
        </section>

        {/* Main Topics */}
        <section 
          className={`space-y-8 transition-all duration-700 ease-out delay-500 ${
            isInitialLoad 
              ? 'opacity-0 translate-y-6' 
              : 'opacity-100 translate-y-0'
          }`}
        >
          <h2 className="text-2xl font-bold text-center">
            Các chủ đề bạn có thể quan tâm
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {topics.map((topic, index) => (
              <div
                key={topic.title}
                className={`group bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-3 hover:border-neutral-700 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 ease-out ${
                  isInitialLoad 
                    ? 'opacity-0 translate-y-6' 
                    : 'opacity-100 translate-y-0'
                }`}
                style={{
                  transitionDelay: `${700 + index * 100}ms`
                }}
              >
                <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                  {topic.emoji}
                </div>
                <h3 className="font-semibold text-lg text-white">{topic.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  {topic.description}
                </p>
                <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${topic.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section 
          className={`space-y-8 transition-all duration-700 ease-out delay-1100 ${
            isInitialLoad 
              ? 'opacity-0 translate-y-6' 
              : 'opacity-100 translate-y-0'
          }`}
        >
          <h2 className="text-2xl font-bold text-center">
            Tính năng nổi bật
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-all duration-300 ${
                  isInitialLoad 
                    ? 'opacity-0 translate-y-6' 
                    : 'opacity-100 translate-y-0'
                }`}
                style={{
                  transitionDelay: `${1200 + index * 100}ms`
                }}
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{feature.icon}</span>
                  <div className="space-y-1">
                    <h4 className="font-medium text-white">{feature.title}</h4>
                    <p className="text-xs text-neutral-500">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section 
          className={`transition-all duration-700 ease-out delay-1600 ${
            isInitialLoad 
              ? 'opacity-0 translate-y-6' 
              : 'opacity-100 translate-y-0'
          }`}
        >
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-8">
            <div className="grid grid-cols-3 gap-6">
              {[
                { number: "50+", label: "Tính năng", icon: "⚡" },
                { number: "24/7", label: "Hỗ trợ", icon: "💬" },
                { number: "99%", label: "Hài lòng", icon: "❤️" }
              ].map((stat, index) => (
                <div key={stat.label} className="text-center space-y-2">
                  <div className="text-2xl">{stat.icon}</div>
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section 
          className={`transition-all duration-700 ease-out delay-1800 ${
            isInitialLoad 
              ? 'opacity-0 translate-y-6' 
              : 'opacity-100 translate-y-0'
          }`}
        >
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-8 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-2">
              <span className="text-3xl">📬</span>
            </div>
            <h3 className="text-xl font-semibold text-white">
              Đăng ký nhận thông tin
            </h3>
            <p className="text-sm text-neutral-400 max-w-md mx-auto">
              Nhận những cập nhật mới nhất, ưu đãi độc quyền và tips du lịch hữu ích
            </p>
            <div className="flex gap-2 max-w-md mx-auto pt-2">
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex-1 px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
              <button className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white text-sm font-medium hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300">
                Đăng ký
              </button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section 
          className={`text-center space-y-6 border-t border-neutral-800 pt-12 transition-all duration-700 ease-out delay-2000 ${
            isInitialLoad 
              ? 'opacity-0 translate-y-6' 
              : 'opacity-100 translate-y-0'
          }`}
        >
          <div className="space-y-3">
            <p className="text-xl font-semibold text-white">
              Chúng tôi luôn lắng nghe và cải thiện
            </p>
            <p className="text-neutral-500">
              Hãy theo dõi để không bỏ lỡ những cập nhật mới nhất ✨
            </p>
          </div>
          
          {/* Social Links */}
          <div className="flex items-center justify-center gap-3 pt-2">
            {["📱", "💻", "📧"].map((icon, i) => (
              <button
                key={i}
                className="w-12 h-12 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-purple-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center text-xl"
              >
                {icon}
              </button>
            ))}
          </div>
        </section>

        {/* Footer Note */}
          <Footer />
      </main>
    </div>
    </ResizableLayout>
  );
}