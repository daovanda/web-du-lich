"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

type PostImage = { image_url: string; id?: string };
type Author = { username?: string; avatar_url?: string };
type ServiceRef = { id?: string; title?: string };

type Post = {
  id: string;
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

export default function PostCard({ post, currentUser }: PostCardProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const images: PostImage[] = Array.isArray(post.images) ? post.images : [];

  // 🧠 Lấy tỷ lệ ảnh đầu tiên
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspectRatio) return; // chỉ lấy lần đầu
    const img = e.currentTarget;
    const ratio = img.naturalWidth / img.naturalHeight;
    setAspectRatio(ratio);
  };

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

      {/* Ảnh bài đăng — tự động fit tỷ lệ ảnh đầu tiên */}
      {images.length > 0 && (
        <div
          className="relative w-full bg-black rounded-2xl overflow-hidden border border-gray-800 shadow-md"
          style={{
            aspectRatio: aspectRatio ? `${aspectRatio}` : "1 / 1", // tạm 1:1 trước khi load
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
        {post.caption && (
          <p className="text-sm mb-1 leading-relaxed">
            <span className="font-semibold mr-1">
              {post.author?.username || "Người dùng"}:
            </span>
            {post.caption}
          </p>
        )}

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
