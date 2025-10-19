"use client";

import { useEffect, useState } from "react";
import ResizableLayout from "@/components/ResizableLayout";

export default function AboutPage() {
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
            <h1 className="text-4xl font-extrabold tracking-tight">
              Về chúng tôi
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Chagmihaydi được tạo ra để mang đến cho bạn trải nghiệm du lịch
              tối giản, hiện đại và gần gũi – nơi bạn có thể lưu giữ hành trình,
              kết nối dịch vụ và khám phá Việt Nam theo cách riêng của mình.
            </p>
          </section>

          {/* Giá trị cốt lõi */}
          <section 
            className={`space-y-8 transition-all duration-700 ease-out delay-500 ${
              isInitialLoad 
                ? 'opacity-0 translate-y-6' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            <h2 className="text-2xl font-bold border-b border-neutral-800 pb-2">
              Giá trị cốt lõi
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  title: "Tối giản",
                  description: "Mọi thiết kế và trải nghiệm đều gọn gàng, tinh tế, loại bỏ chi tiết thừa."
                },
                {
                  title: "Kết nối",
                  description: "Chúng tôi kết nối bạn với dịch vụ, sự kiện và cộng đồng du lịch trẻ trung."
                },
                {
                  title: "Khám phá",
                  description: "Khuyến khích bạn mở rộng hành trình, đánh dấu và lưu giữ trải nghiệm của riêng mình."
                },
                {
                  title: "Chia sẻ",
                  description: "Mọi hành trình đều trở nên ý nghĩa hơn khi được chia sẻ cùng bạn bè và cộng đồng."
                }
              ].map((value, index) => (
                <div
                  key={value.title}
                  className={`bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-2 hover:shadow-lg transition-all duration-300 ease-out ${
                    isInitialLoad 
                      ? 'opacity-0 translate-y-6' 
                      : 'opacity-100 translate-y-0'
                  }`}
                  style={{
                    transitionDelay: `${700 + index * 100}ms`
                  }}
                >
                  <h3 className="font-semibold text-lg">{value.title}</h3>
                  <p className="text-sm text-gray-400">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Phong cách hướng đến */}
          <section 
            className={`space-y-4 transition-all duration-700 ease-out delay-1100 ${
              isInitialLoad 
                ? 'opacity-0 translate-y-6' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            <h2 className="text-2xl font-bold border-b border-neutral-800 pb-2">
              Phong cách chúng tôi hướng đến
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Một nền tảng mang đậm tinh thần <span className="text-white">trẻ trung</span>,{" "}
              <span className="text-white">hiện đại</span> và{" "}
              <span className="text-white">tối giản</span>. Mọi chi tiết đều được
              sắp đặt để bạn tập trung vào điều quan trọng nhất:{" "}
              <span className="text-white">hành trình của chính bạn</span>.
            </p>
          </section>

          {/* Thông điệp cuối */}
          <section 
            className={`text-center space-y-4 border-t border-neutral-800 pt-12 transition-all duration-700 ease-out delay-1300 ${
              isInitialLoad 
                ? 'opacity-0 translate-y-6' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            <p className="text-lg font-medium">
              Chúng tôi tin rằng mỗi chuyến đi đều là một câu chuyện.
            </p>
            <p className="text-gray-400">
              Hãy cùng chúng tôi viết nên câu chuyện của bạn 🌏
            </p>
          </section>
        </main>
      </div>
    </ResizableLayout>
  );
}