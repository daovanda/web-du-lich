"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

type Suggestion = {
  id: string;
  title: string;
  location: string;
  image_url?: string;
};

// ✅ In-memory cache
let cachedSuggestions: Suggestion[] | null = null;
let isFetching = false;
let fetchPromise: Promise<void> | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút
let cacheTimestamp: number | null = null;

export default function Suggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(cachedSuggestions || []);
  const [isLoading, setIsLoading] = useState(!cachedSuggestions);
  const isInitialized = useRef(false);

  useEffect(() => {
    // ✅ Chỉ fetch một lần
    if (isInitialized.current) return;
    isInitialized.current = true;

    const fetchSuggestions = async () => {
      // ✅ Nếu đang fetch, đợi promise hiện tại
      if (isFetching && fetchPromise) {
        await fetchPromise;
        return;
      }

      // ✅ Kiểm tra cache còn hợp lệ không (5 phút)
      const now = Date.now();
      if (cachedSuggestions && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
        setSuggestions(cachedSuggestions);
        setIsLoading(false);
        return;
      }

      isFetching = true;
      setIsLoading(true);

      fetchPromise = (async () => {
        try {
          const { data, error } = await supabase.rpc("random_services");
          
          if (error) {
            console.error("Lỗi khi tải gợi ý:", error);
            
            // ✅ Nếu có lỗi nhưng có cache cũ, vẫn dùng cache
            if (cachedSuggestions) {
              setSuggestions(cachedSuggestions);
            }
            return;
          }

          if (data) {
            // ✅ Cập nhật cache
            cachedSuggestions = data;
            cacheTimestamp = Date.now();
            setSuggestions(data);
          }
        } catch (err) {
          console.error("Error fetching suggestions:", err);
          
          // ✅ Fallback to cache nếu có
          if (cachedSuggestions) {
            setSuggestions(cachedSuggestions);
          }
        } finally {
          setIsLoading(false);
          isFetching = false;
          fetchPromise = null;
        }
      })();

      await fetchPromise;
    };

    fetchSuggestions();
  }, []);

  if (isLoading && suggestions.length === 0) {
    return (
      <div>
        <h3 className="font-semibold mb-3 text-white">Gợi ý cho bạn</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3 p-2">
              <div className="w-10 h-10 rounded bg-gray-800 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-800 rounded animate-pulse w-3/4" />
                <div className="h-2 bg-gray-800 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="font-semibold mb-3 text-white">Gợi ý cho bạn</h3>
      <div className="space-y-3">
        {suggestions.map((s) => (
          <div
            key={s.id}
            className="flex items-center space-x-3 hover:bg-gray-800/30 p-2 rounded-lg transition cursor-pointer"
          >
            <img
              src={s.image_url || "/next.svg"}
              alt={s.title}
              className="w-10 h-10 rounded object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/next.svg";
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{s.title}</p>
              <p className="text-xs text-gray-400 truncate">{s.location}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}