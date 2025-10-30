"use client";

import { Post } from "../types";

type Props = {
  post: Post | null;
  onClose: () => void;
};

export default function PostDetailModal({ post, onClose }: Props) {
  if (!post) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Chi tiết bài đăng</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Nội dung */}
        <div className="p-6 space-y-5">
          {/* Hình ảnh */}
          {post.image_urls?.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {post.image_urls.map((url, i) => (
                <div
                  key={i}
                  className="rounded-lg overflow-hidden border border-gray-800"
                >
                  <img
                    src={url}
                    alt={`post-image-${i}`}
                    className="w-full h-48 object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 text-gray-500 rounded-lg p-10 text-center">
              Không có hình ảnh
            </div>
          )}

          {/* Thông tin cơ bản */}
          <div className="space-y-3">
            <p className="text-white font-medium">
              🏷 <span className="text-gray-300">{post.service_title || "Không có dịch vụ"}</span>
            </p>
            <p className="text-gray-400 text-sm">{post.caption || "Không có mô tả"}</p>
          </div>

          {/* Tác giả */}
          <div className="flex items-center gap-3 border-t border-gray-800 pt-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800">
              {post.author_avatar ? (
                <img
                  src={post.author_avatar}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  👤
                </div>
              )}
            </div>
            <div>
              <p className="text-white font-medium">
                {post.author_name || "Người dùng ẩn danh"}
              </p>
              <p className="text-xs text-gray-500">ID: {post.author_id}</p>
            </div>
          </div>

          {/* Trạng thái */}
          <div className="border-t border-gray-800 pt-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Trạng thái hiện tại:</p>
              <p
                className={`text-lg font-semibold ${
                  post.status === "approved"
                    ? "text-green-400"
                    : post.status === "pending"
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {post.status.toUpperCase()}
              </p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>Tạo: {new Date(post.created_at).toLocaleString("vi-VN")}</p>
              <p>Cập nhật: {new Date(post.updated_at).toLocaleString("vi-VN")}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
