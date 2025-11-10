"use client";

import { ImageItem } from "../types";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
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
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl max-w-md w-full overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-neutral-800">
              <Image
                src={userProfile.avatar_url}
                alt={userProfile.username}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-sm text-white">{userProfile.username}</p>
              <p className="text-xs text-neutral-500">
                {new Date().toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </p>
            </div>
          </div>
          <button
            onClick={() => setPreviewOpen(false)}
            className="text-neutral-400 hover:text-white transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Ảnh bài đăng */}
        <div
          className="relative w-full bg-black"
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
              {/* Previous Button */}
              <button
                onClick={() =>
                  setCurrentImage(
                    (prev) => (prev - 1 + postImages.length) % postImages.length
                  )
                }
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Next Button */}
              <button
                onClick={() =>
                  setCurrentImage((prev) => (prev + 1) % postImages.length)
                }
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Dots indicator */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {postImages.map((img, idx) => (
                  <div
                    key={img.image_url ?? idx}
                    className={`transition-all duration-300 rounded-full ${
                      idx === currentImage
                        ? "w-2 h-2 bg-white"
                        : "w-1.5 h-1.5 bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Caption Section */}
        {caption && (
          <div className="p-4 border-t border-neutral-800">
            <div className="text-sm leading-relaxed">
              <p
                ref={captionVisibleRef}
                className={`whitespace-pre-line text-neutral-300 transition-all ${
                  expanded ? "" : "line-clamp-2"
                }`}
              >
                <span className="font-semibold text-white">{userProfile.username}</span>{" "}
                {caption}
              </p>

              {isOverflowing && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-neutral-500 text-sm hover:text-neutral-400 mt-1.5 transition-colors"
                >
                  {expanded ? "Thu gọn" : "Xem thêm"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer Action */}
        <div className="p-4 border-t border-neutral-800">
          <button
            className="w-full bg-white hover:bg-neutral-200 text-black font-semibold py-3 rounded-lg transition-all duration-200 active:scale-[0.98]"
            onClick={() => setPreviewOpen(false)}
          >
            Đóng
          </button>
        </div>
      </div>

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

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}