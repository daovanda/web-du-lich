"use client";

import { useState } from "react";
import { usePosts } from "./hooks/usePosts";
import { Post } from "./types";
import PostsTable from "./components/PostsTable";
import PostDetailModal from "./components/PostDetailModal";
import PostFilters from "./components/PostFilters";
import SummaryCards from "./components/SummaryCards";



export default function AdminPostsPage() {
  const { posts, stats, loading, updateStatus } = usePosts();

  // Bộ lọc & phân trang
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [dateFilter, setDateFilter] = useState<"all" | "7d" | "30d">("all");
  const [page, setPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  return (
    <div className="bg-black text-gray-100 min-h-screen p-6 space-y-10">
      <h1 className="text-3xl font-bold text-center">Quản lý bài đăng</h1>

    {/*  <SummaryCards summary={stats} /> */}


      <PostFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
      />


      {/* Bảng bài đăng */}
      <PostsTable
        posts={posts}
        loading={loading}
        updateStatus={updateStatus}
        search={search}
        statusFilter={statusFilter}
        dateFilter={dateFilter}
        page={page}
        setPage={setPage}
        openPostDetail={setSelectedPost}
      />

      {/* Modal chi tiết bài đăng */}
      <PostDetailModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  );
}
