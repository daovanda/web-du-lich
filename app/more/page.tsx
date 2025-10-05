import ResizableLayout from "@/components/ResizableLayout";

export default function MorePage() {
  return (
    <ResizableLayout>
      <div className="min-h-screen bg-black text-white">
        <main className="max-w-4xl mx-auto px-6 py-12 space-y-16">
          {/* Hero */}
          <section className="text-center space-y-4 border-b border-neutral-800 pb-12">
            <h1 className="text-4xl font-extrabold tracking-tight">Xem thêm</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Khám phá thêm nhiều nội dung, tính năng và định hướng phát triển của
              chúng tôi.
            </p>
          </section>

          {/* Các phần nổi bật */}
          <section className="space-y-8">
            <h2 className="text-2xl font-bold border-b border-neutral-800 pb-2">
              Các chủ đề bạn có thể quan tâm
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:shadow-lg transition">
                <h3 className="font-semibold text-lg mb-2">Tin tức & Cập nhật</h3>
                <p className="text-sm text-gray-400">
                  Theo dõi những cập nhật mới nhất về tính năng, giao diện và các
                  sự kiện sắp tới.
                </p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:shadow-lg transition">
                <h3 className="font-semibold text-lg mb-2">Hướng dẫn sử dụng</h3>
                <p className="text-sm text-gray-400">
                  Tìm hiểu cách sử dụng nền tảng hiệu quả nhất để quản lý hành
                  trình và dịch vụ.
                </p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:shadow-lg transition">
                <h3 className="font-semibold text-lg mb-2">Cộng đồng</h3>
                <p className="text-sm text-gray-400">
                  Kết nối với cộng đồng người dùng, chia sẻ trải nghiệm và truyền
                  cảm hứng du lịch.
                </p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:shadow-lg transition">
                <h3 className="font-semibold text-lg mb-2">Định hướng tương lai</h3>
                <p className="text-sm text-gray-400">
                  Khám phá tầm nhìn và những tính năng mới chúng tôi sẽ mang đến
                  trong thời gian tới.
                </p>
              </div>
            </div>
          </section>

          {/* Call to action */}
          <section className="text-center space-y-4 border-t border-neutral-800 pt-12">
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
