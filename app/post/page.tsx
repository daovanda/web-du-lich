"use client";

import { usePost } from "./hooks/usePost";
import { handleSelectImages, cropFile, uploadImages, autoCrop } from "./actions/imageActions";
import { createPost } from "./actions/postActions";
import CropModal from "./components/CropModal";
import PreviewModal from "./components/PreviewModal";
import ImageGrid from "./components/ImageGrid";
import AspectRatioSelector from "./components/AspectRatioSelector";
import ResizableLayout from "@/components/ResizableLayout";

export default function CreatePostPage() {
  const {
    user,
    caption,
    setCaption,
    serviceId,
    images,
    setImages,
    loading,
    setLoading,
    currentIndex,
    setCurrentIndex,
    cropImage,
    setCropImage,
    cropTargetIndex,
    setCropTargetIndex,
    crop,
    setCrop,
    zoom,
    setZoom,
    croppedAreaPixels,
    setCroppedAreaPixels,
    aspect,
    setAspect,
    previewOpen,
    setPreviewOpen,
    handleDragStart,
    handleDrop,
    removeImage,
    handleTouchStart,
    handleTouchEnd,
  } = usePost();

  const applyManualCrop = async () => {
    if (cropTargetIndex === null || !cropImage) return;
    const updated = await cropFile(cropImage, croppedAreaPixels, images[cropTargetIndex].original);
    setImages((prev) => prev.map((img, i) => (i === cropTargetIndex ? updated : img)));
    setCropImage(null);
    setCropTargetIndex(null);
  };

  const applyNewAspect = async (asp: number) => {
    setAspect(asp);
    const newImages = await Promise.all(images.map((img) => autoCrop(img.original, asp)));
    setImages(newImages);
  };

  const handleCreatePost = () =>
    createPost(user, caption, serviceId, images, setLoading, setCaption, setImages, setCurrentIndex, uploadImages);

  return (
    <ResizableLayout>
      <div className="text-white mt-6 md:mt-0 overflow-hidden">
      <div className="max-w-2xl mx-auto text-white p-6 space-y-6">
        <h1 className="text-2xl font-bold">Tạo bài đăng mới</h1>

        <textarea
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg"
          placeholder="Nhập nội dung bài đăng..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        {images.length > 0 && <AspectRatioSelector aspect={aspect} applyNewAspect={applyNewAspect} images={images} />}

        <div className="space-y-3">
          <label className="block text-gray-400">Hình ảnh</label>
          <label
            htmlFor="img-upload"
            className="bg-gray-800 hover:bg-gray-700 border border-gray-600 px-4 py-2 rounded cursor-pointer"
          >
            Chọn ảnh
          </label>
          <input
            id="img-upload"
            type="file"
            accept="image/*"
            onChange={(e) => handleSelectImages(e.target.files, e, aspect, setImages)}
            className="hidden"
          />
        </div>

        <CropModal
          cropImage={cropImage}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          setCrop={setCrop}
          setZoom={setZoom}
          setCroppedAreaPixels={setCroppedAreaPixels}
          setCropImage={setCropImage}
          setCropTargetIndex={setCropTargetIndex}
          applyManualCrop={applyManualCrop}
        />

        {images.length > 0 && (
          <div
            className="relative w-full aspect-square bg-black rounded-lg overflow-hidden mt-4"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={images[currentIndex].preview}
              className="w-full h-full object-contain"
              onClick={() => {
                setCropImage(URL.createObjectURL(images[currentIndex].original));
                setCropTargetIndex(currentIndex);
              }}
            />
            {currentIndex === 0 && (
              <div className="absolute top-2 left-2 bg-blue-600 px-2 py-1 text-xs rounded">Ảnh bìa</div>
            )}
          </div>
        )}

        {images.length > 0 && (
          <ImageGrid
            images={images}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            removeImage={removeImage}
            handleDragStart={handleDragStart}
            handleDrop={handleDrop}
          />
        )}

        {images.length > 0 && (
          <button
            onClick={() => setPreviewOpen(true)}
            className="w-full bg-gray-700 hover:bg-gray-600 py-2 rounded"
          >
            Xem trước bài đăng
          </button>
        )}

        {previewOpen && (
          <PreviewModal
            previewOpen={previewOpen}
            setPreviewOpen={setPreviewOpen}
            images={images}
            caption={caption}
            loading={loading}
          />
        )}

        <button
          disabled={loading}
          onClick={handleCreatePost}
          className="w-full bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded"
        >
          {loading ? "Đang gửi..." : "Đăng bài"}
        </button>
      </div>
      </div>
    </ResizableLayout>
  );
}