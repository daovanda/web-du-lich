"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { apiRequest } from "@/lib/apiClient";
import ResizableLayout from "@/components/ResizableLayout";
import PostCard from "@/components/PostCard";
import SpecialEvents from "@/components/SpecialEvents";
import ServiceCard from "@/components/ServiceCard";
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

// 🧱 Skeleton service card (khám phá)
function ServiceSkeleton() {
  return (
    <div className="min-w-[260px] max-w-[260px] h-[300px] bg-gray-900 border border-gray-800 rounded-2xl animate-pulse" />
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

  // Services (khám phá)
  const [services, setServices] = useState<any[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  // Visibility map cho hiệu ứng fade in/out ServiceCard
  const [serviceVisibleMap, setServiceVisibleMap] = useState<Record<string, boolean>>({});
  const serviceItemObserverRef = useRef<IntersectionObserver | null>(null);

  const limit = 5;
  const observerRef = useRef<IntersectionObserver | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCursorRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);
  const currentSearchRef = useRef(searchQuery); // ✅ Track search query

  // 🧩 Cursor-based fetch - BỎ loading khỏi dependency
  const fetchPosts = useCallback(
    async (reset = false) => {
      if (isFetchingRef.current) {
        console.log("⚠️ Đang fetch, bỏ qua request");
        return;
      }

      isFetchingRef.current = true;
      setLoading(true);

      try {
        const params = new URLSearchParams({
          limit: String(limit),
          search: currentSearchRef.current.trim(),
        });
        if (!reset && lastCursorRef.current) params.set("cursor", lastCursorRef.current);
        const res = await apiRequest<{ posts: any[]; user: any }>(
          `/api/home/feed?${params.toString()}`,
          { fallbackMessage: "Không thể tải bài đăng" }
        );
        const fetched = res.posts || [];
        setUser((prev: any) => prev || res.user || null);

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
    []
  );

  // 🔎 Debounce search - cập nhật ref (giữ logic, chỉ ẩn UI tìm kiếm)
  useEffect(() => {
    currentSearchRef.current = searchQuery;

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
  }, [searchQuery]);

  // 🧱 IntersectionObserver - disconnect khi loading
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (!node) return;

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
        { threshold: 0.1, rootMargin: "0px 0px 100px 0px" }
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

  // 🔎 Fetch dịch vụ để “Khám phá”
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setServicesLoading(true);
        const res = await apiRequest<{ data: any[] }>("/api/home/services", {
          fallbackMessage: "Không thể tải danh sách dịch vụ",
        });
        if (mounted) setServices(res.data || []);
      } catch (e) {
        console.error("Fetch services error:", e);
        if (mounted) setServices([]);
      } finally {
        if (mounted) setServicesLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Quan sát từng ServiceCard để fade in/out khi vào/ra viewport
  const observeServiceItem = useCallback((node: HTMLDivElement | null, id: string) => {
    if (!node) return;

    if (!serviceItemObserverRef.current) {
      serviceItemObserverRef.current = new IntersectionObserver(
        (entries) => {
          setServiceVisibleMap((prev) => {
            const next = { ...prev };
            for (const entry of entries) {
              const targetId = (entry.target as HTMLDivElement).dataset.sid || "";
              if (!targetId) continue;
              next[targetId] = entry.isIntersecting;
            }
            return next;
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -5% 0px" }
      );
    }

    setServiceVisibleMap((prev) => (prev[id] === undefined ? { ...prev, [id]: false } : prev));
    serviceItemObserverRef.current.observe(node);
  }, []);

  // Cleanup observer cho services
  useEffect(() => {
    return () => {
      if (serviceItemObserverRef.current) {
        serviceItemObserverRef.current.disconnect();
        serviceItemObserverRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <ResizableLayout searchQuery={searchQuery} onSearchChange={setSearchQuery}>
        {/* 🔥 Special Events Section */}
        <div className="max-w-6xl mx-auto mt-4 px-4">
          <SpecialEvents isInitialLoad={isInitialLoad} />
        </div>

        {/* 🌟 Khám phá dịch vụ (horizontal scroll) */}
        <div className="max-w-6xl mx-auto mt-6 px-4">
          <div
            className={`flex items-center justify-between mb-3 transition-all duration-700 ${
              isInitialLoad ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
            }`}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-white">Khám phá dịch vụ</h2>
          </div>

          <div
            className={`relative transition-all duration-700 delay-100 ${
              isInitialLoad ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
            }`}
          >
            <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-2">
              {servicesLoading
                ? Array.from({ length: 6 }).map((_, i) => <ServiceSkeleton key={i} />)
                : services.length > 0
                ? services.map((service, index) => (
                    <div
                      key={service.id}
                      data-sid={service.id}
                      ref={(el) => observeServiceItem(el, service.id)}
                      className={`min-w-[260px] max-w-[260px] snap-start transform transition-all duration-700 ease-out ${
                        serviceVisibleMap[service.id] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                      }`}
                      style={{
                        transitionDelay: `${Math.min(index, 8) * 60}ms`,
                        willChange: "opacity, transform",
                      }}
                    >
                      <ServiceCard service={service} />
                    </div>
                  ))
                : (
                  <p className="text-gray-500 text-sm">Hiện chưa có dịch vụ.</p>
                )}
            </div>
          </div>
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
              Chia sẻ hành trình và kinh nghiệm du lịch của bạn,
              cùng khám phá những khoảnh khắc đầy cảm hứng với cộng đồng Việt Nam Travel.
            </p>
          </div>

          {/* Bài đăng - Kinh nghiệm du lịch */}
          <div
            className={`max-w-2xl mx-auto p-4 transition-all duration-1000 ease-out delay-300 ${
              isInitialLoad
                ? "opacity-0 translate-y-8"
                : "opacity-100 translate-y-0"
            }`}
          >
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

      {/* CSS để ẩn scrollbar (dùng chung cho services và gallery) */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}