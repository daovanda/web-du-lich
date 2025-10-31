"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import ResizableLayout from "@/components/ResizableLayout";
import PostCard from "@/components/PostCard";
import SpecialEvents from "@/components/SpecialEvents";
import { Analytics } from "@vercel/analytics/react";

// 🧱 Skeleton shimmer
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
  const [initialLoaded, setInitialLoaded] = useState(false);

  const limit = 5;
  const observerRef = useRef<IntersectionObserver | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCursorRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);
  const currentSearchRef = useRef(searchQuery); // ✅ Track search query

  // 🧩 Cursor-based fetch - BỎ loading khỏi dependency
  const fetchPosts = useCallback(
    async (reset = false) => {
      // ✅ Kiểm tra chặt chẽ hơn
      if (isFetchingRef.current) {
        console.log("⚠️ Đang fetch, bỏ qua request");
        return;
      }

      isFetchingRef.current = true;
      setLoading(true);

      try {
        let query = supabase
          .from("posts")
          .select(
            `
            id,
            caption,
            created_at,
            custom_service_link,
            author:profiles(id, username, avatar_url),
            service:services(id, title, type),
            images:post_images(id, image_url)
          `
          )
          .order("created_at", { ascending: false })
          .limit(limit);

        if (!reset && lastCursorRef.current) {
          query = query.lt("created_at", lastCursorRef.current);
        }

        // ✅ Dùng currentSearchRef thay vì searchQuery
        if (currentSearchRef.current.trim()) {
          query = query.ilike("caption", `%${currentSearchRef.current}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        const fetched = data || [];

        if (reset) {
          setPosts(fetched);
          lastCursorRef.current =
            fetched.length > 0 ? fetched[fetched.length - 1].created_at : null;
          setHasMore(fetched.length === limit);
          setInitialLoaded(true);
        } else {
          setPosts((prev) => {
            const ids = new Set(prev.map((p) => p.id));
            const unique = fetched.filter((p) => !ids.has(p.id));
            return [...prev, ...unique];
          });

          if (fetched.length > 0) {
            lastCursorRef.current = fetched[fetched.length - 1].created_at;
          }

          setHasMore(fetched.length === limit);
        }
      } catch (err) {
        console.error("Fetch posts error:", err);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [] // ✅ BỎ HẾT dependency để tránh recreate
  );

  // 🧠 Fetch user session
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user || null);
    };
    checkUser();
  }, []);

  // 🔎 Debounce search - cập nhật ref
  useEffect(() => {
    currentSearchRef.current = searchQuery; // ✅ Sync ref

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    searchTimeoutRef.current = setTimeout(() => {
      lastCursorRef.current = null;
      setHasMore(true);
      setInitialLoaded(false);
      fetchPosts(true);
    }, 350);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]); // ✅ Chỉ depend vào searchQuery

  // 🧱 IntersectionObserver - disconnect khi loading
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      // ✅ Disconnect observer cũ trước
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (!node) return;

      // ✅ Không tạo observer nếu đang loading hoặc hết data
      if (loading || !hasMore || !initialLoaded) {
        return;
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const first = entries[0];
          if (first.isIntersecting && !isFetchingRef.current) {
            console.log("🔄 Trigger load more");
            fetchPosts(false);
          }
        },
        { threshold: 0.1, rootMargin: "0px 0px 100px 0px" } // ✅ Giảm rootMargin
      );

      observerRef.current.observe(node);
    },
    [loading, hasMore, initialLoaded, fetchPosts]
  );

  // 🧹 Cleanup observer
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // ✨ Animation start
  useEffect(() => {
    const t = requestAnimationFrame(() => setIsInitialLoad(false));
    return () => cancelAnimationFrame(t);
  }, []);

  // 🧭 Fetch lần đầu
  useEffect(() => {
    fetchPosts(true);
  }, [fetchPosts]);

  return (
    <>
      <ResizableLayout searchQuery={searchQuery} onSearchChange={setSearchQuery}>
        {/* 🔥 Special Events Section */}
        <div className="max-w-6xl mx-auto mt-4 px-4">
          <SpecialEvents isInitialLoad={isInitialLoad} />
        </div>

        <div className="text-white mt-0">
          <div
            className={`max-w-3xl mx-auto px-6 text-center py-4 transition-all duration-1000 ease-out ${
              isInitialLoad
                ? "opacity-0 translate-y-8"
                : "opacity-100 translate-y-0"
            }`}
          >
            <p className="text-gray-400 text-sm sm:text-base">
              Chia sẻ hành trình của bạn, khám phá những khoảnh khắc du lịch đầy
              cảm hứng cùng cộng đồng Việt Nam Travel.
            </p>
          </div>

          {/* Bài đăng */}
          <div
            className={`max-w-2xl mx-auto p-4 transition-all duration-1000 ease-out delay-300 ${
              isInitialLoad
                ? "opacity-0 translate-y-8"
                : "opacity-100 translate-y-0"
            }`}
          >
            {/* Thanh tìm kiếm */}
            <div
              className={`my-2 transition-all duration-700 ease-out delay-500 ${
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

            {/* Posts List */}
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
                    <p className="text-gray-500 text-center py-4">
                      Chưa có bài đăng nào.
                    </p>
                  )
                )}
              </div>
            )}

            {/* ✅ Sentinel - chỉ hiện khi KHÔNG loading và còn data */}
            {hasMore && !loading && initialLoaded && posts.length > 0 && (
              <div ref={loadMoreRef} className="h-20" />
            )}

            {/* Loading indicator - tách riêng */}
            {loading && posts.length > 0 && (
              <div className="text-center py-6">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  <p className="text-gray-400">Đang tải thêm...</p>
                </div>
              </div>
            )}

            {/* End message */}
            {!hasMore && posts.length > 0 && !loading && (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">
                  🎉 Bạn đã xem hết tất cả bài đăng.
                </p>
              </div>
            )}
          </div>
        </div>
      </ResizableLayout>

      {/* ✅ Vercel Analytics */}
      <Analytics />
    </>
  );
}