import { useState } from "react";

type Props = { images?: string[]; title: string };

export default function ServiceGallery({ images, title }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const gallery = images?.length ? images : ["/anh1.jpeg"];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    setCurrentIndex(Math.round(scrollLeft / width));
  };

  return (
    <div className="relative">
      <div
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth"
        onScroll={handleScroll}
      >
        {gallery.map((src, i) => (
          <div key={i} className="flex-shrink-0 w-full snap-center">
            <img
              src={src}
              alt={`${title} - ${i + 1}`}
              className="w-full h-72 md:h-[420px] object-cover rounded-2xl"
            />
          </div>
        ))}
      </div>
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
        {gallery.map((_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full ${
              i === currentIndex ? "bg-white" : "bg-gray-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
