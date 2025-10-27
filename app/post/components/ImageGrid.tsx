import { ImageItem } from "../types";

interface ImageGridProps {
  images: ImageItem[];
  currentIndex: number;
  setCurrentIndex: (value: number) => void;
  removeImage: (index: number) => void;
  handleDragStart: (index: number) => void;
  handleDrop: (index: number) => void;
}

export default function ImageGrid({
  images,
  currentIndex,
  setCurrentIndex,
  removeImage,
  handleDragStart,
  handleDrop,
}: ImageGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {images.map((img, i) => (
        <div
          key={i}
          draggable
          onDragStart={() => handleDragStart(i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(i)}
          className="relative group cursor-move"
        >
          <img
            src={img.preview}
            className="w-full h-28 object-cover rounded-lg border border-gray-700"
            onClick={() => setCurrentIndex(i)}
          />
          <button
            onClick={() => removeImage(i)}
            className="absolute top-1 right-1 bg-black/60 text-white px-1.5 rounded opacity-0 group-hover:opacity-100 transition"
          >
            ✕
          </button>
          {i === 0 && (
            <div className="absolute bottom-1 left-1 bg-blue-600 px-2 py-0.5 text-xs rounded">
              Ảnh bìa
            </div>
          )}
        </div>
      ))}
    </div>
  );
}