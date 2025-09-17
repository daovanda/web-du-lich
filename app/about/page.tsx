export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        {/* Hero */}
        <section className="text-center space-y-4 border-b border-neutral-800 pb-12">
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
        <section className="space-y-8">
          <h2 className="text-2xl font-bold border-b border-neutral-800 pb-2">
            Giá trị cốt lõi
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-2 hover:shadow-lg transition">
              <h3 className="font-semibold text-lg">Tối giản</h3>
              <p className="text-sm text-gray-400">
                Mọi thiết kế và trải nghiệm đều gọn gàng, tinh tế, loại bỏ chi
                tiết thừa.
              </p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-2 hover:shadow-lg transition">
              <h3 className="font-semibold text-lg">Kết nối</h3>
              <p className="text-sm text-gray-400">
                Chúng tôi kết nối bạn với dịch vụ, sự kiện và cộng đồng du lịch
                trẻ trung.
              </p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-2 hover:shadow-lg transition">
              <h3 className="font-semibold text-lg">Khám phá</h3>
              <p className="text-sm text-gray-400">
                Khuyến khích bạn mở rộng hành trình, đánh dấu và lưu giữ trải
                nghiệm của riêng mình.
              </p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-2 hover:shadow-lg transition">
              <h3 className="font-semibold text-lg">Chia sẻ</h3>
              <p className="text-sm text-gray-400">
                Mọi hành trình đều trở nên ý nghĩa hơn khi được chia sẻ cùng
                bạn bè và cộng đồng.
              </p>
            </div>
          </div>
        </section>

        {/* Phong cách hướng đến */}
        <section className="space-y-4">
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
        <section className="text-center space-y-4 border-t border-neutral-800 pt-12">
          <p className="text-lg font-medium">
            Chúng tôi tin rằng mỗi chuyến đi đều là một câu chuyện.
          </p>
          <p className="text-gray-400">
            Hãy cùng chúng tôi viết nên câu chuyện của bạn 🌏
          </p>
        </section>
      </main>
    </div>
  );
}
