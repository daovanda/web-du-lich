"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
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
  const [liked, setLiked] = useState(false);
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

  // Format time Instagram-style
  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return "Vừa xong";
    if (diffInHours < 24) return `${Math.floor(diffInHours)} giờ trước`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} ngày trước`;
    return `${Math.floor(diffInHours / 168)} tuần trước`;
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
    <div className="w-full bg-black border-b border-neutral-800 mb-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-neutral-800">
            <Image
              src={post.author?.avatar_url || "/default-avatar.png"}
              alt={post.author?.username || "Người dùng"}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-sm text-white">
              {post.author?.username || "Người dùng"}
            </p>
            <span className="text-neutral-600">•</span>
            <p className="text-xs text-neutral-500">
              {formatTime(post.created_at)}
            </p>
          </div>
        </div>

        {/* Menu 3 chấm */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-neutral-900 rounded-full transition-colors -mr-2"
          >
            <svg className="w-5 h-5 text-neutral-400" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="1.5"/>
              <circle cx="6" cy="12" r="1.5"/>
              <circle cx="18" cy="12" r="1.5"/>
            </svg>
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-10 bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl z-50 min-w-[160px] overflow-hidden">
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
                    className="w-full px-4 py-3 text-left text-red-400 hover:bg-neutral-800 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Xóa bài
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

          {/* Dots Indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToImage(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === currentImage 
                      ? "bg-white w-2 h-2" 
                      : "bg-white/40 w-1.5 h-1.5"
                  }`}
                  aria-label={`Chuyển đến ảnh ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-3 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLiked(!liked)}
            className="p-1 -ml-1 hover:opacity-60 transition-opacity"
          >
            <svg 
              className="w-6 h-6" 
              fill={liked ? "currentColor" : "none"}
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={liked ? 0 : 2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
          </button>
          
          <button className="p-1 hover:opacity-60 transition-opacity">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
          
          <button className="p-1 hover:opacity-60 transition-opacity">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
        
        <button className="p-1 -mr-1 hover:opacity-60 transition-opacity">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>

      {/* Footer */}
      <div className="px-3 pt-2 space-y-2">
        {/* Caption */}
        {post.caption && (
          <div className="text-sm leading-relaxed">
            <p
              ref={captionVisibleRef}
              className={`whitespace-pre-line text-white transition-all ${
                expanded ? "" : "line-clamp-2"
              }`}
            >
              <span className="font-semibold">
                {post.author?.username || "Người dùng"}
              </span>{" "}
              <span className="text-neutral-300">{post.caption}</span>
            </p>

            {isOverflowing && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-neutral-500 text-sm mt-0.5 hover:text-neutral-400 transition-colors"
              >
                {expanded ? "ít hơn" : "thêm"}
              </button>
            )}
          </div>
        )}

        {/* Service Link */}
        {post.custom_service_link ? (
          <Link
            href={post.custom_service_link}
            className="flex items-center gap-1.5 text-neutral-400 text-sm hover:text-white transition-colors group"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span className="truncate">Xem dịch vụ liên quan</span>
          </Link>
        ) : post.service ? (
          <Link
            href={`/services/${post.type}/${post.service.id}`}
            className="flex items-center gap-1.5 text-neutral-400 text-sm hover:text-white transition-colors group"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span className="truncate">Xem: {post.service.title}</span>
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