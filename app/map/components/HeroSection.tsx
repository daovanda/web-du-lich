export default function HeroSection() {
  return (
    <section className="border-b border-gray-700 py-10 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight">Hành Trình Việt Nam</h1>
      <p className="mt-3 text-gray-400 max-w-xl mx-auto">
        Khám phá bản đồ Việt Nam 🌏 — đánh dấu nơi bạn đã đi và theo dõi hành trình cá nhân.
      </p>
      <a
        href="#vn-map-root"
        className="inline-block mt-6 rounded-full border border-white px-5 py-2 text-sm font-semibold hover:bg-white hover:text-black transition"
      >
        Khám phá ngay
      </a>
    </section>
  );
}
