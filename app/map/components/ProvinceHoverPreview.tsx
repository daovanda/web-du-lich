"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { getProvincePhotos } from "@/app/map/api/api";
import { supabase } from "@/lib/supabase";
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
  const [provinceNotes, setProvinceNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [hoveredPhotoId, setHoveredPhotoId] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const fetchControllerRef = useRef<AbortController | null>(null);

  // ✅ Smart positioning
  const smartPosition = useMemo(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const elementWidth = 360;
    const elementHeight = 500;
    const padding = 20;

    let left = position.x + 20;
    let top = position.y - 100;

    if (left + elementWidth > viewportWidth - padding) {
      left = position.x - elementWidth - 20;
    }

    if (left < padding) {
      left = padding;
    }

    if (top < padding) {
      top = position.y + 20;
    }

    if (top + elementHeight > viewportHeight - padding) {
      top = viewportHeight - elementHeight - padding;
    }

    return { x: left, y: top };
  }, [position]);

  // ✅ Bridge
  const bridgeStyle = useMemo(() => {
    const previewX = smartPosition.x;
    const previewY = smartPosition.y;
    const cursorX = position.x;
    const cursorY = position.y;

    const minX = Math.min(cursorX, previewX);
    const maxX = Math.max(cursorX, previewX);
    const minY = Math.min(cursorY, previewY);
    const maxY = Math.max(cursorY, previewY);

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
      setProvinceNotes("");
      return;
    }

    const cached = photoCache.get(visitedProvinceId);
    const cacheTime = cacheTimestamps.get(visitedProvinceId);
    const isCacheValid = cached && cacheTime && (Date.now() - cacheTime < CACHE_DURATION);

    if (isCacheValid) {
      setPhotos(cached);
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
        
        const { data: provinceData } = await supabase
          .from('visited_provinces')
          .select('notes')
          .eq('id', visitedProvinceId)
          .single();
        
        if (!mountedRef.current) return;

        if (data) {
          photoCache.set(visitedProvinceId, data);
          cacheTimestamps.set(visitedProvinceId, Date.now());
          setPhotos(data);
        } else {
          setPhotos([]);
        }

        if (provinceData?.notes) {
          setProvinceNotes(provinceData.notes);
        }
      } catch (err) {
        if (!mountedRef.current) return;
        
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        
        console.error("Failed to fetch data:", err);
        setError("Không thể tải dữ liệu");
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
      {/* ✅ BRIDGE */}
      <div
        className="fixed z-[9999]"
        style={{
          ...bridgeStyle,
          pointerEvents: 'auto',
        }}
        onMouseEnter={() => {
          setIsHovering(true);
          onHoverChange(true);
        }}
        onMouseLeave={() => {
          setIsHovering(false);
          onHoverChange(false);
        }}
        aria-hidden="true"
      />

      {/* ✅ INSTAGRAM STYLE PREVIEW CARD */}
      <div
        ref={containerRef}
        className="fixed z-[9999] pointer-events-auto"
        style={{
          left: `${smartPosition.x}px`,
          top: `${smartPosition.y}px`,
        }}
        onMouseEnter={() => {
          setIsHovering(true);
          onHoverChange(true);
        }}
        onMouseLeave={() => {
          setIsHovering(false);
          onHoverChange(false);
        }}
        role="tooltip"
      >
        <div className="bg-[#000000] border border-[#262626] rounded-lg overflow-hidden w-[360px] shadow-2xl">
          
          {/* Header - Instagram style */}
          <div className="px-4 py-3 border-b border-[#262626]">
            <div className="flex items-center gap-3">
              {/* Location pin icon */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#dc2743] flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              
              {/* Province name */}
              <div className="flex-1 min-w-0">
                <h4 className="text-[15px] font-semibold text-white truncate">{provinceName}</h4>
                <p className="text-xs text-[#a8a8a8]">
                  {isVisited ? `${photos.length} ảnh` : 'Chưa ghé thăm'}
                </p>
              </div>

              {/* More button */}
              <button 
                onClick={onOpenFull}
                className="w-8 h-8 flex items-center justify-center hover:bg-[#262626] rounded-full transition-colors"
                aria-label="Xem thêm"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="1.5"/>
                  <circle cx="12" cy="12" r="1.5"/>
                  <circle cx="12" cy="19" r="1.5"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#262626] scrollbar-track-transparent">
            {!isVisited ? (
              // ✅ Not visited state
              <div className="text-center py-12 px-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#262626] flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#737373]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-sm text-white font-medium mb-1">Chưa ghé thăm</p>
                <p className="text-xs text-[#737373] mb-4">Nhấn vào bản đồ để đánh dấu</p>
              </div>
            ) : loading ? (
              // ✅ Loading state
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-[#262626] border-t-white rounded-full animate-spin"></div>
                  <p className="text-xs text-[#737373]">Đang tải...</p>
                </div>
              </div>
            ) : error ? (
              // ✅ Error state
              <div className="text-center py-12 px-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs text-[#737373] mb-4">{error}</p>
                <button
                  onClick={onOpenFull}
                  className="px-4 py-2 bg-white text-black rounded-lg text-xs font-semibold hover:bg-[#dbdbdb] transition-colors"
                >
                  Thử lại
                </button>
              </div>
            ) : (
              // ✅ Content with Grid Layout
              <div className="space-y-0">
                
                {/* Province Notes Section */}
                {provinceNotes && (
                  <div className="px-4 py-3 border-b border-[#262626]">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-[#737373] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      <p className="text-sm text-[#f5f5f5] leading-relaxed flex-1">
                        {provinceNotes}
                      </p>
                    </div>
                  </div>
                )}

                {/* ✅ Instagram Grid - 3 columns */}
                {photos.length > 0 ? (
                  <div className="p-1">
                    <div className="grid grid-cols-3 gap-1">
                      {photos.map((photo) => (
                        <div 
                          key={photo.id}
                          className="relative aspect-square bg-[#000000] group cursor-pointer"
                          onMouseEnter={() => setHoveredPhotoId(photo.id)}
                          onMouseLeave={() => setHoveredPhotoId(null)}
                          onClick={onOpenFull}
                        >
                          {/* Image */}
                          <img
                            src={photo.image_url}
                            alt={photo.title || `Ảnh ${provinceName}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23262626" width="200" height="200"/%3E%3Ctext fill="%23737373" font-family="system-ui" font-size="12" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EError%3C/text%3E%3C/svg%3E';
                            }}
                          />

                          {/* Hover Overlay - Show title/note if exists */}
                          {(photo.title || photo.note) && (
                            <div 
                              className={`absolute inset-0 bg-black/75 flex items-center justify-center p-2 transition-opacity duration-200 ${
                                hoveredPhotoId === photo.id ? 'opacity-100' : 'opacity-0'
                              }`}
                            >
                              <div className="text-center">
                                {photo.title && (
                                  <p className="text-xs font-semibold text-white mb-1 line-clamp-2">
                                    {photo.title}
                                  </p>
                                )}
                                {photo.note && (
                                  <p className="text-[10px] text-[#a8a8a8] line-clamp-2">
                                    {photo.note}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Icon overlay for photos without title/note */}
                          {!photo.title && !photo.note && hoveredPhotoId === photo.id && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-200">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  // ✅ No photos state
                  <div className="text-center py-12 px-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#262626] flex items-center justify-center">
                      <svg className="w-8 h-8 text-[#737373]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-white font-medium mb-1">Chưa có ảnh</p>
                    <p className="text-xs text-[#737373] mb-4">Thêm ảnh và kỷ niệm của bạn</p>
                    <button
                      onClick={onOpenFull}
                      className="px-6 py-2 bg-white text-black rounded-lg text-xs font-semibold hover:bg-[#dbdbdb] transition-colors"
                    >
                      Thêm ảnh
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer - View More Button */}
          {isVisited && !loading && !error && photos.length > 0 && (
            <div className="px-4 py-3 border-t border-[#262626]">
              <button
                onClick={onOpenFull}
                className="w-full py-2 bg-[#0095f6] hover:bg-[#1877f2] text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Xem tất cả {photos.length} ảnh
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Custom Scrollbar Styles */}
      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #262626;
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #363636;
        }
        
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #262626 transparent;
        }
      `}</style>
    </>
  );
}