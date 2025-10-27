import { ImageItem } from "../types";

interface AspectRatioSelectorProps {
  aspect: number;
  applyNewAspect: (asp: number) => void;
  images: ImageItem[]; // Thêm images vào props
}

export default function AspectRatioSelector({ aspect, applyNewAspect, images }: AspectRatioSelectorProps) {
  return (
    <>
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm text-gray-400">Tỷ lệ khung hình</div>
          <div className="flex items-center gap-2">
            <span className="text-xs w-14 text-gray-500">Vuông</span>
            {[{ asp: 1, label: "1:1" }].map(({ asp, label }) => (
              <div
                key={label}
                onClick={() => applyNewAspect(asp)}
                className={`w-10 h-10 cursor-pointer border rounded flex items-center justify-center text-[10px] ${
                  aspect === asp ? "border-blue-500 shadow-[0_0_10px_rgba(0,122,255,0.8)]" : "border-gray-600"
                }`}
              >
                {label}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs w-14 text-gray-500">Dọc</span>
            {[
              { asp: 4 / 5, label: "4:5" },
              { asp: 3 / 4, label: "3:4" },
              { asp: 2 / 3, label: "2:3" },
              { asp: 9 / 16, label: "9:16" },
              { asp: 5 / 7, label: "5:7" },
            ].map(({ asp, label }) => (
              <div
                key={label}
                onClick={() => applyNewAspect(asp)}
                className={`w-8 h-12 cursor-pointer border rounded flex items-center justify-center text-[10px] ${
                  aspect === asp ? "border-blue-500 shadow-[0_0_10px_rgba(0,122,255,0.8)]" : "border-gray-600"
                }`}
              >
                {label}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs w-14 text-gray-500">Ngang</span>
            {[
              { asp: 5 / 4, label: "5:4" },
              { asp: 4 / 3, label: "4:3" },
              { asp: 3 / 2, label: "3:2" },
              { asp: 16 / 9, label: "16:9" },
              { asp: 7 / 5, label: "7:5" },
            ].map(({ asp, label }) => (
              <div
                key={label}
                onClick={() => applyNewAspect(asp)}
                className={`w-12 h-8 cursor-pointer border rounded flex items-center justify-center text-[10px] ${
                  aspect === asp ? "border-blue-500 shadow-[0_0_10px_rgba(0,122,255,0.8)]" : "border-gray-600"
                }`}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}