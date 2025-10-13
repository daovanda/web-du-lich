"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

type PostImage = { image_url: string; id?: string };
type Author = { username?: string; avatar_url?: string };
type ServiceRef = { id?: string; title?: string };

type Post = {
  caption?: string;
  created_at?: string;
  author?: Author;
  service?: ServiceRef;
  images?: PostImage[] | null;
};

type PostCardProps = {
  post: Post;
  currentUser?: any;
};

export default function PostCard({ post }: PostCardProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const captionVisibleRef = useRef<HTMLParagraphElement | null>(null);

  const images: PostImage[] = Array.isArray(post.images) ? post.images : [];

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspectRatio) return;
    const img = e.currentTarget;
    const ratio = img.naturalWidth / img.naturalHeight;
    setAspectRatio(ratio);
  };

  // Kiểm tra xem caption có vượt quá 2 dòng hay không
  useEffect(() => {
    const caption = post.caption ?? "";
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
  }, [post.caption, aspectRatio]);

  return (
    <div className="w-full text-white mb-10">
      {/* Header */}
      <div className="flex items-center justify-between px-3 mb-3">
        <div className="flex items-center">
          <Image
            src={post.author?.avatar_url || "/default-avatar.png"}
            alt={post.author?.username || "Người dùng"}
            width={42}
            height={42}
            className="rounded-full object-cover border border-gray-700"
          />
          <div className="ml-3">
            <p className="font-semibold text-sm">
              {post.author?.username || "Người dùng"}
            </p>
            <p className="text-[11px] text-gray-500">
              {post.created_at
                ? new Date(post.created_at).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                  })
                : ""}
            </p>
          </div>
        </div>
        <EllipsisHorizontalIcon className="w-5 h-5 text-gray-400 hover:text-gray-200 transition cursor-pointer" />
      </div>

      {/* Ảnh bài đăng */}
      {images.length > 0 && (
        <div
          className="relative w-full bg-black rounded-2xl overflow-hidden border border-gray-800 shadow-md"
          style={{
            aspectRatio: aspectRatio ? `${aspectRatio}` : "1 / 1",
          }}
        >
          <Image
            src={images[currentImage]?.image_url ?? "/placeholder.jpg"}
            alt={`post image ${currentImage + 1}`}
            fill
            className="object-cover"
            priority
            onLoad={handleImageLoad}
          />

          {images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrentImage(
                    (prev) => (prev - 1 + images.length) % images.length
                  )
                }
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full transition"
              >
                ‹
              </button>
              <button
                onClick={() =>
                  setCurrentImage((prev) => (prev + 1) % images.length)
                }
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full transition"
              >
                ›
              </button>

              {/* Dấu chấm chỉ vị trí ảnh */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((img, idx) => (
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
      )}

      {/* Footer */}
      <div className="px-3 pt-3">
        {/* Caption hiển thị như Instagram */}
        {post.caption && (
          <div className="mb-1 text-sm leading-relaxed">
            <p
              ref={captionVisibleRef}
              className={`whitespace-pre-line transition-all ${
                expanded ? "" : "line-clamp-2"
              }`}
              role="article"
            >
              <span className="font-semibold">
                {post.author?.username || "Người dùng"}:
              </span>{" "}
              {post.caption}
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

        {/* Dịch vụ liên quan */}
        {post.service && (
          <Link
            href={`/services/${post.service.id}`}
            className="text-blue-400 text-sm hover:underline"
          >
            🔗 Xem dịch vụ liên quan: {post.service.title}
          </Link>
        )}
      </div>
    </div>
  );
}
