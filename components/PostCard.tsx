"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { deletePost } from "@/app/posts/actions/postActions";

type PostImage = { image_url: string; id?: string };
type Author = { id?: string; username?: string; avatar_url?: string };
type ServiceRef = { id?: string; title?: string };

type Post = {
  id?: string;
  caption?: string;
  created_at?: string;
  author?: Author;
  service?: ServiceRef;
  images?: PostImage[] | null;
  custom_service_link?: string | null;
  type?: string | null;
};

type PostCardProps = {
  post: Post;
  currentUser?: { id?: string };
};

export default function PostCard({ post, currentUser }: PostCardProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const captionVisibleRef = useRef<HTMLParagraphElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const images: PostImage[] = Array.isArray(post.images) ? post.images : [];

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspectRatio) return;
    const img = e.currentTarget;
    const ratio = img.naturalWidth / img.naturalHeight;
    setAspectRatio(ratio);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    setCurrentImage(Math.round(scrollLeft / width));
  };

  const scrollToImage = (index: number) => {
    if (scrollRef.current) {
      const width = scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({
        left: width * index,
        behavior: 'smooth'
      });
    }
    setCurrentImage(index);
  };

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
    <div className="w-full bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 shadow-lg mb-6 transition-all duration-300 hover:border-neutral-700">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-full overflow-hidden ring-2 ring-pink-500/20">
            <Image
              src={post.author?.avatar_url || "/default-avatar.png"}
              alt={post.author?.username || "Người dùng"}
              width={44}
              height={44}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <p className="font-semibold text-sm text-white">
              {post.author?.username || "Người dùng"}
            </p>
            <p className="text-xs text-gray-500">
              {post.created_at
                ? new Date(post.created_at).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : ""}
            </p>
          </div>
        </div>

        {/* Menu 3 chấm */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 hover:bg-neutral-800 rounded-full transition-colors"
          >
            <EllipsisHorizontalIcon className="w-5 h-5 text-gray-400" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-10 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-50 py-2 min-w-[140px]">
                {currentUser?.id === post.author?.id && (
                  <button
                    onClick={async () => {
                      if (!confirm("Bạn có chắc muốn xóa bài này?")) return;
                      if (!post.id || !currentUser || !currentUser.id) {
                        alert("Không thể xác định người dùng hoặc bài để xóa.");
                        return;
                      }
                      const res = await deletePost(post.id, currentUser.id);

                      if (res?.success) {
                        alert("Đã xóa bài");
                        window.location.reload();
                      } else {
                        alert((res as any)?.error || "Không xóa được bài");
                      }
                    }}
                    className="w-full px-4 py-2 text-left text-red-400 hover:bg-neutral-700 transition-colors text-sm font-medium"
                  >
                    🗑️ Xóa bài
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Gallery ảnh với swipe */}
      {images.length > 0 && (
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth"
            onScroll={handleScroll}
            style={{ aspectRatio: aspectRatio ? `${aspectRatio}` : "1 / 1" }}
          >
            {images.map((img, i) => (
              <div key={img.id || i} className="flex-shrink-0 w-full snap-center relative">
                <Image
                  src={img.image_url ?? "/placeholder.jpg"}
                  alt={`post image ${i + 1}`}
                  fill
                  className="object-cover bg-black"
                  priority={i === 0}
                  onLoad={i === 0 ? handleImageLoad : undefined}
                />
              </div>
            ))}
          </div>

          {/* Mũi tên Previous */}
          {images.length > 1 && currentImage > 0 && (
            <button
              onClick={() => scrollToImage(currentImage - 1)}
              aria-label="Ảnh trước"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Mũi tên Next */}
          {images.length > 1 && currentImage < images.length - 1 && (
            <button
              onClick={() => scrollToImage(currentImage + 1)}
              aria-label="Ảnh sau"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <span className="text-white text-sm font-semibold">
                {currentImage + 1} / {images.length}
              </span>
            </div>
          )}

          {/* Dots Indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToImage(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentImage ? "bg-white w-6" : "bg-gray-500/70 w-2"
                  }`}
                  aria-label={`Chuyển đến ảnh ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-4 space-y-3">
        {/* Caption */}
        {post.caption && (
          <div className="text-sm leading-relaxed">
            <p
              ref={captionVisibleRef}
              className={`whitespace-pre-line text-gray-200 transition-all ${
                expanded ? "" : "line-clamp-2"
              }`}
              role="article"
            >
              <span className="font-semibold text-white">
                {post.author?.username || "Người dùng"}
              </span>{" "}
              {post.caption}
            </p>

            {isOverflowing && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-pink-400 text-xs font-medium hover:text-pink-300 mt-1 transition-colors"
              >
                {expanded ? "Thu gọn" : "Xem thêm"}
              </button>
            )}
          </div>
        )}

        {/* Service Link */}
        {post.custom_service_link ? (
          <Link
            href={post.custom_service_link}
            className="inline-flex items-center gap-1.5 text-pink-400 text-sm font-medium hover:text-pink-300 transition-colors group"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>🔗</span>
            <span>Xem dịch vụ liên quan</span>
            <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        ) : post.service ? (
          <Link
            href={`/services/${post.type}/${post.service.id}`}
            className="inline-flex items-center gap-1.5 text-pink-400 text-sm font-medium hover:text-pink-300 transition-colors group"
          >
            <span>🔗</span>
            <span>Xem dịch vụ: {post.service.title}</span>
            <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        ) : null}
      </div>

      {/* CSS để ẩn scrollbar */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}