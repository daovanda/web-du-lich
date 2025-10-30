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
      if (!user) {
        toast.error("⚠️ Bạn cần đăng nhập để đăng bài!");
        return;
      }

      if (!caption.trim() && images.length === 0) {
        toast.error("⚠️ Vui lòng nhập nội dung hoặc chọn ít nhất 1 ảnh!");
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
          <h1 className="text-2xl font-bold">Tạo bài đăng mới</h1>

          {/* 📝 Ô nhập nội dung */}
          <textarea
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg"
            placeholder="Nhập nội dung bài đăng..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />

          {/* 🔗 Liên kết dịch vụ */}
          <ServiceSelector
            serviceId={serviceId}
            setServiceId={setServiceId}
            customService={customService}
            setCustomService={setCustomService}
          />

          {/* 🖼️ Tỉ lệ ảnh */}
          {images.length > 0 && (
            <AspectRatioSelector aspect={aspect} applyNewAspect={applyNewAspect} images={images} />
          )}

          {/* 📷 Chọn ảnh */}
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

          {/* 🖼️ Ảnh chính */}
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
                <div className="absolute top-2 left-2 bg-blue-600 px-2 py-1 text-xs rounded">
                  Ảnh bìa
                </div>
              )}
            </div>
          )}

          {/* 🖼️ Lưới ảnh */}
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

          {/* 👁️ Xem trước */}
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

          {/* 🚀 Nút đăng */}
          <button
            disabled={loading}
            onClick={handleCreatePost}
            className={`w-full px-4 py-2 rounded font-medium transition ${
              loading
                ? "bg-gray-600 cursor-not-allowed text-gray-300"
                : "bg-blue-600 hover:bg-blue-500 text-white"
            }`}
          >
            {loading ? "Đang gửi..." : "Đăng bài"}
          </button>

          {/* 📋 Bảng bài đăng của người dùng */}
          {user && (
            <div className="pt-10 border-t border-gray-800">
              <UserPostsTable
                key={refreshFlag} // reload khi đăng bài mới
                currentUserId={user.id}
                onOpenPost={(post) => console.log("📰 Mở bài:", post)}
              />
            </div>
          )}
        </div>
      </div>
    </ResizableLayout>
  );
}
