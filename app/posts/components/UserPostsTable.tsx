"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/apiClient";
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
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return { color: "bg-green-500/10 text-green-400 border-green-500/20", label: "Đã duyệt" };
      case "pending":
        return { color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", label: "Chờ duyệt" };
      case "rejected":
        return { color: "bg-red-500/10 text-red-400 border-red-500/20", label: "Từ chối" };
      default:
        return { color: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20", label: "Không rõ" };
    }
  };

  // 🔹 Lấy danh sách bài đăng của user
  useEffect(() => {
    if (!currentUserId) return;

    const fetchUserPosts = async () => {
      setLoading(true);
      try {
        const response = await apiRequest<{ data: any[] }>(
          `/api/posts/user-posts?authorId=${currentUserId}`,
          { fallbackMessage: "Không thể tải bài đăng của bạn" }
        );
        const data = response.data || [];

        const normalized: UserPost[] =
          data.map((p: any) => ({
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
      } catch (error) {
        console.error("❌ Lỗi khi lấy bài đăng:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [currentUserId]);

  const userPosts = useMemo(() => posts, [posts]);

  // 🔹 Xử lý xóa bài
  const handleDelete = async (postId: string) => {
    if (!confirm("🗑 Bạn có chắc muốn xóa bài đăng này không?")) return;
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
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
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-black border border-neutral-800 rounded-xl p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-neutral-900 rounded-lg flex-shrink-0"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-neutral-900 rounded w-3/4"></div>
                <div className="h-3 bg-neutral-900 rounded w-1/2"></div>
                <div className="h-3 bg-neutral-900 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 🎯 UI chính
  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wide">
          {userPosts.length > 0 ? `${userPosts.length} bài đăng` : "Bài đăng"}
        </h2>
      </div>

      {/* Content */}
      {userPosts.length > 0 ? (
        <div className="space-y-3">
          {userPosts.map((p) => {
            const statusBadge = getStatusBadge(p.status ?? "pending");
            
            return (
              <div
                key={p.id}
                className="bg-black border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-all duration-200 relative group"
              >
                {/* Nút menu ⋮ */}
                <button
                  onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)}
                  className="absolute top-3 right-3 text-neutral-600 hover:text-white p-1.5 rounded-full hover:bg-neutral-900 transition-colors z-10"
                >
                  <MoreVertical size={16} />
                </button>

                {/* Dropdown menu */}
                {menuOpen === p.id && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-20" 
                      onClick={() => setMenuOpen(null)}
                    />
                    
                    {/* Menu */}
                    <div className="absolute top-10 right-3 bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl z-30 min-w-[140px]">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="flex items-center gap-2 px-4 py-2.5 text-red-400 hover:bg-neutral-800 w-full text-left text-sm font-medium transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Xóa bài
                      </button>
                    </div>
                  </>
                )}

                {/* Nội dung bài */}
                <div
                  onClick={() => onOpenPost?.(p)}
                  className="flex items-center gap-4 p-4 cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0 border border-neutral-800">
                    {p.image_urls?.[0] ? (
                      <Image
                        src={p.image_urls[0]}
                        alt="post"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-700">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 pr-8">
                    {/* Title */}
                    <h3 className="text-sm font-semibold text-white truncate mb-1">
                      {p.service_title || "Không có tiêu đề"}
                    </h3>
                    
                    {/* Caption */}
                    <p className="text-xs text-neutral-500 line-clamp-2 mb-2">
                      {p.caption || "Không có mô tả"}
                    </p>
                    
                    {/* Meta */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-neutral-600">
                        {formatDate(p.created_at)}
                      </span>
                      <span className="text-neutral-800">•</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusBadge.color} font-medium`}>
                        {statusBadge.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-4">
          <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">Chưa có bài đăng</h3>
          <p className="text-xs text-neutral-500">Hãy chia sẻ bài viết đầu tiên của bạn nhé!</p>
        </div>
      )}
    </div>
  );
}