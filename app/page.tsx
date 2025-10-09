"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ResizableLayout from "@/components/ResizableLayout";
import PostCard from "@/components/PostCard";

export default function Page() {
  const [posts, setPosts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          id,
          caption,
          created_at,
          author:profiles(id, username, avatar_url),
          service:services(id, title),
          images:post_images(id, image_url)
        `)
        .ilike("caption", `%${searchQuery}%`)
        .order("created_at", { ascending: false });

      if (error) console.error("Error fetching posts:", error);
      else setPosts(data || []);
    };

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    fetchPosts();
    checkUser();
  }, [searchQuery]);

  return (
    <ResizableLayout searchQuery={searchQuery} onSearchChange={setSearchQuery}>
      <div className="text-white mt-16 md:mt-0">
        {/* Tagline */}
        <div className="max-w-3xl mx-auto px-6 text-center py-8">
          <h1 className="text-3xl font-extrabold mb-3">
            Chạm – Kết nối – Trải nghiệm
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Chia sẻ hành trình của bạn, khám phá những khoảnh khắc du lịch đầy cảm hứng
            cùng cộng đồng Việt Nam Travel.
          </p>
        </div>

        {/* Bài đăng */}
        <div className="max-w-2xl mx-auto p-6">
          {/* Thanh tìm kiếm */}
          <div className="my-4">
            <input
              type="text"
              placeholder="Tìm kiếm bài đăng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-gray-500"
            />
          </div>

          <h2 className="text-xl font-bold mb-4">Bài đăng mới nhất</h2>

          <div className="flex flex-col gap-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post.id} post={post} currentUser={user} />
              ))
            ) : (
              <p className="text-gray-500 text-center">Chưa có bài đăng nào.</p>
            )}
          </div>
        </div>
      </div>
    </ResizableLayout>
  );
}
