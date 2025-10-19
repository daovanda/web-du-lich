"use client";

import { useEffect, useState } from "react";
import ResizableLayout from "@/components/ResizableLayout";

export default function MorePage() {
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Trigger initial load animation
    setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
  }, []);

  return (
    <ResizableLayout>
      <div className="min-h-screen bg-black text-white">
        <main 
          className={`max-w-4xl mx-auto px-6 py-12 space-y-16 transition-all duration-1000 ease-out ${
            isInitialLoad 
              ? 'opacity-0 translate-y-8' 
              : 'opacity-100 translate-y-0'
          }`}
        >
          {/* Hero */}
          <section 
            className={`text-center space-y-4 border-b border-neutral-800 pb-12 transition-all duration-700 ease-out delay-300 ${
              isInitialLoad 
                ? 'opacity-0 translate-y-6' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            <h1 className="text-4xl font-extrabold tracking-tight">Xem thêm</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Khám phá thêm nhiều nội dung, tính năng và định hướng phát triển của
              chúng tôi.
            </p>
          </section>

          {/* Các phần nổi bật */}
          <section 
            className={`space-y-8 transition-all duration-700 ease-out delay-500 ${
              isInitialLoad 
                ? 'opacity-0 translate-y-6' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            <h2 className="text-2xl font-bold border-b border-neutral-800 pb-2">
              Các chủ đề bạn có thể quan tâm
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  title: "Tin tức & Cập nhật",
                  description: "Theo dõi những cập nhật mới nhất về tính năng, giao diện và các sự kiện sắp tới."
                },
                {
                  title: "Hướng dẫn sử dụng",
                  description: "Tìm hiểu cách sử dụng nền tảng hiệu quả nhất để quản lý hành trình và dịch vụ."
                },
                {
                  title: "Cộng đồng",
                  description: "Kết nối với cộng đồng người dùng, chia sẻ trải nghiệm và truyền cảm hứng du lịch."
                },
                {
                  title: "Định hướng tương lai",
                  description: "Khám phá tầm nhìn và những tính năng mới chúng tôi sẽ mang đến trong thời gian tới."
                }
              ].map((topic, index) => (
                <div
                  key={topic.title}
                  className={`bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:shadow-lg transition-all duration-300 ease-out ${
                    isInitialLoad 
                      ? 'opacity-0 translate-y-6' 
                      : 'opacity-100 translate-y-0'
                  }`}
                  style={{
                    transitionDelay: `${700 + index * 100}ms`
                  }}
                >
                  <h3 className="font-semibold text-lg mb-2">{topic.title}</h3>
                  <p className="text-sm text-gray-400">
                    {topic.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Call to action */}
          <section 
            className={`text-center space-y-4 border-t border-neutral-800 pt-12 transition-all duration-700 ease-out delay-1100 ${
              isInitialLoad 
                ? 'opacity-0 translate-y-6' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            <p className="text-lg font-medium">
              Chúng tôi luôn lắng nghe và cải thiện.
            </p>
            <p className="text-gray-400">
              Hãy theo dõi để không bỏ lỡ những cập nhật mới nhất ✨
            </p>
          </section>
        </main>
      </div>
    </ResizableLayout>
  );
}