"use client";

import { useEffect, useState } from "react";
import { usePost } from "./hooks/usePost";
import { handleSelectImages, cropFile, uploadImages, autoCrop } from "./actions/imageActions";
import { createPost } from "./actions/postActions";
import CropModal from "./components/CropModal";
import PreviewModal from "./components/PreviewModal";
import ImageGrid from "./components/ImageGrid";
import AspectRatioSelector from "./components/AspectRatioSelector";
import ResizableLayout from "@/components/ResizableLayout";
import ServiceSelector from "./components/ServiceSelector";
import toast from "react-hot-toast";
import UserPostsTable from "./components/UserPostsTable";
import Footer from "@/components/Footer";



export default function CreatePostPage() {
  const {
    user,
    caption,
    setCaption,
    serviceId,
    setServiceId,
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

  const [customService, setCustomService] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // ✨ State cho animation
  const [isVisible, setIsVisible] = useState(false);

  // ✨ Trigger animation khi component mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // ✂️ Cắt ảnh thủ công
  const applyManualCrop = async () => {
    if (cropTargetIndex === null || !cropImage) return;
    const updated = await cropFile(cropImage, croppedAreaPixels, images[cropTargetIndex].original);
    setImages((prev) => prev.map((img, i) => (i === cropTargetIndex ? updated : img)));
    setCropImage(null);
    setCropTargetIndex(null);
  };

  // 📸 Tự động cắt theo tỉ lệ
  const applyNewAspect = async (asp: number) => {
    setAspect(asp);
    const newImages = await Promise.all(images.map((img) => autoCrop(img.original, asp)));
    setImages(newImages);
  };

  // 🚀 Gửi bài đăng
  const handleCreatePost = async () => {
    try {
      setValidationError(null);
      if (!user) {
        toast.error("⚠️ Bạn cần đăng nhập để đăng bài!");
        return;
      }

      if (!caption.trim() && images.length === 0) {
        const msg = "⚠️ Vui lòng nhập nội dung hoặc chọn ít nhất 1 ảnh!";
        toast.error(msg);
        setValidationError(msg);
        return;
      }

      let serviceIdOrLink: string | null = null;

      if (serviceId === "custom") {
        serviceIdOrLink = customService?.trim() || null;
      } else if (serviceId) {
        serviceIdOrLink = serviceId;
      }

      const result = await createPost(
        user,
        caption,
        serviceIdOrLink,
        images,
        setLoading,
        setCaption,
        setImages,
        setCurrentIndex,
        uploadImages
      );

      if (result?.success) {
        toast.success(result.message || "🎉 Bài đăng của bạn đã được tạo thành công!", {
          style: {
            borderRadius: "10px",
            background: "#000",
            color: "#fff",
            border: "1px solid #262626",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#000",
          },
        });
        // 🧹 Reset form sau khi đăng
        setCaption("");
        setImages([]);
        setCurrentIndex(0);
        setServiceId(null);
        setCustomService("");
        // ✅ Làm mới danh sách bài đăng
        await fetchUserPosts();
      } else {
        toast.error(result?.message || "❌ Có lỗi xảy ra khi đăng bài. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("🚨 handleCreatePost error:", error);
      toast.error("❌ Lỗi không xác định, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Lấy bài đăng của user
  const [refreshFlag, setRefreshFlag] = useState(0);
  const handleRefreshPosts = () => setRefreshFlag((f) => f + 1);

  const fetchUserPosts = async () => {
    handleRefreshPosts();
  };

  return (
    <ResizableLayout>
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-4 pt-24 md:pt-8">
          
          {/* ✨ Header */}
          <div 
            className={`transition-all duration-700 ease-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            <h1 className="text-xl font-semibold text-white mb-1">Tạo bài đăng mới</h1>
            <p className="text-sm text-neutral-500">Chia sẻ khoảnh khắc của bạn</p>
          </div>

          {/* ⚠️ Thông báo đăng nhập */}
          {!user && (
            <div 
              className={`bg-neutral-950 border border-neutral-800 rounded-xl p-4 transition-all duration-700 ease-out delay-100 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-neutral-400 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-400">
                    Vui lòng{" "}
                    <button
                      onClick={() => (window.location.href = "/login")}
                      className="text-white font-medium hover:text-neutral-300 transition-colors"
                    >
                      đăng nhập
                    </button>{" "}
                    để tạo bài đăng và chia sẻ trải nghiệm của bạn
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Card */}
          <div
            className={`bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden transition-all duration-700 ease-out delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            <div className="p-4 md:p-6 space-y-5">
              
              {/* 📝 Caption Input */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">
                  Nội dung
                </label>
                <textarea
                  className="w-full p-3 bg-black border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors duration-200 resize-none"
                  placeholder="Viết caption cho bài đăng..."
                  rows={4}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>

              {/* 🔗 Service Selector */}
              <div>
                <ServiceSelector
                  serviceId={serviceId}
                  setServiceId={setServiceId}
                  customService={customService}
                  setCustomService={setCustomService}
                />
              </div>

              {/* 📷 Image Upload */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">
                  Hình ảnh
                </label>
                <label
                  htmlFor="img-upload"
                  className="inline-flex items-center gap-2 bg-black border border-neutral-800 hover:border-neutral-600 px-4 py-2.5 rounded-lg cursor-pointer transition-all duration-200 text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Thêm ảnh
                </label>
                <input
                  id="img-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleSelectImages(e.target.files, e, aspect, setImages)}
                  className="hidden"
                />
              </div>

              {/* 🖼️ Aspect Ratio Selector */}
              {images.length > 0 && (
                <div className="animate-fadeIn">
                  <AspectRatioSelector aspect={aspect} applyNewAspect={applyNewAspect} images={images} />
                </div>
              )}

              {/* 🖼️ Main Image Display */}
              {images.length > 0 && (
                <div
                  className="relative w-full aspect-square bg-black rounded-lg overflow-hidden border border-neutral-800 animate-fadeIn group"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  <img
                    src={images[currentIndex].preview}
                    className="w-full h-full object-contain transition-opacity duration-300 cursor-pointer"
                    onClick={() => {
                      setCropImage(URL.createObjectURL(images[currentIndex].original));
                      setCropTargetIndex(currentIndex);
                    }}
                  />
                  
                  {/* Cover Badge */}
                  {currentIndex === 0 && (
                    <div className="absolute top-3 left-3 bg-white text-black px-2.5 py-1 text-xs font-medium rounded-full">
                      Ảnh bìa
                    </div>
                  )}
                  
                  {/* Edit Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                    <div className="text-white text-sm font-medium flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Nhấn để chỉnh sửa
                    </div>
                  </div>
                </div>
              )}

              {/* 🖼️ Image Grid */}
              {images.length > 0 && (
                <div className="animate-fadeIn">
                  <ImageGrid
                    images={images}
                    currentIndex={currentIndex}
                    setCurrentIndex={setCurrentIndex}
                    removeImage={removeImage}
                    handleDragStart={handleDragStart}
                    handleDrop={handleDrop}
                  />
                </div>
              )}

              {/* 👁️ Preview Button */}
              {images.length > 0 && (
                <button
                  onClick={() => setPreviewOpen(true)}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium animate-fadeIn"
                >
                  Xem trước bài đăng
                </button>
              )}

              {/* 🚀 Submit Button */}
              <button
                disabled={loading}
                onClick={handleCreatePost}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                  loading
                    ? "bg-neutral-800 cursor-not-allowed text-neutral-500"
                    : "bg-white text-black hover:bg-neutral-200 active:scale-[0.98]"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Đang đăng...
                  </span>
                ) : (
                  "Đăng bài"
                )}
              </button>

              {/* Validation Error */}
              {validationError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-shake">
                  <span className="text-red-400 text-sm">⚠️</span>
                  <p className="text-red-400 text-sm">{validationError}</p>
                </div>
              )}
            </div>
          </div>

          {/* 📋 User Posts Table */}
          {user && (
            <div 
              className={`transition-all duration-700 ease-out delay-300 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
              }`}
            >
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 md:p-6">
                <UserPostsTable
                  key={refreshFlag}
                  currentUserId={user.id}
                  onOpenPost={(post) => console.log("📰 Mở bài:", post)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
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

      {previewOpen && (
        <PreviewModal
          previewOpen={previewOpen}
          setPreviewOpen={setPreviewOpen}
          images={images}
          caption={caption}
          loading={loading}
        />
      )}


      {/* ✨ Custom CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>

       {/* Footer Note */}
          <Footer />

    </ResizableLayout>
  );
}