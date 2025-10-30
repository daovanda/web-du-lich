"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { UserPost } from "../types";
import { deletePost } from "../actions/postActions";
import { MoreVertical } from "lucide-react";
import toast from "react-hot-toast";

type UserPostsTableProps = {
  currentUserId: string;
  onOpenPost?: (post: UserPost) => void;
};

export default function UserPostsTable({ currentUserId, onOpenPost }: UserPostsTableProps) {
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState<string | null>(null); // 🔹 Lưu ID bài đăng đang mở menu

  // 🧩 Định dạng thời gian
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    if (diffInHours < 1) return "Vừa xong";
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-500";
      case "pending":
        return "text-yellow-500";
      case "rejected":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  // 🔹 Lấy danh sách bài đăng của user
  useEffect(() => {
    if (!currentUserId) return;

    const fetchUserPosts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select(`
          id,
          caption,
          created_at,
          status,
          author_id,
          custom_service_link,
          service:services(id, title, type),
          images:post_images(image_url)
        `)
        .eq("author_id", currentUserId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Lỗi khi lấy bài đăng:", error);
        setPosts([]);
      } else {
        const normalized: UserPost[] =
          data?.map((p: any) => ({
            id: p.id,
            caption: p.caption,
            created_at: p.created_at,
            status: p.status,
            author_id: p.author_id,
            custom_service_link: p.custom_service_link,
            service_id: p.service?.id || null,
            service_title: p.service?.title || null,
            service_type: p.service?.type || null,
            image_urls: p.images?.map((img: any) => img.image_url) || [],
          })) || [];

        setPosts(normalized);
      }
      setLoading(false);
    };

    fetchUserPosts();
  }, [currentUserId]);

  const userPosts = useMemo(() => posts, [posts]);

  // 🔹 Xử lý xóa bài
  const handleDelete = async (postId: string) => {
    if (!confirm("🗑 Bạn có chắc muốn xóa bài đăng này không?")) return;
    try {
      await deletePost(postId, currentUserId);
      setPosts((prev) => prev.filter((p) => p.id !== postId)); // Cập nhật UI ngay
      toast.success("✅ Bài đăng đã được xóa thành công!");
    } catch (error) {
      console.error(error);
      toast.error("❌ Xóa bài thất bại!");
    } finally {
      setMenuOpen(null);
    }
  };

  // 🔹 UI Loading
  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Bài đăng của bạn</h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-black border border-gray-800 rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gray-800 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 🎯 UI chính
  return (
    <div className="space-y-4 relative">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Bài đăng của bạn ({userPosts.length})
        </h2>
      </div>

      {userPosts.length > 0 ? (
        <div className="space-y-3">
          {userPosts.map((p) => (
            <div
              key={p.id}
              className="bg-black border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors relative"
            >
              {/* Nút menu ⋮ */}
              <button
                onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-white p-1"
              >
                <MoreVertical size={18} />
              </button>

              {/* Dropdown menu */}
              {menuOpen === p.id && (
                <div className="absolute top-8 right-2 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="px-4 py-2 text-red-400 hover:bg-gray-800 rounded-md w-full text-left text-sm"
                  >
                    🗑 Xóa bài đăng
                  </button>
                </div>
              )}

              {/* Nội dung bài */}
              <div
                onClick={() => onOpenPost?.(p)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                    {p.image_urls?.[0] ? (
                      <Image
                        src={p.image_urls[0]}
                        alt="post"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        🖼
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white truncate">
                        {p.service_title || "Không có tiêu đề"}
                      </p>
                      <span className={`text-xs ${getStatusColor(p.status ?? "pending")}`}>●</span>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-1">
                      {p.caption || "Không có mô tả"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {formatDate(p.created_at)} •{" "}
                      <span
                        className={`${
                          p.status === "approved"
                            ? "text-green-400"
                            : p.status === "pending"
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {p.status === "approved"
                          ? "Đã duyệt"
                          : p.status === "pending"
                          ? "Chờ duyệt"
                          : "Từ chối"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            📰
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Chưa có bài đăng</h3>
          <p className="text-gray-400 text-sm">Hãy chia sẻ bài viết đầu tiên của bạn nhé!</p>
        </div>
      )}
    </div>
  );
}
