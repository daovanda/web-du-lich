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
    <div className="fixed inset-0 bg-black/70 flex flex-col justify-center items-center z-50">
      <div className="relative w-[90vw] h-[70vh]">
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
      <div className="flex gap-4 mt-4">
        <button
          className="px-4 py-2 bg-gray-600 rounded"
          onClick={() => {
            setCropImage(null);
            setCropTargetIndex(null);
          }}
        >
          Hủy
        </button>
        <button className="px-4 py-2 bg-blue-600 rounded" onClick={applyManualCrop}>
          Xong
        </button>
      </div>
    </div>
  );
}