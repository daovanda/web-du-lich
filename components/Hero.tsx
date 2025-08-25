import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative h-[200px] sm:h-[300px] md:h-[400px]">
      <Image
        src="/hero.jpg"
        alt="Hero background"
        fill
        style={{ objectFit: "cover" }}
        className="brightness-50"
      />
      <div className="absolute inset-0 flex items-center justify-center text-white">
        <div className="text-center px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            Khám phá Việt Nam
          </h1>
          <p className="mt-2 text-sm sm:text-base md:text-lg">
            Đặt homestay, xe, tour và ăn uống dễ dàng chỉ với vài cú nhấp chuột
          </p>
        </div>
      </div>
    </section>
  );
}
