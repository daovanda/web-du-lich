"use client";

import { useEffect, useState } from "react";
import ResizableLayout from "@/components/ResizableLayout";
import Footer from "@/components/Footer";

// HeroSection Component
function HeroSection() {
  return (
    <div 
      className="text-center space-y-3 mb-12"
    >
      {/* ✨ Gradient Logo Icon */}
      <div
        className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 mb-4 shadow-[0_0_40px_rgba(168,85,247,0.5)] hover:scale-105 hover:rotate-3 transition-all duration-300">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      {/* 🔹 Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
        Về chúng tôi
      </h1>

      {/* 💬 Subtitle */}
      <p className="text-sm md:text-base text-neutral-500 max-w-md mx-auto leading-relaxed">
        Nơi bạn có thể kết nối, chia sẻ hành trình và khám phá những khoảnh khắc tuyệt vời
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

export default function AboutPage() {
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
  }, []);

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

          {/* Mission Statement */}
          <section 
            className={`text-center space-y-4 border-b border-neutral-800 pb-12 transition-all duration-700 ease-out delay-300 ${
              isInitialLoad 
                ? 'opacity-0 translate-y-6' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            <div className="max-w-2xl mx-auto">
              <p className="text-neutral-400 leading-relaxed">
                <span className="text-white font-medium">Chagmihaydi</span> được tạo ra để mang đến cho bạn trải nghiệm du lịch
                tối giản, hiện đại và gần gũi — nơi bạn có thể lưu giữ hành trình,
                kết nối dịch vụ và khám phá Việt Nam theo cách riêng của mình.
              </p>
            </div>
          </section>

          {/* Core Values */}
          <section 
            className={`space-y-8 transition-all duration-700 ease-out delay-500 ${
              isInitialLoad 
                ? 'opacity-0 translate-y-6' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            <h2 className="text-2xl font-bold text-center">
              Giá trị cốt lõi
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  emoji: "✨",
                  title: "Tối giản",
                  description: "Mọi thiết kế và trải nghiệm đều gọn gàng, tinh tế, loại bỏ chi tiết thừa."
                },
                {
                  emoji: "🔗",
                  title: "Kết nối",
                  description: "Chúng tôi kết nối bạn với dịch vụ, sự kiện và cộng đồng du lịch trẻ trung."
                },
                {
                  emoji: "🗺️",
                  title: "Khám phá",
                  description: "Khuyến khích bạn mở rộng hành trình, đánh dấu và lưu giữ trải nghiệm của riêng mình."
                },
                {
                  emoji: "💬",
                  title: "Chia sẻ",
                  description: "Mọi hành trình đều trở nên ý nghĩa hơn khi được chia sẻ cùng bạn bè và cộng đồng."
                }
              ].map((value, index) => (
                <div
                  key={value.title}
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
                    {value.emoji}
                  </div>
                  <h3 className="font-semibold text-lg text-white">{value.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Our Approach */}
          <section 
            className={`space-y-6 transition-all duration-700 ease-out delay-1100 ${
              isInitialLoad 
                ? 'opacity-0 translate-y-6' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            <h2 className="text-2xl font-bold text-center">
              Phong cách chúng tôi hướng đến
            </h2>
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-8">
              <p className="text-neutral-400 leading-relaxed text-center max-w-2xl mx-auto">
                Một nền tảng mang đậm tinh thần <span className="text-white font-medium">trẻ trung</span>,{" "}
                <span className="text-white font-medium">hiện đại</span> và{" "}
                <span className="text-white font-medium">tối giản</span>. Mọi chi tiết đều được
                sắp đặt để bạn tập trung vào điều quan trọng nhất:{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-semibold">hành trình của chính bạn</span>.
              </p>
            </div>
          </section>

          {/* Stats Section */}
          <section 
            className={`transition-all duration-700 ease-out delay-1300 ${
              isInitialLoad 
                ? 'opacity-0 translate-y-6' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            <div className="grid grid-cols-3 gap-4">
              {[
                { number: "1000+", label: "Địa điểm" },
                { number: "500+", label: "Đối tác" },
                { number: "10K+", label: "Hành trình" }
              ].map((stat, index) => (
                <div 
                  key={stat.label}
                  className="text-center bg-neutral-950 border border-neutral-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300"
                  style={{
                    transitionDelay: `${1400 + index * 100}ms`
                  }}
                >
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-xs md:text-sm text-neutral-500 mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Final Message */}
          <section 
            className={`text-center space-y-6 border-t border-neutral-800 pt-12 transition-all duration-700 ease-out delay-1600 ${
              isInitialLoad 
                ? 'opacity-0 translate-y-6' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <span className="text-3xl">🌍</span>
            </div>
            <div className="space-y-3">
              <p className="text-xl font-semibold text-white">
                Chúng tôi tin rằng mỗi chuyến đi đều là một câu chuyện
              </p>
              <p className="text-neutral-500">
                Hãy cùng chúng tôi viết nên câu chuyện của bạn
              </p>
            </div>
            
            {/* CTA Button */}
            <div className="pt-4">
              <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-medium hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300">
                Bắt đầu khám phá
              </button>
            </div>
          </section>

          {/* Contact Info */}
          <section 
            className={`transition-all duration-700 ease-out delay-1800 ${
              isInitialLoad 
                ? 'opacity-0 translate-y-6' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-white mb-6 text-center">Liên hệ với chúng tôi</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="text-center space-y-2">
                  <div className="text-2xl">📧</div>
                  <div className="text-xs text-neutral-500">Email</div>
                  <div className="text-sm text-blue-400">support@chagmihaydi.vn</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-2xl">📞</div>
                  <div className="text-xs text-neutral-500">Hotline</div>
                  <div className="text-sm text-emerald-400">1900 1234</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-2xl">🏢</div>
                  <div className="text-xs text-neutral-500">Website</div>
                  <div className="text-sm text-purple-400">chagmihaydi.vn</div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer Note */}
          <Footer />
        </main>
      </div>
    </ResizableLayout>
  );
}