"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { getProvincePhotos } from "@/app/map/api/api";
import type { ProvincePhoto } from "@/app/map/types/types";

type ProvinceHoverPreviewProps = {
  visitedProvinceId: string | null;
  provinceName: string;
  position: { x: number; y: number };
  onOpenFull: () => void;
  isVisited: boolean;
  onHoverChange: (isHovering: boolean) => void;
};

// ✅ Cache outside component
const photoCache = new Map<string, ProvincePhoto[]>();
const cacheTimestamps = new Map<string, number>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function ProvinceHoverPreview({
  visitedProvinceId,
  provinceName,
  position,
  onOpenFull,
  isVisited,
  onHoverChange,
}: ProvinceHoverPreviewProps) {
  const [photos, setPhotos] = useState<ProvincePhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const fetchControllerRef = useRef<AbortController | null>(null);

  // ✅ Smart positioning với padding để tránh overflow
  const smartPosition = useMemo(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const elementWidth = 288; // w-72
    const elementHeight = 300;
    const padding = 20;

    let left = position.x + 20;
    let top = position.y - 100;

    // Prevent overflow right
    if (left + elementWidth > viewportWidth - padding) {
      left = position.x - elementWidth - 20;
    }

    // Prevent overflow left
    if (left < padding) {
      left = padding;
    }

    // Prevent overflow top
    if (top < padding) {
      top = position.y + 20;
    }

    // Prevent overflow bottom
    if (top + elementHeight > viewportHeight - padding) {
      top = viewportHeight - elementHeight - padding;
    }

    return { x: left, y: top };
  }, [position]);

  // ✅ Tính toán bridge position (khoảng trống giữa cursor và preview)
  const bridgeStyle = useMemo(() => {
    const previewX = smartPosition.x;
    const previewY = smartPosition.y;
    const cursorX = position.x;
    const cursorY = position.y;

    // Tạo một hình chữ nhật nối giữa cursor và preview
    const minX = Math.min(cursorX, previewX);
    const maxX = Math.max(cursorX, previewX + 288); // 288 = width của preview
    const minY = Math.min(cursorY, previewY);
    const maxY = Math.max(cursorY, previewY + 300); // 300 = approx height

    return {
      left: `${minX}px`,
      top: `${minY}px`,
      width: `${maxX - minX}px`,
      height: `${maxY - minY}px`,
    };
  }, [position, smartPosition]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isVisited || !visitedProvinceId) {
      setPhotos([]);
      return;
    }

    // ✅ Check cache first
    const cached = photoCache.get(visitedProvinceId);
    const cacheTime = cacheTimestamps.get(visitedProvinceId);
    const isCacheValid = cached && cacheTime && (Date.now() - cacheTime < CACHE_DURATION);

    if (isCacheValid) {
      setPhotos(cached.slice(0, 3));
      return;
    }

    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
    }
    fetchControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const data = await getProvincePhotos(visitedProvinceId);
        
        if (!mountedRef.current) return;

        if (data) {
          photoCache.set(visitedProvinceId, data);
          cacheTimestamps.set(visitedProvinceId, Date.now());
          setPhotos(data.slice(0, 3));
        } else {
          setPhotos([]);
        }
      } catch (err) {
        if (!mountedRef.current) return;
        
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        
        console.error("Failed to fetch photos:", err);
        setError("Không thể tải ảnh");
        setPhotos([]);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    })();

    return () => {
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
      }
    };
  }, [visitedProvinceId, isVisited]);

  return (
    <>
      {/* ✅ BRIDGE ELEMENT - invisible area giữa cursor và preview */}
      <div
        className="fixed z-40"
        style={{
          ...bridgeStyle,
          pointerEvents: 'auto',
          // 🔍 TEMPORARY: Uncomment để thấy bridge
          // backgroundColor: 'rgba(255, 0, 0, 0.2)',
          // border: '2px dashed red',
        }}
        onMouseEnter={() => {
          console.log("🌉 Mouse entered BRIDGE");
          onHoverChange(true);
        }}
        onMouseLeave={() => {
          console.log("🌉 Mouse left BRIDGE");
          onHoverChange(false);
        }}
        aria-hidden="true"
      />

      {/* PREVIEW CARD */}
      <div
        ref={containerRef}
        className="fixed z-40 pointer-events-auto"
        style={{
          left: `${smartPosition.x}px`,
          top: `${smartPosition.y}px`,
        }}
        onMouseEnter={() => {
          console.log("🎨 Mouse entered PREVIEW CARD");
          onHoverChange(true);
        }}
        onMouseLeave={() => {
          console.log("🎨 Mouse left PREVIEW CARD");
          onHoverChange(false);
        }}
        role="tooltip"
        aria-label={`Thông tin về ${provinceName}`}
      >
        <div className="bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden w-72 transition-all duration-200 hover:border-emerald-600 hover:shadow-emerald-500/30">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 flex items-center gap-2">
            <svg className="w-4 h-4 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h4 className="text-sm font-semibold text-white truncate">{provinceName}</h4>
          </div>

          {/* Content */}
          <div className="p-4">
            {!isVisited ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-neutral-800 flex items-center justify-center">
                  <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-white mb-1">Chưa ghé thăm</p>
                <p className="text-xs text-neutral-500 mb-3">Nhấn để đánh dấu đã đi</p>
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-900/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs text-neutral-500 mb-3">{error}</p>
                <button
                  onClick={onOpenFull}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  Thử lại
                </button>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-6">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
                  <p className="text-xs text-neutral-500">Đang tải...</p>
                </div>
              </div>
            ) : photos.length > 0 ? (
              <div className="space-y-3">
                {/* Photo preview grid */}
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="aspect-square rounded-lg overflow-hidden bg-neutral-800 border border-neutral-700"
                    >
                      <img
                        src={photo.image_url}
                        alt={`Ảnh ${provinceName}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={onOpenFull}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
                    aria-label={`Xem chi tiết ${provinceName}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Xem chi tiết
                  </button>
                  <button
                    onClick={onOpenFull}
                    className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
                    title="Thêm ảnh"
                    aria-label="Thêm ảnh mới"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-neutral-800 flex items-center justify-center">
                  <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xs text-neutral-500 mb-3">Chưa có ảnh nào</p>
                <button
                  onClick={onOpenFull}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
                  aria-label={`Thêm ảnh và ghi chú cho ${provinceName}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Thêm ảnh & ghi chú
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}