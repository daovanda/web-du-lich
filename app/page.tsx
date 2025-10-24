"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import ResizableLayout from "@/components/ResizableLayout";
import PostCard from "@/components/PostCard";
import SpecialEvents from "@/components/SpecialEvents";

import { Analytics } from "@vercel/analytics/react"; // ✅ Thêm import Analytics
// 🧱 Component hiển thị skeleton shimmer
function PostSkeleton() {
  return (
    <div className="animate-pulse bg-gray-900 rounded-xl p-4 border border-gray-800">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-800"></div>
        <div className="flex-1">
          <div className="h-3 w-24 bg-gray-800 rounded mb-2"></div>
          <div className="h-2 w-16 bg-gray-800 rounded"></div>
        </div>
      </div>
      <div className="h-4 w-3/4 bg-gray-800 rounded mb-3"></div>
      <div className="h-4 w-1/2 bg-gray-800 rounded mb-4"></div>
      <div className="h-48 bg-gray-800 rounded-lg"></div>
    </div>
  );
}

export default function Page() {
  const [posts, setPosts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const limit = 5;
  const offsetRef = useRef(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🧩 Fetch posts with pagination
  const fetchPosts = useCallback(
    async (reset = false) => {
      if (loading) return;

      // Nếu không reset và đã hết bài => không fetch thêm
      if (!reset && !hasMore) return;

      setLoading(true);

      try {
        const from = reset ? 0 : offsetRef.current;
        const to = from + limit - 1;

        const query = supabase
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
          .order("created_at", { ascending: false })
          .range(from, to);

        if (searchQuery.trim()) {
          query.ilike("caption", `%${searchQuery}%`);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching posts:", error);
          setLoading(false);
          return;
        }

        const fetched = data || [];

        if (reset) {
          setPosts(fetched);
          offsetRef.current = fetched.length;
        } else {
          setPosts((prev) => {
            const ids = new Set(prev.map((p) => p.id));
            const unique = fetched.filter((p) => !ids.has(p.id));
            offsetRef.current += unique.length;
            return [...prev, ...unique];
          });
        }

        // ✅ Nếu số lượng trả về < limit => hết dữ liệu
        if (fetched.length < limit) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } catch (err) {
        console.error("Fetch posts error:", err);
      } finally {
        setLoading(false);
      }
    },
    [loading, searchQuery, hasMore]
  );

  // 🧠 Fetch user session
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user || null);
    };
    checkUser();
  }, []);

  // 🔎 Debounce search
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      offsetRef.current = 0;
      setHasMore(true);
      fetchPosts(true);
    }, 350);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, fetchPosts]);

  // 🧱 IntersectionObserver for infinite scroll
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const first = entries[0];
          if (first.isIntersecting && !loading && hasMore) {
            fetchPosts();
          }
        },
        { threshold: 0.5 }
      );

      observerRef.current.observe(node);
    },
    [fetchPosts, hasMore, loading]
  );

  // 🧹 Cleanup observer
  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  // ✨ Smooth animation start
  useEffect(() => {
    const t = requestAnimationFrame(() => setIsInitialLoad(false));
    return () => cancelAnimationFrame(t);
  }, []);

  // 🧭 Fetch lần đầu
  useEffect(() => {
    fetchPosts(true);
  }, []);

  return (
    <>
      <ResizableLayout searchQuery={searchQuery} onSearchChange={setSearchQuery}>
        {/* 🔥 Special Events Section */}
        <div className="max-w-6xl mx-auto mt-8 px-4">
          <SpecialEvents />
        </div>

        <div className="text-white mt-16 md:mt-0">
          {/* Tagline */}
          <div
            className={`max-w-3xl mx-auto px-6 text-center py-8 transition-all duration-1000 ease-out ${
              isInitialLoad
                ? "opacity-0 translate-y-8"
                : "opacity-100 translate-y-0"
            }`}
          >
 {/*           <h1 className="text-3xl font-extrabold mb-3">
              Chạm – Kết nối – Trải nghiệm
            </h1> */}
            <p className="text-gray-400 text-sm sm:text-base">
              Chia sẻ hành trình của bạn, khám phá những khoảnh khắc du lịch đầy
              cảm hứng cùng cộng đồng Việt Nam Travel.
            </p>
          </div>


          {/* Bài đăng */}
          <div
            className={`max-w-2xl mx-auto p-6 transition-all duration-1000 ease-out delay-300 ${
              isInitialLoad
                ? "opacity-0 translate-y-8"
                : "opacity-100 translate-y-0"
            }`}
          >
            {/* Thanh tìm kiếm */}
            <div
              className={`my-4 transition-all duration-700 ease-out delay-500 ${
                isInitialLoad
                  ? "opacity-0 translate-y-4"
                  : "opacity-100 translate-y-0"
              }`}
            >
              <input
                type="text"
                placeholder="Tìm kiếm bài đăng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-gray-500 transition-all duration-300 ease-out hover:border-gray-600"
              />
            </div>

            <h2
              className={`text-xl font-bold mb-4 transition-all duration-700 ease-out delay-700 ${
                isInitialLoad
                  ? "opacity-0 translate-y-4"
                  : "opacity-100 translate-y-0"
              }`}
            >
              Bài đăng mới nhất
            </h2>

            {/* 🧱 Hiển thị Skeleton nếu đang tải và chưa có dữ liệu */}
            {loading && posts.length === 0 ? (
              <div className="flex flex-col gap-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <PostSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {posts.length > 0 ? (
                  posts.map((post, index) => (
                    <div
                      key={post.id}
                      className={`transition-all duration-600 ease-out ${
                        isInitialLoad
                          ? "opacity-0 translate-y-6"
                          : "opacity-100 translate-y-0"
                      }`}
                      style={{
                        transitionDelay: `${800 + index * 100}ms`,
                      }}
                    >
                      <PostCard post={post} currentUser={user} />
                    </div>
                  ))
                ) : (
                  !loading && (
                    <p
                      className={`text-gray-500 text-center transition-all duration-700 ease-out delay-900 ${
                        isInitialLoad
                          ? "opacity-0 translate-y-4"
                          : "opacity-100 translate-y-0"
                      }`}
                    >
                      Chưa có bài đăng nào.
                    </p>
                  )
                )}
              </div>
            )}

            {/* Loading / Sentinel */}
            <div
              ref={loadMoreRef}
              className={`text-center py-4 transition-all duration-500 ease-out ${
                loading ? "opacity-100 scale-100" : "opacity-70 scale-95"
              }`}
            >
              {loading && posts.length > 0 ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  <p className="text-gray-400">Đang tải thêm...</p>
                </div>
              ) : !hasMore && posts.length > 0 ? (
                <p className="text-gray-500 text-sm">Đã hiển thị tất cả bài đăng.</p>
              ) : (
                <p className="text-gray-500 text-sm">Đang chờ...</p>
              )}
            </div>
          </div>
        </div>
      </ResizableLayout>
      
      {/* ✅ Vercel Analytics (ghi nhận truy cập & tương tác) */}
      <Analytics />
    </>
  );
}

