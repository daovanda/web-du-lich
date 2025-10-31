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
import { supabase } from "@/lib/supabase";
import ServiceSelector from "./components/ServiceSelector";
import toast from "react-hot-toast";
import UserPostsTable from "./components/UserPostsTable";


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

  const [services, setServices] = useState<any[]>([]);
  const [customService, setCustomService] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // ✨ State cho animation
  const [isVisible, setIsVisible] = useState(false);

  // 🔹 Lấy danh sách dịch vụ
  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, title")
        .order("title", { ascending: true });
      if (!error && data) setServices(data);
    };
    fetchServices();
  }, []);

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

  // 🔸 Tự động cắt theo tỉ lệ
  const applyNewAspect = async (asp: number) => {
    setAspect(asp);
    const newImages = await Promise.all(images.map((img) => autoCrop(img.original, asp)));
    setImages(newImages);
  };

  // 🚀 Gửi bài đăng
  const handleCreatePost = async () => {
    try {
      setValidationError(null); // reset cảnh báo cũ
      if (!user) {
        toast.error("⚠️ Bạn cần đăng nhập để đăng bài!");
        return;
      }

      if (!caption.trim() && images.length === 0) {
        const msg = "⚠️ Vui lòng nhập nội dung hoặc chọn ít nhất 1 ảnh!";
        toast.error(msg);
        setValidationError(msg); // ⚠️ Hiển thị cố định dưới nút đăng
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
            background: "#1e293b",
            color: "#fff",
            border: "1px solid #3b82f6",
          },
          iconTheme: {
            primary: "#3b82f6",
            secondary: "#1e293b",
          },
        });
          // 🧹 Reset form sau khi đăng
        setCaption("");
        setImages([]);
        setCurrentIndex(0);
        setServiceId(null);        // ✅ reset chọn dịch vụ
        setCustomService("");      // ✅ reset link ngoài
        // ✅ Làm mới danh sách bài đăng thay vì reload
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

  // 🔄 Lấy bài đăng của user (để hiển thị bảng)
  const [refreshFlag, setRefreshFlag] = useState(0);
  const handleRefreshPosts = () => setRefreshFlag((f) => f + 1);

  // 🔧 Hàm gọi trong handleCreatePost để tải lại bảng
  const fetchUserPosts = async () => {
    handleRefreshPosts();
  };

  return (
    <ResizableLayout>
      <div className="text-white mt-6 md:mt-0 overflow-hidden">
        <div className="max-w-2xl mx-auto text-white p-6 space-y-6">
          {/* ✨ Header với fade-in */}
          <h1 
            className={`text-2xl font-bold transition-all duration-700 ease-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            Tạo bài đăng mới
          </h1>

          {/* ⚠️ Thông báo đăng nhập với fade-in delay */}
          {!user && (
            <div 
              className={`bg-yellow-900/30 border border-yellow-600 text-yellow-400 px-4 py-3 rounded-lg text-center transition-all duration-700 ease-out delay-100 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
              }`}
            >
              ⚠️ Vui lòng{" "}
              <button
                onClick={() => (window.location.href = "/login")}
                className="underline underline-offset-2 text-yellow-300 hover:text-yellow-200 font-semibold transition-colors duration-200"
              >
                đăng nhập
              </button>{" "}
              để tạo bài đăng. Và chia sẻ những trải nghiệm tuyệt vời của bạn!
            </div>
          )}

          {/* 📝 Ô nhập nội dung với fade-in delay */}
          <div
            className={`transition-all duration-700 ease-out delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            <textarea
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-gray-800"
              placeholder="Nhập nội dung bài đăng..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>

          {/* 🔗 Liên kết dịch vụ với fade-in delay */}
          <div
            className={`transition-all duration-700 ease-out delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            <ServiceSelector
              serviceId={serviceId}
              setServiceId={setServiceId}
              customService={customService}
              setCustomService={setCustomService}
            />
          </div>

          {/* 🖼️ Tỉ lệ ảnh với fade-in khi có ảnh */}
          {images.length > 0 && (
            <div className="animate-fadeIn">
              <AspectRatioSelector aspect={aspect} applyNewAspect={applyNewAspect} images={images} />
            </div>
          )}

          {/* 📷 Chọn ảnh với fade-in delay */}
          <div 
            className={`space-y-3 transition-all duration-700 ease-out delay-[400ms] ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            <label className="block text-gray-400">Hình ảnh</label>
            <label
              htmlFor="img-upload"
              className="inline-block bg-gray-800 hover:bg-gray-700 border border-gray-600 px-4 py-2 rounded cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Chọn ảnh
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

          {/* ✂️ Modal cắt ảnh */}
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

          {/* 🖼️ Ảnh chính với fade-in khi có ảnh */}
          {images.length > 0 && (
            <div
              className="relative w-full aspect-square bg-black rounded-lg overflow-hidden mt-4 animate-fadeIn"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={images[currentIndex].preview}
                className="w-full h-full object-contain transition-opacity duration-300"
                onClick={() => {
                  setCropImage(URL.createObjectURL(images[currentIndex].original));
                  setCropTargetIndex(currentIndex);
                }}
              />
              {currentIndex === 0 && (
                <div className="absolute top-2 left-2 bg-blue-600 px-2 py-1 text-xs rounded animate-fadeIn">
                  Ảnh bìa
                </div>
              )}
            </div>
          )}

          {/* 🖼️ Lưới ảnh với fade-in khi có ảnh */}
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

          {/* 👁️ Xem trước với fade-in khi có ảnh */}
          {images.length > 0 && (
            <button
              onClick={() => setPreviewOpen(true)}
              className="w-full bg-gray-700 hover:bg-gray-600 py-2 rounded transition-all duration-300 hover:scale-[1.02] animate-fadeIn"
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

          {/* 🚀 Nút đăng với fade-in delay */}
          <div
            className={`transition-all duration-700 ease-out delay-[500ms] ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            <button
              disabled={loading}
              onClick={handleCreatePost}
              className={`w-full px-4 py-2 rounded font-medium transition-all duration-300 ${
                loading
                  ? "bg-gray-600 cursor-not-allowed text-gray-300"
                  : "bg-blue-600 hover:bg-blue-500 text-white hover:scale-[1.02] hover:shadow-lg"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang gửi...
                </span>
              ) : (
                "Đăng bài"
              )}
            </button>
            {validationError && (
              <p className="text-red-400 text-sm text-center mt-2 animate-shake">
                {validationError}
              </p>
            )}
          </div>

          {/* 📋 Bảng bài đăng của người dùng với fade-in delay */}
          {user && (
            <div 
              className={`pt-10 border-t border-gray-800 transition-all duration-700 ease-out delay-[600ms] ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
              }`}
            >
              <UserPostsTable
                key={refreshFlag} // reload khi đăng bài mới
                currentUserId={user.id}
                onOpenPost={(post) => console.log("📰 Mở bài:", post)}
              />
            </div>
          )}
        </div>
      </div>

      {/* ✨ Custom CSS cho animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </ResizableLayout>
  );
}