import Cropper from "react-easy-crop";

interface CropModalProps {
  cropImage: string | null;
  crop: { x: number; y: number };
  zoom: number;
  aspect: number;
  setCrop: (crop: { x: number; y: number }) => void;
  setZoom: (zoom: number) => void;
  setCroppedAreaPixels: (pixels: any) => void;
  setCropImage: (image: string | null) => void;
  setCropTargetIndex: (index: number | null) => void;
  applyManualCrop: () => void;
}

export default function CropModal({
  cropImage,
  crop,
  zoom,
  aspect,
  setCrop,
  setZoom,
  setCroppedAreaPixels,
  setCropImage,
  setCropTargetIndex,
  applyManualCrop,
}: CropModalProps) {
  if (!cropImage) return null;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex flex-col justify-center items-center z-50 p-4">
      {/* Header */}
      <div className="w-full max-w-4xl mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Chỉnh sửa ảnh</h2>
        <button
          onClick={() => {
            setCropImage(null);
            setCropTargetIndex(null);
          }}
          className="text-neutral-400 hover:text-white transition-colors p-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Crop Area */}
      <div className="relative w-full max-w-4xl h-[60vh] md:h-[70vh] bg-black rounded-xl overflow-hidden border border-neutral-800">
        <Cropper
          image={cropImage}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
        />
      </div>

      {/* Zoom Control */}
      <div className="w-full max-w-4xl mt-4 mb-4">
        <div className="flex items-center gap-3 bg-neutral-950 border border-neutral-800 rounded-full px-4 py-3">
          <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 h-1 bg-neutral-800 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, white 0%, white ${((zoom - 1) / 2) * 100}%, rgb(38 38 38) ${((zoom - 1) / 2) * 100}%, rgb(38 38 38) 100%)`
            }}
          />
          <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-4xl flex gap-3">
        <button
          className="flex-1 px-6 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-white font-medium transition-colors duration-200"
          onClick={() => {
            setCropImage(null);
            setCropTargetIndex(null);
          }}
        >
          Hủy
        </button>
        <button 
          className="flex-1 px-6 py-3 bg-white hover:bg-neutral-200 text-black font-semibold rounded-lg transition-all duration-200 active:scale-[0.98]" 
          onClick={applyManualCrop}
        >
          Áp dụng
        </button>
      </div>

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid black;
        }

        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid black;
        }
      `}</style>
    </div>
  );
}