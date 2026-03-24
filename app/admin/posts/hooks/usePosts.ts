"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/apiClient";
import { Post, PostStats } from "../types";

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<PostStats>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await apiRequest<{ data: Post[] }>("/api/admin/posts", {
        fallbackMessage: "Không thể tải danh sách bài viết",
      });
      const data = response.data || [];
      setPosts(data);
      const total = data.length;
      const approved = data.filter((p) => p.status === "approved").length;
      const pending = data.filter((p) => p.status === "pending").length;
      const rejected = data.filter((p) => p.status === "rejected").length;
      setStats({ total, approved, pending, rejected });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await apiRequest(`/api/admin/posts/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      fallbackMessage: "Không thể cập nhật trạng thái bài viết",
    });
    fetchPosts();
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return { posts, stats, loading, updateStatus };
}
