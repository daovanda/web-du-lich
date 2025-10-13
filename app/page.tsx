"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import ResizableLayout from "@/components/ResizableLayout";
import PostCard from "@/components/PostCard";

export default function Page() {
  const [posts, setPosts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const limit = 5;
  const offsetRef = useRef(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Fetch posts with pagination
  const fetchPosts = useCallback(
    async (reset = false) => {
      if (loading) return;
      setLoading(true);

      try {
        const from = offsetRef.current;
        const to = offsetRef.current + limit - 1;

        const { data, error } = await supabase
          .from("posts")
          .select(
            `
          id,
          caption,
          created_at,
          author:profiles(id, username, avatar_url),
          service:services(id, title),
          images:post_images(id, image_url)
        `
          )
          .ilike("caption", `%${searchQuery}%`)
          .order("created_at", { ascending: false })
          .range(from, to);

        if (error) {
          console.error("Error fetching posts:", error);
        } else {
          const fetched = data || [];

          if (reset) {
            setPosts(fetched);
          } else {
            setPosts((prev) => [...prev, ...fetched]);
          }

          // Only increase offset by actual fetched count
          if (fetched.length > 0) {
            offsetRef.current += fetched.length;
          }

          // If fewer than limit fetched, no more pages
          if (fetched.length < limit) {
            setHasMore(false);
            // disconnect observer immediately to avoid further triggers
            if (observerRef.current) {
              observerRef.current.disconnect();
            }
          }
        }
      } catch (err) {
        console.error("Fetch posts error:", err);
      } finally {
        setLoading(false);
      }
    },
    [loading, searchQuery]
  );

  // Fetch user session
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      // supabase.auth.getSession() returns { data: { session } } in some versions
      const session = (data && (data as any).session) || (data as any);
      setUser(session?.user || null);
    };
    checkUser();
  }, []);

  // Reset + fetch first batch when query changes
  useEffect(() => {
    offsetRef.current = 0;
    setHasMore(true);
    fetchPosts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // IntersectionObserver callback for infinite scroll
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      // If there's already an observer, disconnect it
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      // If no more data, do not attach observer
      if (!node || !hasMore) return;

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchPosts();
        }
      });

      observerRef.current.observe(node);
    },
    [fetchPosts, hasMore, loading]
  );

  // cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

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
              // show "no posts" only when not loading
              !loading && <p className="text-gray-500 text-center">Chưa có bài đăng nào.</p>
            )}
          </div>

          {/* Loading / Sentinel: only render when there's more to load OR currently loading */}
          {(hasMore || loading) && (
            <div ref={loadMoreRef} className="text-center py-4">
              {loading ? (
                <p className="text-gray-400">Đang tải...</p>
              ) : (
                // if not loading but still hasMore false, this block won't render due to condition
                <p className="text-gray-500 text-sm">Đang chờ...</p>
              )}
            </div>
          )}
        </div>
      </div>
    </ResizableLayout>
  );
}
