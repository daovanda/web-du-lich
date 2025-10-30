"use client";

import { ImageItem } from "../types";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { supabase } from "@/lib/supabase";

interface PreviewModalProps {
  previewOpen: boolean;
  setPreviewOpen: (value: boolean) => void;
  images: ImageItem[];
  caption: string;
  loading: boolean;
}

export default function PreviewModal({
  previewOpen,
  setPreviewOpen,
  images,
  caption,
  loading,
}: PreviewModalProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    username: string;
    avatar_url: string;
  } | null>(null);

  const captionVisibleRef = useRef<HTMLParagraphElement | null>(null);

  // Lấy thông tin người dùng từ Supabase
  useEffect(() => {
    async function fetchUserProfile() {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        setUserProfile({ username: "Người dùng", avatar_url: "/default-avatar.png" });
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", userData.user.id)
        .single();

      if (profileError || !profileData) {
        setUserProfile({ username: "Người dùng", avatar_url: "/default-avatar.png" });
        return;
      }

      setUserProfile({
        username: profileData.username || "Người dùng",
        avatar_url: profileData.avatar_url || "/default-avatar.png",
      });
    }

    fetchUserProfile();
  }, []);

  // Chuyển đổi images từ ImageItem[] sang PostImage[]
  const postImages = images.map((img) => ({ image_url: img.preview }));

  // Xử lý tải ảnh để tính tỷ lệ khung hình
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspectRatio) return;
    const img = e.currentTarget;
    const ratio = img.naturalWidth / img.naturalHeight;
    setAspectRatio(ratio);
  };

  // Kiểm tra caption có vượt quá 2 dòng hay không
  useEffect(() => {
    if (!caption) {
      setIsOverflowing(false);
      return;
    }

    const visibleEl = captionVisibleRef.current;
    if (!visibleEl) {
      setIsOverflowing(caption.length > 200);
      return;
    }

    const width = Math.max(visibleEl.clientWidth, 100);

    const measure = document.createElement("div");
    measure.style.position = "absolute";
    measure.style.left = "-99999px";
    measure.style.top = "-99999px";
    measure.style.width = `${width}px`;
    measure.style.whiteSpace = "pre-line";
    measure.style.visibility = "hidden";
    measure.style.fontSize = window.getComputedStyle(visibleEl).fontSize;
    measure.style.lineHeight = window.getComputedStyle(visibleEl).lineHeight;
    measure.style.fontFamily = window.getComputedStyle(visibleEl).fontFamily;
    measure.style.fontWeight = window.getComputedStyle(visibleEl).fontWeight;
    measure.style.letterSpacing = window.getComputedStyle(visibleEl).letterSpacing;
    measure.innerText = caption;
    document.body.appendChild(measure);

    const single = document.createElement("div");
    single.style.position = "absolute";
    single.style.left = "-99999px";
    single.style.top = "-99999px";
    single.style.visibility = "hidden";
    single.style.whiteSpace = "nowrap";
    single.style.fontSize = window.getComputedStyle(visibleEl).fontSize;
    single.style.lineHeight = window.getComputedStyle(visibleEl).lineHeight;
    single.style.fontFamily = window.getComputedStyle(visibleEl).fontFamily;
    single.innerText = "A";
    document.body.appendChild(single);

    const naturalHeight = measure.getBoundingClientRect().height;
    const lineHeight =
      single.getBoundingClientRect().height ||
      parseFloat(window.getComputedStyle(visibleEl).lineHeight || "1.2");
    const twoLines = lineHeight * 2 + 0.5;

    setIsOverflowing(naturalHeight > twoLines);

    document.body.removeChild(measure);
    document.body.removeChild(single);
  }, [caption, aspectRatio]);

  if (!previewOpen || images.length === 0 || !userProfile) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-md w-full p-4 space-y-4">
        {/* Header giống PostCard */}
        <div className="flex items-center justify-between px-3 mb-3">
          <div className="flex items-center">
            <Image
              src={userProfile.avatar_url}
              alt={userProfile.username}
              width={42}
              height={42}
              className="rounded-full object-cover border border-gray-700"
            />
            <div className="ml-3">
              <p className="font-semibold text-sm">{userProfile.username}</p>
              <p className="text-[11px] text-gray-500">
                {new Date().toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </p>
            </div>
          </div>
          <EllipsisHorizontalIcon className="w-5 h-5 text-gray-400 hover:text-gray-200 transition cursor-pointer" />
        </div>

        {/* Ảnh bài đăng */}
        <div
          className="relative w-full bg-black rounded-2xl overflow-hidden border border-gray-800 shadow-md"
          style={{
            aspectRatio: aspectRatio ? `${aspectRatio}` : "1 / 1",
          }}
        >
          <Image
            src={postImages[currentImage]?.image_url ?? "/placeholder.jpg"}
            alt={`post image ${currentImage + 1}`}
            fill
            className="object-cover"
            priority
            onLoad={handleImageLoad}
          />

          {postImages.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrentImage(
                    (prev) => (prev - 1 + postImages.length) % postImages.length
                  )
                }
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full transition"
              >
                ‹
              </button>
              <button
                onClick={() =>
                  setCurrentImage((prev) => (prev + 1) % postImages.length)
                }
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full transition"
              >
                ›
              </button>

              {/* Dấu chấm chỉ vị trí ảnh */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                {postImages.map((img, idx) => (
                  <div
                    key={img.image_url ?? idx}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx === currentImage
                        ? "bg-white scale-110"
                        : "bg-gray-500/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 pt-3">
          {/* Caption hiển thị như Instagram */}
          {caption && (
            <div className="mb-1 text-sm leading-relaxed">
              <p
                ref={captionVisibleRef}
                className={`whitespace-pre-line transition-all ${
                  expanded ? "" : "line-clamp-2"
                }`}
                role="article"
              >
                <span className="font-semibold">{userProfile.username}:</span>{" "}
                {caption}
              </p>

              {isOverflowing && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-blue-400 text-xs hover:underline mt-1"
                >
                  {expanded ? "Thu gọn" : "Xem thêm"}
                </button>
              )}
            </div>
          )}

          {/* Nút điều khiển của PreviewModal */}
          <div className="space-y-2 mt-2">
            <button
              className="w-full bg-gray-700 py-2 rounded"
              onClick={() => setPreviewOpen(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}